from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from ....core.database import get_db
from ....models.user import User
from ....models.website import Website as WebsiteModel, TestRun as TestRunModel, Issue as IssueModel
from ...deps import get_current_user

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total Websites
    websites_count_result = await db.execute(
        select(func.count(WebsiteModel.id)).where(WebsiteModel.user_id == current_user.id)
    )
    total_websites = websites_count_result.scalar() or 0

    # Total Test Runs
    test_runs_count_result = await db.execute(
        select(func.count(TestRunModel.id))
        .join(WebsiteModel)
        .where(WebsiteModel.user_id == current_user.id)
    )
    total_test_runs = test_runs_count_result.scalar() or 0

    # Total Issues & Critical Issues
    issues_query = (
        select(
            func.count(IssueModel.id).label("total"),
            func.count(IssueModel.id).filter(IssueModel.severity == "critical").label("critical")
        )
        .join(TestRunModel)
        .join(WebsiteModel)
        .where(WebsiteModel.user_id == current_user.id)
    )
    issues_result = await db.execute(issues_query)
    issues_row = issues_result.one()
    total_issues = issues_row.total or 0
    critical_issues = issues_row.critical or 0

    # Issues over time (Last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    history_query = (
        select(
            func.date(TestRunModel.started_at).label("date"),
            func.count(IssueModel.id).label("count")
        )
        .join(TestRunModel, TestRunModel.id == IssueModel.test_run_id)
        .join(WebsiteModel, WebsiteModel.id == TestRunModel.website_id)
        .where(WebsiteModel.user_id == current_user.id)
        .where(TestRunModel.started_at >= seven_days_ago)
        .group_by(func.date(TestRunModel.started_at))
        .order_by(func.date(TestRunModel.started_at))
    )
    history_result = await db.execute(history_query)
    issues_history = [{"date": str(row.date), "count": row.count} for row in history_result.all()]

    # Severity Distribution
    severity_query = (
        select(IssueModel.severity, func.count(IssueModel.id))
        .join(TestRunModel)
        .join(WebsiteModel)
        .where(WebsiteModel.user_id == current_user.id)
        .group_by(IssueModel.severity)
    )
    severity_result = await db.execute(severity_query)
    severity_dist = [{"name": row[0], "value": row[1]} for row in severity_result.all()]

    return {
        "stats": {
            "total_websites": total_websites,
            "total_test_runs": total_test_runs,
            "total_issues": total_issues,
            "critical_issues": critical_issues,
        },
        "charts": {
            "issues_over_time": issues_history,
            "severity_distribution": severity_dist
        }
    }
