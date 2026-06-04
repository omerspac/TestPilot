import asyncio
import time
from typing import Set, List, Dict, Callable, Awaitable, Optional
from urllib.parse import urlparse, urljoin
from playwright.async_api import async_playwright, Page, Error as PlaywrightError
from .models import TestResult, IssueResult, PageMetrics
from .detectors import Detector

class Crawler:
    def __init__(self, website_id: int, base_url: str, max_pages: int = 10, progress_callback: Optional[Callable[[int], Awaitable[None]]] = None):
        self.website_id = website_id
        self.base_url = base_url.rstrip('/')
        self.domain = urlparse(base_url).netloc
        self.max_pages = max_pages
        self.progress_callback = progress_callback
        self.visited_urls: Set[str] = set()
        self.to_visit: List[str] = [self.base_url]
        self.results = TestResult(
            website_id=website_id,
            url=base_url,
            status="running",
            started_at=datetime.utcnow()
        )

    def is_internal(self, url: str) -> bool:
        parsed = urlparse(url)
        return parsed.netloc == '' or parsed.netloc == self.domain

    async def run_test(self) -> TestResult:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            
            while self.to_visit and len(self.visited_urls) < self.max_pages:
                url = self.to_visit.pop(0)
                if url in self.visited_urls:
                    continue
                
                self.visited_urls.add(url)
                await self.crawl_page(context, url)
                
                if self.progress_callback:
                    progress = int((len(self.visited_urls) / self.max_pages) * 100)
                    await self.progress_callback(min(progress, 99))
            
            await browser.close()
            
            self.results.status = "completed"
            self.results.completed_at = datetime.utcnow()
            self.results.summary = {
                "pages_scanned": len(self.visited_urls),
                "total_issues": len(self.results.issues)
            }
            return self.results

    async def crawl_page(self, context, url: str):
        page = await context.new_page()
        
        # Track errors
        page_issues = []
        
        page.on("pageerror", lambda err: page_issues.append(IssueResult(
            type="js_error", severity="high", description=str(err), page_url=url
        )))
        page.on("console", lambda msg: page_issues.append(IssueResult(
            type="console_error", severity="medium", description=msg.text, page_url=url
        )) if msg.type == "error" else None)

        start_time = time.time()
        try:
            response = await page.goto(url, wait_until="networkidle", timeout=30000)
            load_time = (time.time() - start_time) * 1000
            
            if response and response.status >= 400:
                self.results.issues.append(IssueResult(
                    type="http_error",
                    severity="critical",
                    description=f"Page returned status code {response.status}",
                    page_url=url
                ))

            # Run Detectors
            page_issues.extend(await Detector.check_seo(page, url))
            page_issues.extend(await Detector.check_images(page, url))
            
            # Collect internal links
            if len(self.visited_urls) < self.max_pages:
                links = await page.query_selector_all('a')
                for link in links:
                    href = await link.get_attribute('href')
                    if href:
                        full_url = urljoin(url, href).split('#')[0].rstrip('/')
                        if self.is_internal(full_url) and full_url not in self.visited_urls:
                            self.to_visit.append(full_url)

            # Store metrics
            self.results.metrics[url] = PageMetrics(
                load_time_ms=load_time,
                js_errors_count=sum(1 for i in page_issues if i.type == "js_error"),
                console_errors_count=sum(1 for i in page_issues if i.type == "console_error"),
                http_errors_count=1 if response and response.status >= 400 else 0
            )
            
            self.results.issues.extend(page_issues)

        except Exception as e:
            self.results.issues.append(IssueResult(
                type="load_failure",
                severity="critical",
                description=str(e),
                page_url=url
            ))
        finally:
            await page.close()

from datetime import datetime
