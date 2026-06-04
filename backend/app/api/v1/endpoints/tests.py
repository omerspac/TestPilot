from typing import List
import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import joinedload
from datetime import datetime

from ....core.database import get_db, SessionLocal
from ....models.user import User
from ....models.website import Website as WebsiteModel, TestRun as TestRunModel, Issue as IssueModel, Report as ReportModel
from ....schemas.website import TestRun, TestRunCreate
from ...deps import get_current_user
from ....services.engine.crawler import Crawler
from ....services.report_service import ReportService

router = APIRouter()

async def update_test_progress(test_run_id: int, progress: int, db_session_factory):
    async with db_session_factory() as db:
        await db.execute(
            update(TestRunModel)
            .where(TestRunModel.id == test_run_id)
            .values(progress=progress)
        )
        await db.commit()

async def run_website_test(test_run_id: int, website_id: int, url: str, db_session_factory):
    async with db_session_factory() as db:
        try:
            # Define progress callback
            async def progress_cb(p: int):
                await update_test_progress(test_run_id, p, db_session_factory)

            crawler = Crawler(website_id=website_id, base_url=url, progress_callback=progress_cb)
            results = await crawler.run_test()
            
            # Update Test Run with completion data
            result = await db.execute(select(TestRunModel).where(TestRunModel.id == test_run_id))
            test_run = result.scalar_one()
            test_run.status = "completed"
            test_run.progress = 100
            test_run.completed_at = datetime.utcnow()
            
            # Convert metrics to dict for JSON storage
            metrics_dict = {url: m.model_dump() for url, m in results.metrics.items()}
            test_run.metrics = metrics_dict
            
            # Save Issues and collect them for the report
            db_issues = []
            for issue in results.issues:
                db_issue = IssueModel(
                    test_run_id=test_run_id,
                    title=f"{issue.type.replace('_', ' ').title()}",
                    description=issue.description,
                    severity=issue.severity,
                    category=issue.type,
                    page_url=issue.page_url
                )
                db.add(db_issue)
                db_issues.append(db_issue)
            
            # Flush to get IDs if needed, but here we just need the objects for the AI
            await db.flush()

            # Generate AI Report
            report_service = ReportService()
            ai_report_data = await report_service.generate_report(db_issues, metrics_dict)
            
            # Save Report
            db_report = ReportModel(
                test_run_id=test_run_id,
                summary=ai_report_data["summary"],
                ai_analysis=json.dumps(ai_report_data)
            )
            db.add(db_report)
            
            await db.commit()
        except Exception as e:
            print(f"Test Execution Error: {str(e)}")
            result = await db.execute(select(TestRunModel).where(TestRunModel.id == test_run_id))
            test_run = result.scalar_one_or_none()
            if test_run:
                test_run.status = "failed"
                await db.commit()

@router.post("/{website_id}/run", response_model=TestRun)
async def trigger_test_run(
    website_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    result = await db.execute(
        select(WebsiteModel).where(
            WebsiteModel.id == website_id,
            WebsiteModel.user_id == current_user.id
        )
    )
    website = result.scalar_one_or_none()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    # Create Test Run record
    db_test_run = TestRunModel(
        website_id=website_id, 
        status="running",
        progress=0,
        started_at=datetime.utcnow()
    )
    db.add(db_test_run)
    await db.commit()
    await db.refresh(db_test_run)
    
    # Reload with report relationship to ensure it's loaded for serialization
    result = await db.execute(
        select(TestRunModel)
        .where(TestRunModel.id == db_test_run.id)
        .options(joinedload(TestRunModel.report))
    )
    db_test_run = result.scalar_one()
    
    background_tasks.add_task(run_website_test, db_test_run.id, website.id, website.url, SessionLocal)
    
    return db_test_run

@router.get("/", response_model=List[TestRun])
async def get_all_test_runs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(TestRunModel)
        .join(WebsiteModel)
        .where(WebsiteModel.user_id == current_user.id)
        .options(joinedload(TestRunModel.report))
        .order_by(TestRunModel.started_at.desc())
    )
    return result.scalars().all()

@router.get("/{website_id}/history", response_model=List[TestRun])
async def get_test_history(
    website_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(TestRunModel)
        .where(TestRunModel.website_id == website_id)
        .options(joinedload(TestRunModel.report))
        .order_by(TestRunModel.started_at.desc())
    )
    return result.scalars().all()

@router.get("/status/{test_run_id}", response_model=TestRun)
async def get_test_run_status(
    test_run_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if the test run exists and belongs to a website owned by the current user
    result = await db.execute(
        select(TestRunModel)
        .join(WebsiteModel)
        .where(
            TestRunModel.id == test_run_id,
            WebsiteModel.user_id == current_user.id
        )
        .options(joinedload(TestRunModel.report))
    )
    test_run = result.scalar_one_or_none()
    if not test_run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return test_run
