import json
import logging
from typing import List, Dict, Any
from openai import AsyncOpenAI
from ..core.config import settings
from ..models.website import Issue as IssueModel
from ..schemas.website import ReportBase

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_report(self, issues: List[IssueModel], metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates an AI-powered report based on detected issues and metrics.
        """
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "sk-placeholder":
            return self._generate_mock_report(issues)

        # Prepare data for AI
        issues_summary = [
            {
                "title": i.title,
                "description": i.description,
                "severity": i.severity,
                "category": i.category,
                "page": i.page_url
            } for i in issues
        ]

        # Calculate some basic stats for the prompt
        avg_load_time = 0
        if metrics:
            load_times = [m.get('load_time_ms', 0) for m in metrics.values()]
            avg_load_time = sum(load_times) / len(load_times) if load_times else 0

        prompt = f"""
        You are an expert QA Engineer and Web Performance Consultant. 
        Analyze the following website test data and provide a professional audit report.

        DATA SUMMARY:
        - Total Issues Found: {len(issues)}
        - Average Page Load Time: {avg_load_time:.2f}ms
        - Detailed Issues: {json.dumps(issues_summary[:50])} # Limit to avoid token overflow

        OUTPUT REQUIREMENTS:
        Your response MUST be a valid JSON object with the following structure:
        {{
            "summary": "A concise executive summary of the website's status.",
            "critical_issues": ["List of most urgent problems"],
            "medium_issues": ["List of secondary problems"],
            "recommendations": ["Actionable steps to improve the site"],
            "health_score": 85 (A number between 0 and 100)
        }}

        Ensure the tone is professional, constructive, and technical where appropriate.
        """

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini", # Cost-effective and fast
                messages=[
                    {{"role": "system", "content": "You are a helpful assistant that outputs only valid JSON."}},
                    {{"role": "user", "content": prompt}}
                ],
                response_format={{ "type": "json_object" }},
                max_tokens=1000,
                temperature=0.7
            )
            
            report_content = response.choices[0].message.content
            return json.loads(report_content)

        except Exception as e:
            logger.error(f"AI Report Generation Error: {str(e)}")
            return self._generate_mock_report(issues)

    def _generate_mock_report(self, issues: List[IssueModel]) -> Dict[str, Any]:
        """Fallback mock report when OpenAI is unavailable or key is missing."""
        critical = [i.title for i in issues if i.severity == "critical"]
        medium = [i.title for i in issues if i.severity in ["high", "medium"]]
        
        return {
            "summary": "This is a placeholder report generated locally because the AI engine was unavailable. The site shows several areas for improvement in SEO and accessibility.",
            "critical_issues": critical if critical else ["No critical issues detected by the local engine."],
            "medium_issues": medium[:5] if medium else ["Multiple minor warnings detected."],
            "recommendations": [
                "Ensure all images have descriptive alt text for accessibility.",
                "Implement meta descriptions on all landing pages for better SEO.",
                "Monitor server response times to ensure consistent performance."
            ],
            "health_score": max(100 - (len(critical) * 20) - (len(medium) * 5), 0)
        }
