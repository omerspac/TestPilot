from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from sqlalchemy.orm import joinedload

from ....core.database import get_db
from ....models.user import User
from ....models.website import Website as WebsiteModel, TestRun as TestRunModel, Report as ReportModel, Issue as IssueModel
from ....schemas.website import Report
from ...deps import get_current_user
from ....services.report_service import ReportService

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch reports for websites owned by the current user
    result = await db.execute(
        select(ReportModel)
        .join(TestRunModel)
        .join(WebsiteModel)
        .where(WebsiteModel.user_id == current_user.id)
        .options(
            joinedload(ReportModel.test_run).joinedload(TestRunModel.website)
        )
        .order_by(desc(TestRunModel.started_at))
    )
    reports = result.unique().scalars().all()
    
    # Format for the list view
    formatted_reports = []
    for r in reports:
        health_score = None
        if r.ai_analysis:
            try:
                analysis = json.loads(r.ai_analysis)
                health_score = analysis.get("health_score")
            except:
                pass
        
        formatted_reports.append({
            "id": r.id,
            "summary": r.summary,
            "website_name": r.test_run.website.name,
            "website_url": r.test_run.website.url,
            "status": r.test_run.status,
            "started_at": r.test_run.started_at,
            "health_score": health_score,
        })
    
    return formatted_reports

@router.get("/{report_id}", response_model=dict)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Try to find the report by its ID OR by the test_run_id
    query = (
        select(ReportModel)
        .join(TestRunModel)
        .join(WebsiteModel)
        .where(or_(ReportModel.id == report_id, ReportModel.test_run_id == report_id))
        .where(WebsiteModel.user_id == current_user.id)
        .options(
            joinedload(ReportModel.test_run).joinedload(TestRunModel.website),
            joinedload(ReportModel.test_run).joinedload(TestRunModel.issues)
        )
    )
    result = await db.execute(query)
    report = result.unique().scalar_one_or_none()
    
    # 2. If not found, it might be a test run that finished but hasn't had a report generated yet
    if not report:
        test_run_query = (
            select(TestRunModel)
            .join(WebsiteModel)
            .where(TestRunModel.id == report_id)
            .where(WebsiteModel.user_id == current_user.id)
            .options(
                joinedload(TestRunModel.website),
                joinedload(TestRunModel.issues)
            )
        )
        test_run_result = await db.execute(test_run_query)
        test_run = test_run_result.unique().scalar_one_or_none()
        
        if test_run and test_run.status == "completed":
            # Generate the report on the fly
            report_service = ReportService()
            ai_report_data = await report_service.generate_report(test_run.issues, test_run.metrics or {})
            
            report = ReportModel(
                test_run_id=test_run.id,
                summary=ai_report_data["summary"],
                ai_analysis=json.dumps(ai_report_data)
            )
            db.add(report)
            await db.commit()
            
            # Re-fetch the newly created report with all relations
            result = await db.execute(query.where(ReportModel.test_run_id == test_run.id))
            report = result.unique().scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    ai_analysis = json.loads(report.ai_analysis) if report.ai_analysis else {}
    
    return {
        "id": report.id,
        "summary": report.summary,
        "ai_analysis": ai_analysis,
        "website": {
            "name": report.test_run.website.name,
            "url": report.test_run.website.url
        },
        "test_run": {
            "id": report.test_run.id,
            "status": report.test_run.status,
            "started_at": report.test_run.started_at,
            "completed_at": report.test_run.completed_at,
            "metrics": report.test_run.metrics
        },
        "issues": [
            {
                "id": i.id,
                "title": i.title,
                "description": i.description,
                "severity": i.severity,
                "category": i.category,
                "page_url": i.page_url
            } for i in report.test_run.issues
        ]
    }
