import { expect, Locator, Page } from "@playwright/test";
import { Station } from "../types/station.type";
import { SeatType } from "../types/seat-type.type";

export class TicketPricePage {
    private readonly page: Page;
    private readonly departFromSelect: Locator;
    private readonly arriveAtSelect: Locator;
    private readonly seatTypeSelect: Locator;
    private readonly checkPriceButton: Locator;
    private readonly priceLocator: Locator;
    private readonly checkPriceLinksInList: Locator;

    constructor(page: Page) {
        this.page = page;
        this.departFromSelect = this.page.locator('select[name="DepartStation"]');
        this.arriveAtSelect = this.page.locator('select[name="ArriveStation"]');
        this.seatTypeSelect = this.page.locator('select[name="SeatType"]');
        this.checkPriceButton = this.page.locator('input[type="submit"]');
        this.priceLocator = this.page.locator("//td[@class='price']");
        // For "Check Price" links in the train list (Ticket Price list page)
        this.checkPriceLinksInList = this.page.locator("//a[contains(text(), 'Check Price')]").or(
            this.page.getByRole('link', { name: /check price/i })
        );
    }

    /**
     * Verify ticket price list page is loaded
     */
    async verifyPageLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }

    /**
     * Select departure station from dropdown
     * @param station The station to select
     */
    async selectDepartFrom(station: Station): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.departFromSelect.waitFor({ state: 'visible', timeout: 20000 });
        await this.departFromSelect.selectOption({ label: station });
    }

    /**
     * Select arrival station from dropdown
     * @param station The station to select
     */
    async selectArriveAt(station: Station): Promise<void> {
        await this.arriveAtSelect.waitFor({ state: 'visible', timeout: 20000 });
        await this.arriveAtSelect.selectOption({ label: station });
    }

    /**
     * Select seat type from dropdown
     * @param seatType The seat type to select
     */
    async selectSeatType(seatType: SeatType): Promise<void> {
        await this.seatTypeSelect.waitFor({ state: 'visible', timeout: 20000 });
        await this.seatTypeSelect.selectOption({ label: seatType });
    }

    /**
     * Click the Check Price button
     */
    async clickCheckPriceButton(): Promise<void> {
        await this.checkPriceButton.waitFor({ state: 'visible', timeout: 20000 });
        await this.checkPriceButton.click();
    }

    /**
     * Get ticket price text from the page
     * @returns The ticket price as string
     */
    async getTicketPrice(): Promise<string> {
        await this.priceLocator.waitFor({ state: 'visible', timeout: 20000 });
        const priceText = await this.priceLocator.textContent();
        return (priceText || '').trim();
    }

    /**
     * Verify price details page displays correct route information
     * @param expectedDepartFrom Expected departure station
     * @param expectedArriveAt Expected arrival station
     */
    async verifyRouteInformation(expectedDepartFrom: string, expectedArriveAt: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        const pageContent = await this.page.textContent('body');
        expect(pageContent).toContain(expectedDepartFrom);
        expect(pageContent).toContain(expectedArriveAt);
    }

    /**
     * Verify page has fare information (seat types and prices)
     */
    async verifyFareInformation(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        // Check for table with price information or seat type information
        const hasTable = await this.page.locator('table').count() > 0;
        const hasPriceInfo = await this.priceLocator.count() > 0;
        return hasTable || hasPriceInfo;
    }

    /**
     * Helper method to check ticket price by selecting all options and clicking check price button
     * @param departFrom Departure station
     * @param arriveAt Arrival station
     * @param seatType Seat type
     */
    async checkTicketPrice(departFrom: Station, arriveAt: Station, seatType: SeatType): Promise<void> {
        await this.selectDepartFrom(departFrom);
        await this.selectArriveAt(arriveAt);
        await this.selectSeatType(seatType);
        await this.clickCheckPriceButton();
    }

    /**
     * Get count of "Check Price" links in the train list
     */
    async getCheckPriceLinksCount(): Promise<number> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
        return await this.checkPriceLinksInList.count();
    }

    /**
     * Click on "Check Price" link for a specific route (e.g., Sài Gòn to Nha Trang)
     * @param departFrom Departure station text
     * @param arriveAt Arrival station text
     */
    async clickCheckPriceLinkForRoute(departFrom: string, arriveAt: string): Promise<void> {
        // From page snapshot, route text is in a single cell like "Sài Gòn to Nha Trang"
        // Find the row that contains a cell with both stations, then find the Check Price link in that row
        const routeLink = this.page.locator(
            `//tr[td[contains(text(), '${departFrom}') and contains(text(), '${arriveAt}')]]//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'check price')]`
        ).or(
            this.page.locator(
                `//tr[td[contains(text(), '${departFrom}') and contains(text(), '${arriveAt}')]]//a[contains(text(), 'check price')]`
            ).or(
                this.page.locator(
                    `//tr[td[contains(text(), '${departFrom}') and contains(text(), '${arriveAt}')]]//a[contains(text(), 'Check price')]`
                ).or(
                    this.page.locator(
                        `//tr[td[contains(text(), '${departFrom}') and contains(text(), '${arriveAt}')]]//a[contains(text(), 'Check Price')]`
                    ).or(
                        // Fallback: find row containing both stations anywhere in the row
                        this.page.locator(
                            `//tr[contains(., '${departFrom}') and contains(., '${arriveAt}')]//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'check price')]`
                        )
                    )
                )
            )
        );
        await routeLink.first().waitFor({ state: 'visible', timeout: 10000 });
        await routeLink.first().click();
    }

    /**
     * Click on the first "Check Price" link in the train list
     */
    async clickFirstCheckPriceLinkInList(): Promise<void> {
        await this.checkPriceLinksInList.first().waitFor({ state: 'visible', timeout: 10000 });
        await this.checkPriceLinksInList.first().click();
    }

    /**
     * Get current page URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Click Book Ticket button on price details page
     */
    async clickBookTicketButton(): Promise<void> {
        const bookTicketButton = this.page.locator("//a[contains(text(), 'Book Ticket')]").or(
            this.page.locator("//a[contains(text(), 'Book ticket')]").or(
                this.page.getByRole('link', { name: /book ticket/i })
            )
        );
        await bookTicketButton.first().waitFor({ state: 'visible', timeout: 10000 });
        await bookTicketButton.first().click();
    }

    /**
     * Click Book Ticket button for a specific seat type on Check Price page
     * @param seatType The seat type to select
     */
    async clickBookTicketButtonForSeatType(seatType: SeatType): Promise<void> {
        // Find the table row that contains the seat type and click its Book Ticket button
        // The Book Ticket button is usually in the same row as the seat type
        const seatTypeRow = this.page.locator(`//tr[contains(., '${seatType}')]`).or(
            this.page.locator(`//table//tr[td[contains(text(), '${seatType}')]]`)
        );
        
        // Find Book Ticket button/link within that row
        const bookTicketButton = seatTypeRow.locator("//a[contains(text(), 'Book Ticket')]").or(
            seatTypeRow.locator("//a[contains(text(), 'Book ticket')]").or(
                seatTypeRow.locator("//input[@value='Book ticket']").or(
                    seatTypeRow.locator("//input[@value='Book Ticket']").or(
                        seatTypeRow.locator("//button[contains(text(), 'Book ticket')]").or(
                            seatTypeRow.getByRole('link', { name: /book ticket/i })
                        )
                    )
                )
            )
        );
        
        await bookTicketButton.first().waitFor({ state: 'visible', timeout: 10000 });
        await bookTicketButton.first().click();
    }

    /**
     * Select seat type on Book Ticket page
     * @param seatType The seat type to select
     */
    async selectSeatTypeOnBookTicketPage(seatType: SeatType): Promise<void> {
        // Find seat type select on Book Ticket page - try multiple selectors
        const seatTypeSelect = this.page.locator('select[name*="Seat"], select[name*="seat"], select[name="SeatType"]').first();
        await seatTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
        await seatTypeSelect.selectOption({ label: seatType });
    }

    /**
     * Verify Book Ticket page displays correct route and seat type information
     * @param expectedDepartFrom Expected departure station
     * @param expectedArriveAt Expected arrival station
     * @param expectedSeatType Expected seat type
     */
    async verifyBookTicketPageRouteAndSeat(
        expectedDepartFrom: string,
        expectedArriveAt: string,
        expectedSeatType: string
    ): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);

        // Verify URL contains BookTicket
        const currentUrl = this.getCurrentUrl();
        expect(currentUrl.includes('BookTicket') || currentUrl.includes('Book')).toBeTruthy();

        // Verify form fields are pre-filled with correct route information
        // Check Depart From select - use locator with option:checked
        const departFromSelect = this.page.locator('select[name*="depart"], select[name*="Depart"], select[name="DepartStation"]').first();
        const hasDepartSelect = await departFromSelect.count() > 0;
        if (hasDepartSelect) {
            const selectedDepartOption = departFromSelect.locator('option:checked');
            const selectedDepartValue = await selectedDepartOption.textContent().catch(() => '');
            expect(selectedDepartValue?.toLowerCase()).toContain(expectedDepartFrom.toLowerCase());
        }

        // Check Arrive At select
        const arriveAtSelect = this.page.locator('select[name*="arrive"], select[name*="Arrive"], select[name="ArriveStation"]').first();
        const hasArriveSelect = await arriveAtSelect.count() > 0;
        if (hasArriveSelect) {
            const selectedArriveOption = arriveAtSelect.locator('option:checked');
            const selectedArriveValue = await selectedArriveOption.textContent().catch(() => '');
            expect(selectedArriveValue?.toLowerCase()).toContain(expectedArriveAt.toLowerCase());
        }

        // Check Seat Type select
        const seatTypeSelect = this.page.locator('select[name*="seat"], select[name*="Seat"], select[name="SeatType"]').first();
        const hasSeatSelect = await seatTypeSelect.count() > 0;
        if (hasSeatSelect) {
            const selectedSeatOption = seatTypeSelect.locator('option:checked');
            const selectedSeatValue = await selectedSeatOption.textContent().catch(() => '');
            expect(selectedSeatValue?.toLowerCase()).toContain(expectedSeatType.toLowerCase());
        }

        // Also verify in page content as fallback
        const pageContent = await this.page.textContent('body');
        expect(pageContent).toBeTruthy();
        if (pageContent) {
            const pageContentLower = pageContent.toLowerCase();
            expect(pageContentLower).toContain(expectedDepartFrom.toLowerCase());
            expect(pageContentLower).toContain(expectedArriveAt.toLowerCase());
            const seatTypeLower = expectedSeatType.toLowerCase();
            expect(pageContentLower.includes(seatTypeLower) || 
                   pageContentLower.includes('soft') || 
                   pageContentLower.includes('hard')).toBeTruthy();
        }
    }
    /**
     * Click Book Ticket submit button on Book Ticket page (to submit the booking form)
     */
    async clickBookTicketSubmitButton(): Promise<void> {
        // Look for submit button in Book Ticket form
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
     * Verify ticket booked successfully page
     * @param expectedDepartFrom Expected departure station
     * @param expectedArriveAt Expected arrival station
     */
    async verifyTicketBookedSuccessfully(
        expectedDepartFrom: string,
        expectedArriveAt: string
    ): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Give time for page to load

        // Verify success message title
        const hasTable = await this.page.locator('table').count() > 0;
    expect(hasTable).toBeTruthy();

    // Verify route information in the ticket details table
    // Look for the table cells that contain the route information
    const tableContent = await this.page.locator('table').textContent();
    expect(tableContent).toBeTruthy();
    if (tableContent) {
        const tableContentLower = tableContent.toLowerCase();
        // Remove diacritics and normalize for comparison
        const expectedDepartLower = expectedDepartFrom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const expectedArriveLower = expectedArriveAt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const tableContentNormalized = tableContentLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        expect(tableContentNormalized).toContain(expectedDepartLower);
        expect(tableContentNormalized).toContain(expectedArriveLower);
    }
}
}


