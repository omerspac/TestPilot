from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload

from ....core.database import get_db
from ....models.user import User
from ....models.website import Website as WebsiteModel, TestRun as TestRunModel, Report as ReportModel, Issue as IssueModel
from ....schemas.website import Report
from ...deps import get_current_user

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
    reports = result.scalars().all()
    
    # Format for the list view
    return [
        {
            "id": r.id,
            "summary": r.summary,
            "website_name": r.test_run.website.name,
            "website_url": r.test_run.website.url,
            "status": r.test_run.status,
            "started_at": r.test_run.started_at,
            "health_score": r.test_run.metrics.get("overall_score") if r.test_run.metrics else None, # Placeholder for score
        } for r in reports
    ]

@router.get("/{report_id}", response_model=dict)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch detailed report with all relations
    result = await db.execute(
        select(ReportModel)
        .join(TestRunModel)
        .join(WebsiteModel)
        .where(ReportModel.id == report_id)
        .where(WebsiteModel.user_id == current_user.id)
        .options(
            joinedload(ReportModel.test_run).joinedload(TestRunModel.website),
            joinedload(ReportModel.test_run).joinedload(TestRunModel.issues)
        )
    )
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    import json
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
