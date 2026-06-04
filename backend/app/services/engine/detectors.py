from playwright.async_api import Page
from typing import List
from .models import IssueResult

class Detector:
    @staticmethod
    async def check_seo(page: Page, url: str) -> List[IssueResult]:
        issues = []
        
        # Check Title
        title = await page.title()
        if not title:
            issues.append(IssueResult(
                type="missing_title",
                severity="medium",
                description="Page is missing a title tag.",
                page_url=url
            ))
            
        # Check Meta Description
        meta_desc = await page.query_selector('meta[name="description"]')
        if not meta_desc:
            issues.append(IssueResult(
                type="missing_meta_description",
                severity="low",
                description="Page is missing a meta description.",
                page_url=url
            ))
            
        return issues

    @staticmethod
    async def check_images(page: Page, url: str) -> List[IssueResult]:
        issues = []
        images = await page.query_selector_all('img')
        for img in images:
            alt = await img.get_attribute('alt')
            src = await img.get_attribute('src')
            if alt is None or alt.strip() == "":
                issues.append(IssueResult(
                    type="missing_alt_tag",
                    severity="low",
                    description=f"Image with src '{src}' is missing an alt attribute.",
                    page_url=url,
                    location=f"img[src='{src}']"
                ))
        return issues

    @staticmethod
    async def check_links(page: Page, url: str, base_url: str) -> List[IssueResult]:
        # This basic version checks for internal links structure
        # HTTP validation is usually done during crawling requests
        issues = []
        links = await page.query_selector_all('a')
        for link in links:
            href = await link.get_attribute('href')
            if not href or href.startswith('#') or href.startswith('javascript:'):
                continue
            # Further logic for broken link detection would go here
        return issues
