#!/usr/bin/env python3
"""
Urbanitae Scraper - Fast extraction of "Proyectos Financiados"
"""

import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright, Page


class UrbanitaeScraper:
    BASE_URL = "https://urbanitae.com/es/proyectos/"
    OUTPUT_FILE = "urbanitae_proyectos_financiados.json"

    def __init__(self, headless: bool = True, delay: float = 0.5):
        self.headless = headless
        self.delay = delay
        self.projects = []
        self.project_id_counter = 1

    async def close_modals(self, page: Page):
        """Remove any popup modals that might be blocking."""
        try:
            # Remove modal overlays from DOM using JavaScript
            removed = await page.evaluate('''() => {
                const modals = document.querySelectorAll('[class*="modalOverlay"], [class*="NewProjectDialog"], [class*="Dialog"][class*="modal"]');
                let count = 0;
                modals.forEach(m => {
                    m.remove();
                    count++;
                });
                return count;
            }''')
            if removed > 0:
                print(f"[INFO] Removed {removed} modal(s) from DOM")
                return True

            # Also try pressing Escape
            await page.keyboard.press('Escape')
            await asyncio.sleep(0.2)

        except Exception:
            pass
        return False

    async def scroll_to_funded_section(self, page: Page):
        """Scroll to 'Proyectos financiados' section."""
        # First close any modals
        await self.close_modals(page)

        print("[INFO] Scrolling to 'Proyectos financiados'...")

        # Scroll down to find the section
        await page.evaluate('''() => {
            const section = document.querySelector('[class*="Historic"]') ||
                           Array.from(document.querySelectorAll('h2, h3')).find(el => el.textContent.includes('financiados'));
            if (section) section.scrollIntoView({behavior: 'instant', block: 'start'});
        }''')
        await asyncio.sleep(0.5)

    async def extract_projects_from_page(self, page: Page, page_num: int) -> list:
        """Extract all funded project cards from current page view."""
        projects = []

        # Get all project cards in the funded section
        cards = await page.locator('[class*="Historic"] [class*="ProjectCard"], section:has-text("financiados") [class*="ProjectCard"]').all()

        if not cards:
            # Fallback: get all project cards and filter
            cards = await page.locator('[class*="ProjectCard"]').all()

        print(f"[PAGE {page_num}] Found {len(cards)} cards")

        # Debug: if no cards found, save a screenshot
        if not cards:
            await page.screenshot(path=f'debug_page_{page_num}.png')
            print(f"[DEBUG] Saved screenshot to debug_page_{page_num}.png")

        for card in cards:
            try:
                text = await card.text_content(timeout=1000)
                if not text:
                    continue

                # Debug first few cards
                if len(projects) < 2:
                    print(f"    [CARD] {text[:80]}...")

                # Skip non-funded projects
                if any(skip in text for skip in ['Próxima apertura', 'En estudio', 'Abierto', 'Invierte ahora']):
                    continue
                if not any(status in text for status in ['Financiado', 'Cerrado', 'Devuelto']):
                    continue

                project = self.parse_project_card(text, page_num)
                if project:
                    projects.append(project)

            except Exception:
                continue

        return projects

    def parse_project_card(self, text: str, page_num: int) -> dict:
        """Parse project data from card text content."""
        project = {
            "id": self.project_id_counter,
            "page": page_num,
            "developer": None,
            "location": None,
            "project": None,
            "address": None,
            "status": "Financiado",
            "type": None,
            "funded": None,
            "investors": None,
            "investment_term": None,
            "return": None,
            "return_type": None,
            "closed_data": None
        }

        # Pattern: "DeveloperNameLocation | Proyecto Name..." or "Location | Proyecto Name..."
        # Developer names are often in ALL CAPS or mixed case before the location

        # Try to extract developer + location + project
        # Pattern: DEVELOPER (optional) + Location | Proyecto Name
        full_match = re.search(r'^([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)([A-Za-záéíóúñÁÉÍÓÚÑ]+)\s*\|\s*([^\n]+?)(?:Financiado|Cerrado|Devuelto|Préstamo|Plusvalía|Rentas)', text)

        if full_match:
            # Check if first group looks like a developer (ends with company-like patterns)
            potential_dev = full_match.group(1).strip()
            location = full_match.group(2).strip()
            project_name = full_match.group(3).strip()

            # Developer names often: all caps, end with specific words, or contain certain patterns
            if potential_dev and (potential_dev.isupper() or
                any(kw in potential_dev.upper() for kw in ['CAPITAL', 'REAL ESTATE', 'HOMES', 'GROUP', 'GESTIÓN', 'PARTNERS', 'PROPERTIES'])):
                project["developer"] = potential_dev
                project["location"] = location
            else:
                # No developer, combine as location
                project["location"] = (potential_dev + location).strip()

            project["project"] = project_name
        else:
            # Simpler pattern: "Location | Proyecto Name"
            name_match = re.search(r'([A-Za-záéíóúñÁÉÍÓÚÑ\s]+)\s*\|\s*([^\n]+?)(?:Financiado|Cerrado|Devuelto|Préstamo|Plusvalía|Rentas)', text)
            if name_match:
                project["location"] = name_match.group(1).strip()
                project["project"] = name_match.group(2).strip()
            else:
                # Fallback: just get project name
                proj_match = re.search(r'Proyecto\s+([A-Za-záéíóúñÁÉÍÓÚÑ\s\d]+?)(?:\s*[A-Z]{2}|\s*Calle|\s*Urbanización|\s*Financiado)', text)
                if proj_match:
                    project["project"] = "Proyecto " + proj_match.group(1).strip()

        # Status
        if 'Cerrado' in text:
            project["status"] = "Cerrado"
        elif 'Devuelto' in text:
            project["status"] = "Devuelto"

        # Type: Préstamo, Plusvalía, Rentas
        if 'Préstamo' in text:
            project["type"] = "Préstamo"
        elif 'Plusvalía' in text:
            project["type"] = "Plusvalía"
        elif 'Rentas' in text:
            project["type"] = "Rentas"

        # Funded amount (e.g., "1.660.000 €" or "Financiado1.660.000 €")
        amount_match = re.search(r'(?:Financiado)?\s*([\d.]+(?:,\d+)?)\s*€', text)
        if amount_match:
            project["funded"] = amount_match.group(1) + " €"

        # Investors count
        inv_match = re.search(r'(?:Inversores|inversores)\s*(\d+)', text)
        if inv_match:
            project["investors"] = int(inv_match.group(1))

        # Investment term
        term_match = re.search(r'(?:Plazo[^0-9]*)?(\d+[-–]?\d*)\s*meses', text, re.IGNORECASE)
        if term_match:
            project["investment_term"] = term_match.group(1) + " meses"

        # Return percentage
        ret_match = re.search(r'(\d+[,.]?\d*)\s*%', text)
        if ret_match:
            project["return"] = ret_match.group(1) + "%"

        # Return type (TIR or rentabilidad)
        if 'TIR' in text:
            project["return_type"] = "TIR"
        elif 'rentabilidad' in text.lower():
            project["return_type"] = "Rentabilidad total"

        self.project_id_counter += 1
        return project

    async def click_next_page(self, page: Page, target_page: int) -> bool:
        """Click to navigate to target page number in funded projects pagination."""
        try:
            # Close any modal popups first
            await self.close_modals(page)

            # Use JavaScript to find and click pagination in the Historic (funded) section
            result = await page.evaluate('''(targetPage) => {
                // Find the Historic section containing funded projects
                const sections = document.querySelectorAll('section, div[class*="Historic"], div[class*="historic"]');

                for (const section of sections) {
                    // Check if this section contains "Proyectos financiados"
                    const heading = section.querySelector('h2, h3');
                    const isHistoric = section.className.toLowerCase().includes('historic') ||
                                      (heading && heading.textContent.includes('financiados'));

                    if (!isHistoric) continue;

                    // Find pagination container within this section
                    const paginationContainer = section.querySelector('nav, [class*="pagination"], [class*="Pagination"]');
                    if (!paginationContainer) continue;

                    // Find all buttons in pagination
                    const buttons = paginationContainer.querySelectorAll('button');

                    // First try to find exact page number
                    for (const btn of buttons) {
                        const text = btn.textContent.trim();
                        if (text === String(targetPage)) {
                            btn.scrollIntoView({block: 'center'});
                            btn.click();
                            return {success: true, clicked: text};
                        }
                    }

                    // If exact page not visible, click next arrow (last button)
                    const btnArray = Array.from(buttons);
                    if (btnArray.length > 0) {
                        const lastBtn = btnArray[btnArray.length - 1];
                        // Check if it's a "next" button (empty, has SVG, or is >)
                        const text = lastBtn.textContent.trim();
                        if (text === '' || text === '>' || text === '›' || lastBtn.querySelector('svg')) {
                            if (!lastBtn.disabled) {
                                lastBtn.scrollIntoView({block: 'center'});
                                lastBtn.click();
                                return {success: true, clicked: 'next'};
                            }
                        }
                    }
                }

                return {success: false, clicked: null};
            }''', target_page)

            if result and result.get('success'):
                print(f"[DEBUG] Clicked pagination: {result.get('clicked')}")
                await asyncio.sleep(2.5)  # Wait for content to load
                # Remove any new modals
                await self.close_modals(page)
                return True

        except Exception as e:
            print(f"[DEBUG] Pagination click failed: {e}")

        return False

    async def get_total_pages(self, page: Page) -> int:
        """Get total number of pages from pagination."""
        try:
            # Look for the last page number
            pagination_text = await page.locator('nav[aria-label*="pagination"], [class*="pagination"]').text_content(timeout=2000)
            numbers = re.findall(r'\d+', pagination_text)
            if numbers:
                return max(int(n) for n in numbers)
        except Exception:
            pass
        return 50  # Default based on screenshot

    async def scrape(self):
        """Main scraping function - FAST mode."""
        print(f"[START] Urbanitae Fast Scraper - {datetime.now().isoformat()}")
        print(f"[CONFIG] Headless: {self.headless}, Delay: {self.delay}s")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )
            page = await context.new_page()

            # Navigate to projects page
            print(f"[INFO] Loading {self.BASE_URL}")
            await page.goto(self.BASE_URL, wait_until='load', timeout=30000)
            await asyncio.sleep(5)  # Wait longer for JS hydration

            # Remove initial modals
            await self.close_modals(page)
            await asyncio.sleep(1)

            # Scroll to funded projects section
            await self.scroll_to_funded_section(page)
            await asyncio.sleep(1)

            # Get total pages
            total_pages = await self.get_total_pages(page)
            print(f"[INFO] Total pages to scrape: {total_pages}")

            # Scrape all pages using next button
            page_num = 1
            max_pages = min(total_pages, 60)  # Scrape up to 60 pages

            while page_num <= max_pages:
                # Extract projects from current page
                page_projects = await self.extract_projects_from_page(page, page_num)

                if page_projects:
                    self.projects.extend(page_projects)
                    print(f"[PAGE {page_num}/{total_pages}] Extracted {len(page_projects)} projects (Total: {len(self.projects)})")
                else:
                    print(f"[PAGE {page_num}/{total_pages}] No funded projects found")

                # Save progress every 5 pages
                if page_num % 5 == 0:
                    self.save_progress()

                # Try to go to next page
                if not await self.click_next_page(page, page_num + 1):
                    print(f"[INFO] No more pages after page {page_num}")
                    break

                await self.scroll_to_funded_section(page)
                page_num += 1

            await browser.close()

        # Final save
        self.save_results()
        print(f"\n[DONE] Scraped {len(self.projects)} projects across {total_pages} pages")
        return self.projects

    def save_progress(self):
        """Save current progress."""
        with open(f'{self.OUTPUT_FILE}.progress', 'w', encoding='utf-8') as f:
            json.dump(self.projects, f, ensure_ascii=False, indent=2)

    def save_results(self):
        """Save final results."""
        with open(self.OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.projects, f, ensure_ascii=False, indent=2)
        print(f"[INFO] Saved to {self.OUTPUT_FILE}")


async def main():
    scraper = UrbanitaeScraper(
        headless=False,  # Headed mode (more reliable)
        delay=0.5
    )
    projects = await scraper.scrape()

    if projects:
        print("\n[SAMPLE] First project:")
        print(json.dumps(projects[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
