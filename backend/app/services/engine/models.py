from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class IssueResult(BaseModel):
    type: str  # broken_link, missing_title, js_error, etc.
    severity: str  # low, medium, high, critical
    description: str
    page_url: str
    location: Optional[str] = None  # selector or line number

class PageMetrics(BaseModel):
    load_time_ms: float
    js_errors_count: int
    console_errors_count: int
    http_errors_count: int

class TestResult(BaseModel):
    website_id: int
    url: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    issues: List[IssueResult] = []
    metrics: Dict[str, PageMetrics] = {}
    summary: Dict[str, Any] = {}
