import { expect, Locator, Page } from "@playwright/test";
import { Station } from "../types/station.type";

export class TimetablePage {
    private readonly page: Page;
    private readonly checkPriceLinks: Locator;
    private readonly bookTicketLinks: Locator;

    constructor(page: Page) {
        this.page = page;
        this.checkPriceLinks = this.page.locator("//table//a[contains(text(), 'Check Price')]").or(
            this.page.locator("//table//a[contains(text(), 'check price')]").or(
                this.page.locator("//a[contains(text(), 'Check Price')]").or(
                    this.page.locator("//a[contains(@href, 'Price')]").or(
                        this.page.getByRole('link', { name: /check price/i })
                    )
                )
            )
        );
        // Kiểm tra nút book ticket ở trong table show thông tin giá vé
        this.bookTicketLinks = this.page.locator("//table//a[contains(text(), 'Book ticket')]").or(
            this.page.locator("//table//a[contains(text(), 'Book Ticket')]").or(
                this.page.locator("//a[contains(text(), 'Book ticket')]").or(
                    this.page.locator("//a[contains(text(), 'Book Ticket')]").or(
                        this.page.locator("//a[contains(@href, 'BookTicket')]").or(
                            this.page.getByRole('link', { name: /book ticket/i })
                        )
                    )
                )
            )
        );
    }
    private async getColumnIndex(column: string): Promise<number> {
        // Đếm các sibling trước + 1 để lấy chỉ số cột (1-based)
        const precedingSiblings = this.page.locator(
            `//tr/th[text()='${column}']/preceding-sibling::th`
        );
        const count = await precedingSiblings.count();
        return count + 1;
    }
    async getColumnText(column: string): Promise<string> {
        const columnIndex = await this.getColumnIndex(column);
        const cell = this.page.locator(`//tr/td[${columnIndex}]`).first();
        const text = await cell.textContent();
        return (text || '').trim();
    }

    /**
     * Click vào nút "Check Price" đầu tiên trong timetable
     */
    async clickFirstCheckPriceLink(): Promise<void> {
        await this.checkPriceLinks.first().waitFor({ state: 'visible', timeout: 10000 });
        await this.checkPriceLinks.first().click();
    }

    /**
     * Click on "Check Price" link for a specific route (e.g., Sài Gòn to Nha Trang)
     * @param departFrom Departure station
     * @param arriveAt Arrival station
     */
    async clickCheckPriceLinkForRoute(departFrom: Station, arriveAt: Station): Promise<void> {
        // Find the link that is in the same row as the route text
        // From page snapshot, link text is "check price" (lowercase)
        // Try multiple locator strategies to find the link in the row containing both stations
        const routeLink = this.page.locator(
            `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'check price')]`
        ).or(
            this.page.locator(
                `//tr[contains(., '${departFrom}') and contains(., '${arriveAt}')]//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'check price')]`
            ).or(
                this.page.locator(
                    `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(text(), 'check price')]`
                ).or(
                    this.page.locator(
                        `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(text(), 'Check price')]`
                    ).or(
                        this.page.locator(
                            `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(text(), 'Check Price')]`
                        )
                    )
                )
            )
        );
        await routeLink.first().waitFor({ state: 'visible', timeout: 10000 });
        await routeLink.first().click();
    }

    /**
     * Click vào nút "Book Ticket" đầu tiên trong timetable
     */
    async clickFirstBookTicketLink(): Promise<void> {
        await this.bookTicketLinks.first().waitFor({ state: 'visible', timeout: 10000 });
        await this.bookTicketLinks.first().click();
    }

    /**
     * Click on "Book Ticket" link for a specific route (e.g., Sài Gòn to Nha Trang)
     * @param departFrom Departure station
     * @param arriveAt Arrival station
     */
    async clickBookTicketLinkForRoute(departFrom: Station, arriveAt: Station): Promise<void> {
        // Find the link that is in the same row as the route text
        // From page snapshot, link text is "book ticket" (lowercase)
        // Try multiple locator strategies to find the link in the row containing both stations
        const routeLink = this.page.locator(
            `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'book ticket')]`
        ).or(
            this.page.locator(
                `//tr[contains(., '${departFrom}') and contains(., '${arriveAt}')]//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'book ticket')]`
            ).or(
                this.page.locator(
                    `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(text(), 'book ticket')]`
                ).or(
                    this.page.locator(
                        `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(text(), 'Book ticket')]`
                    ).or(
                        this.page.locator(
                            `//tr[td[contains(text(), '${departFrom}')] and td[contains(text(), '${arriveAt}')]]//a[contains(text(), 'Book Ticket')]`
                        )
                    )
                )
            )
        );
        await routeLink.first().waitFor({ state: 'visible', timeout: 10000 });
        await routeLink.first().click();
    }

    /**
     * Lấy số lượng nút "Check Price"
     */
    async getCheckPriceLinksCount(): Promise<number> {
        // Chờ trang tải
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); 
        return await this.checkPriceLinks.count();
    }

    /**
     * Lấy số lượng nút "Book Ticket"
     */
    async getBookTicketLinksCount(): Promise<number> {
        // Wait for page to load completely
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); 
        return await this.bookTicketLinks.count();
    }

    /**
     * Kiểm tra trang timetable đã tải xong
     */
    async verifyPageLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.locator('h1')).toContainText(/timetable/i);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Kiểm tra xem user có bị chuyển hướng đến trang login không
     */
    async isRedirectedToLogin(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        const url = this.page.url();
        const pageTitle = await this.page.locator('h1').textContent();
        return url.includes('/Login') || (pageTitle?.toLowerCase().includes('login') ?? false);
    }

    /**
     * Lấy URL hiện tại của trang
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Click nút submit trên trang Book Ticket (để gửi form đặt vé)
     */
    async clickBookTicketSubmitButton(): Promise<void> {
        // Tìm nút submit trong form Book Ticket
        const submitButton = this.page.locator('input[type="submit"][value*="Book"]').or(
            this.page.locator('input[type="submit"]').or(
                this.page.locator('button[type="submit"]').or(
                    this.page.getByRole('button', { name: /book ticket/i }).or(
                        this.page.locator("//input[@value='Book ticket']").or(
                            this.page.locator("//input[@value='Book Ticket']").or(
                                this.page.locator("//button[contains(text(), 'Book ticket')]")
                            )
                        )
                    )
                )
            )
        );
        await submitButton.first().waitFor({ state: 'visible', timeout: 10000 });
        await submitButton.first().click();
    }

    /**
     * Kiểm tra trang ticket booked successfully đã tải xong
     * Chờ trang tải và kiểm tra tiêu đề h1 có chứa "Ticket Booked Successfully!"
     */
    async verifyTicketBookedSuccessfully(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Give time for page to load

        // Kiểm tra tiêu đề thành công - chờ h1 có chứa "Ticket Booked Successfully!"
        const pageTitleLocator = this.page.locator('h1');
        await pageTitleLocator.waitFor({ state: 'visible', timeout: 15000 });
        const titleText = await pageTitleLocator.textContent();
        expect(titleText).toBeTruthy();
        expect(titleText?.toLowerCase()).toContain('ticket booked successfully!');

        // Kiểm tra trang có bảng với thông tin vé
        const hasTable = await this.page.locator('table').count() > 0;
        expect(hasTable).toBeTruthy();
    }

    /**
     * Verify route information on check price page
     * @param expectedDepartFrom Expected departure station
     * @param expectedArriveAt Expected arrival station
     */
    async verifyRouteOnCheckPricePage(expectedDepartFrom: Station, expectedArriveAt: Station): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);

        // Get page content to verify route
        const pageContent = await this.page.textContent('body');
        if (!pageContent) {
            return false;
        }

        const pageContentLower = pageContent.toLowerCase();
        const departFromLower = expectedDepartFrom.toLowerCase();
        const arriveAtLower = expectedArriveAt.toLowerCase();

        // Check if both stations are present in page content
        const hasDepartFrom = pageContentLower.includes(departFromLower);
        const hasArriveAt = pageContentLower.includes(arriveAtLower);

        return hasDepartFrom && hasArriveAt;
    }
}

export default TimetablePage;

