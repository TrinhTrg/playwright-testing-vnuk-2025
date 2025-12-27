import { expect, Locator, Page } from "@playwright/test";
import { Ticket } from "../models/ticket.model";
import { Station, getStationFromText } from "../types/station.type";
import { SeatType, getSeatTypeFromText } from "../types/seat-type.type";
import { DATE_FORMAT } from "../constants/constants";

export class BookTicketPage {
    private readonly page: Page;
    private readonly departDateSelect: Locator;
    private readonly departFromSelect: Locator;
    private readonly arriveAtSelect: Locator;
    private readonly seatTypeSelect: Locator;
    private readonly amountSelect: Locator;
    private readonly bookTicketButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.departDateSelect = this.page.locator('select[name="Date"]');
        this.departFromSelect = this.page.locator('select[name="DepartStation"]');
        this.arriveAtSelect = this.page.locator('select[name="ArriveStation"]');
        this.seatTypeSelect = this.page.locator('select[name="SeatType"]');
        this.amountSelect = this.page.locator('select[name="TicketAmount"]');
        this.bookTicketButton = this.page.locator('input[type="submit"]');
        this.errorMessage = this.page.locator('.error-message');
    }

    /**
     * Book a ticket with the provided ticket information
     * @param ticket The ticket information to book
     */
    async bookTicket(ticket: Ticket): Promise<void> {
        await this.selectDepartDate(ticket.departDate);
        await this.selectDepartFrom(ticket.departFrom);
        await this.selectArriveAt(ticket.arriveAt);
        await this.selectSeatType(ticket.seatType);
        await this.selectAmount(ticket.amount);
        
        // Scroll to button and click
        await this.bookTicketButton.scrollIntoViewIfNeeded();
        await this.clickBookTicketButton();
    }

    /**
     * Get booked ticket information from the success page
     * @returns The booked ticket information
     */
    async getBookedTicket(): Promise<Ticket> {
        const departDate = await this.getDepartDate();
        const departFrom = await this.getDepartStation();
        const arriveAt = await this.getArriveStation();
        const seatType = await this.getSeatType();
        const amount = await this.getAmount();

        return new Ticket(departDate, departFrom, arriveAt, seatType, amount);
    }

    /**
     * Get ticket ID from the URL
     * @returns The ticket ID
     */
    getTicketID(): number {
        const url = this.page.url();
        const pattern = /(?<=id=)\d+/;
        const match = url.match(pattern);
        
        if (match && match[0]) {
            return parseInt(match[0], 10);
        } else {
            throw new Error("Ticket ID not found in URL");
        }
    }

    /**
     * Get header text from the page
     * @returns The header text (h1)
     */
    async getHeaderText(): Promise<string> {
        const header = this.page.locator('h1');
        await header.waitFor({ state: 'visible', timeout: 10000 });
        const text = await header.textContent();
        return (text || '').trim();
    }

    /**
     * Get error message from the page
     * @returns The error message text
     */
    async getErrorMessage(): Promise<string> {
        await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
        const text = await this.errorMessage.textContent();
        return (text || '').trim();
    }

    /**
     * Get text from a specific column in the table
     * @param columnName The column name to find
     * @returns The text content of the cell
     */
    private async getColumnText(columnName: string): Promise<string> {
        // XPath: //tr[td[contains(text(),'ColumnName')]]/td[2]
        // Find row where first td contains column name, then get second td
        const cell = this.page.locator(
            `//tr[td[contains(text(),'${columnName}')]]/td[2]`
        );
        await cell.waitFor({ state: 'visible', timeout: 10000 });
        const text = await cell.textContent();
        return (text || '').trim();
    }

    /**
     * Get departure station from the table
     */
    private async getDepartStation(): Promise<Station> {
        const text = await this.getColumnText("Depart Station");
        const station = getStationFromText(text);
        if (!station) {
            throw new Error(`Station not found for text: ${text}`);
        }
        return station;
    }

    /**
     * Get arrival station from the table
     */
    private async getArriveStation(): Promise<Station> {
        const text = await this.getColumnText("Arrive Station");
        const station = getStationFromText(text);
        if (!station) {
            throw new Error(`Station not found for text: ${text}`);
        }
        return station;
    }

    /**
     * Get departure date from the table
     */
    private async getDepartDate(): Promise<Date> {
        const text = await this.getColumnText("Depart Date");
        // Parse date from format M/d/yyyy (e.g., "12/30/2025")
        const [month, day, year] = text.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    /**
     * Get seat type from the table
     */
    private async getSeatType(): Promise<SeatType> {
        const text = await this.getColumnText("Seat Type");
        const seatType = getSeatTypeFromText(text);
        if (!seatType) {
            throw new Error(`SeatType not found for text: ${text}`);
        }
        return seatType;
    }

    /**
     * Get amount from the table
     */
    private async getAmount(): Promise<number> {
        const text = await this.getColumnText("Amount");
        return parseInt(text, 10);
    }

    /**
     * Select departure date from dropdown
     * @param date The date to select
     */
    private async selectDepartDate(date: Date): Promise<void> {
        await this.departDateSelect.waitFor({ state: 'visible', timeout: 10000 });
        // Format date as M/d/yyyy
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        await this.departDateSelect.selectOption({ label: formattedDate });
    }

    /**
     * Select departure station from dropdown
     * @param station The station to select
     */
    private async selectDepartFrom(station: Station): Promise<void> {
        await this.departFromSelect.waitFor({ state: 'visible', timeout: 10000 });
        
        // Check if already selected
        const selectedOption = this.departFromSelect.locator('option:checked');
        const selectedText = await selectedOption.textContent();
        
        if (selectedText?.trim() === station) {
            return; // Already selected, no need to change
        }
        
        // Select the station
        await this.departFromSelect.selectOption({ label: station });
        
        // Wait for arriveAtSelect to become stale (reload) after departFrom changes
        // In Playwright, we wait for the select to be updated
        await this.page.waitForTimeout(500); // Give time for dropdown to update
        await this.arriveAtSelect.waitFor({ state: 'attached', timeout: 10000 });
    }

    /**
     * Select arrival station from dropdown
     * @param station The station to select
     */
    private async selectArriveAt(station: Station): Promise<void> {
        await this.arriveAtSelect.waitFor({ state: 'visible', timeout: 10000 });
        await this.arriveAtSelect.selectOption({ label: station });
    }

    /**
     * Select seat type from dropdown
     * @param type The seat type to select
     */
    private async selectSeatType(type: SeatType): Promise<void> {
        await this.seatTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
        await this.seatTypeSelect.selectOption({ label: type });
    }

    /**
     * Select amount from dropdown
     * @param amount The amount to select
     */
    private async selectAmount(amount: number): Promise<void> {
        await this.amountSelect.waitFor({ state: 'visible', timeout: 10000 });
        await this.amountSelect.selectOption({ label: amount.toString() });
    }

    /**
     * Click the Book Ticket button
     */
    private async clickBookTicketButton(): Promise<void> {
        await this.bookTicketButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.bookTicketButton.click();
    }

    /**
     * Check if a date option exists in the depart date select
     * @param date The date to check
     * @returns True if the date option exists, false otherwise
     */
    async isDateOptionExists(date: Date): Promise<boolean> {
        await this.departDateSelect.waitFor({ state: 'visible', timeout: 10000 });
        // Format date as M/d/yyyy
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        
        // Get all options and find the one matching the date
        const allOptions = this.departDateSelect.locator('option');
        const optionCount = await allOptions.count();
        
        for (let i = 0; i < optionCount; i++) {
            const option = allOptions.nth(i);
            const optionText = await option.textContent();
            if (optionText?.trim() === formattedDate) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a date option is disabled in the depart date select
     * @param date The date to check
     * @returns True if the date option is disabled, false if selectable, null if not found in dropdown
     */
    async isDateOptionDisabled(date: Date): Promise<boolean | null> {
        await this.departDateSelect.waitFor({ state: 'visible', timeout: 10000 });
        // Format date as M/d/yyyy
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        
        // Get all options and find the one matching the date
        const allOptions = this.departDateSelect.locator('option');
        const optionCount = await allOptions.count();
        
        for (let i = 0; i < optionCount; i++) {
            const option = allOptions.nth(i);
            const optionText = await option.textContent();
            if (optionText?.trim() === formattedDate) {
                // Option found, check if it's disabled
                const isDisabled = await option.getAttribute('disabled');
                return isDisabled !== null;
            }
        }
        
        // If option not found, return null to indicate it doesn't exist in dropdown
        return null;
    }

    /**
     * Get current page URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Check if user is redirected to login page
     */
    async isRedirectedToLogin(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        const url = this.page.url();
        const pageTitle = await this.page.locator('h1').textContent().catch(() => '') || '';
        return url.includes('/Login') || pageTitle.toLowerCase().includes('login');
    }

    /**
     * Verify route information on Book Ticket page
     * @param expectedDepartFrom Expected departure station
     * @param expectedArriveAt Expected arrival station
     * @returns True if route matches, false otherwise
     */
    async verifyRouteOnBookTicketPage(expectedDepartFrom: Station, expectedArriveAt: Station): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);

        // Check selected values in dropdowns
        const departFromSelect = this.page.locator('select[name="DepartStation"]');
        const arriveAtSelect = this.page.locator('select[name="ArriveStation"]');

        // Wait for selects to be visible
        await departFromSelect.waitFor({ state: 'visible', timeout: 10000 });
        await arriveAtSelect.waitFor({ state: 'visible', timeout: 10000 });

        // Get selected values
        const selectedDepartFrom = await departFromSelect.locator('option:checked').textContent().catch(() => '');
        const selectedArriveAt = await arriveAtSelect.locator('option:checked').textContent().catch(() => '');

        // Verify both match expected values
        const departMatches = selectedDepartFrom?.trim() === expectedDepartFrom;
        const arriveMatches = selectedArriveAt?.trim() === expectedArriveAt;

        return departMatches && arriveMatches;
    }
}

export default BookTicketPage;

