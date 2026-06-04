from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Index, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    url = Column(String(2048), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="websites")
    test_runs = relationship("TestRun", back_populates="website", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_website_user_id", "user_id"),
    )

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending") # pending, running, completed, failed
    progress = Column(Integer, default=0) # percentage 0-100
    metrics = Column(JSON, nullable=True) # Aggregated metrics
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    website = relationship("Website", back_populates="test_runs")
    issues = relationship("Issue", back_populates="test_run", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="test_run", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_test_run_website_id", "website_id"),
        Index("idx_test_run_status", "status"),
    )

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(50)) # low, medium, high, critical
    category = Column(String(100)) # performance, accessibility, SEO, best-practices
    page_url = Column(String(2048))

    test_run = relationship("TestRun", back_populates="issues")

    __table_args__ = (
        Index("idx_issue_test_run_id", "test_run_id"),
        Index("idx_issue_severity", "severity"),
        Index("idx_issue_category", "category"),
    )

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(Text)
    ai_analysis = Column(Text)

    test_run = relationship("TestRun", back_populates="report")
