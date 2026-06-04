from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WebsiteBase(BaseModel):
    url: str
    name: str

class WebsiteCreate(WebsiteBase):
    pass

class WebsiteUpdate(BaseModel):
    url: Optional[str] = None
    name: Optional[str] = None

class Website(WebsiteBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TestRunBase(BaseModel):
    website_id: int

class TestRunCreate(TestRunBase):
    pass

class ReportShort(BaseModel):
    id: int
    class Config:
        from_attributes = True

class TestRun(TestRunBase):
    id: int
    status: str
    progress: int
    metrics: Optional[dict] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    report: Optional[ReportShort] = None

    class Config:
        from_attributes = True

class IssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str
    category: str
    page_url: Optional[str] = None

class Issue(IssueBase):
    id: int
    test_run_id: int

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    summary: str
    ai_analysis: str

class Report(ReportBase):
    id: int
    test_run_id: int

    class Config:
        from_attributes = True
