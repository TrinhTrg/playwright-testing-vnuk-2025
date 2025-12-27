import { expect, Locator, Page } from "@playwright/test";

export class MyTicketPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Cancel ticket by ID
     * @param id The ticket ID to cancel
     */
    async cancelTicketByID(id: number): Promise<void> {
        // XPath: //input[@value='Cancel'][@onclick='DeleteTicket(id);']
        const cancelButton = this.page.locator(
            `//input[@value='Cancel'][@onclick='DeleteTicket(${id});']`
        );
        
        // Wait for button to be visible and clickable
        await cancelButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Set up dialog handler to automatically accept "Are you sure?" dialog
        // Dialog will show "Are you sure?" message with OK and Cancel buttons
        this.page.once('dialog', async (dialog) => {
            // Verify dialog message is "Are you sure?"
            expect(dialog.message()).toBe('Are you sure?');
            // Automatically click OK to confirm deletion
            await dialog.accept();
        });
        
        // Click the cancel button - dialog will be automatically accepted
        await cancelButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if cancel ticket button is displayed for a given ticket ID
     * @param id The ticket ID to check
     * @returns True if the cancel button is displayed, false otherwise
     */
    async isCancelTicketButtonDisplayed(id: number): Promise<boolean> {
        const cancelButton = this.page.locator(
            `//input[@value='Cancel'][@onclick='DeleteTicket(${id});']`
        );
        
        try {
            const count = await cancelButton.count();
            return count > 0 && await cancelButton.first().isVisible();
        } catch {
            return false;
        }
    }

    /**
     * Get locator for delete button by ticket ID
     * @param ticketId The ticket ID
     * @returns Locator for the delete button
     */
    private deleteButtonLocator(ticketId: number): Locator {
        // XPath: //tr[td[contains(text(),'ticketId')]]//input[@value='Delete']
        return this.page.locator(
            `//tr[td[contains(text(),'${ticketId}')]]//input[@value='Delete']`
        );
    }

    /**
     * Delete ticket by ID
     * @param ticketId The ticket ID to delete
     */
    async deleteTicketByID(ticketId: number): Promise<void> {
        const deleteButton = this.deleteButtonLocator(ticketId);
        
        // Wait for button to be visible and clickable
        await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Set up dialog handler to automatically accept "Are you sure?" dialog
        // Dialog will show "Are you sure?" message with OK and Cancel buttons
        this.page.once('dialog', async (dialog) => {
            // Verify dialog message is "Are you sure?"
            expect(dialog.message()).toBe('Are you sure?');
            // Automatically click OK to confirm deletion
            await dialog.accept();
        });
        
        // Click the delete button - dialog will be automatically accepted
        await deleteButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if ticket is displayed by ticket ID
     * @param ticketId The ticket ID to check
     * @returns True if the ticket is displayed, false otherwise
     */
    async isTicketDisplayed(ticketId: number): Promise<boolean> {
        const deleteButton = this.deleteButtonLocator(ticketId);
        
        try {
            await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
            return await deleteButton.isVisible();
        } catch {
            return false;
        }
    }

    /**
     * Get count of tickets in the table
     * @returns Number of ticket rows in the table
     */
    async getTicketRowsCount(): Promise<number> {
        await this.page.waitForLoadState('networkidle');
        // Count rows in the ticket table (excluding header row)
        // Use CSS selector (not XPath) - no @ symbol for attributes in CSS
        const tableRows = this.page.locator('table tbody tr').or(
            this.page.locator('table tr:has(input[value="Delete"])').or(
                this.page.locator('table tr:has(input[value="Cancel"])')
            )
        );
        return await tableRows.count();
    }

    /**
     * Check if filter function is displayed
     * @returns True if filter function is visible, false otherwise
     */
    async isFilterFunctionDisplayed(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Give time for page to fully render
        
        // Look for filter section - from the image, there's a "Filters:" heading with dropdowns and "Apply Filter" button
        // Use XPath to find elements containing "Filters:" text (more reliable)
        const filtersHeading = this.page.locator('//*[contains(text(), "Filters:")]').or(
            this.page.locator('//*[contains(text(), "Filter:")]').or(
                this.page.getByText('Filters:', { exact: false }).or(
                    this.page.getByText('Filter:', { exact: false })
                )
            )
        );
        
        // Look for "Apply Filter" button using multiple strategies
        const applyFilterButton = this.page.locator('//button[contains(text(), "Apply Filter")]').or(
            this.page.locator('//input[@value="Apply Filter"]').or(
                this.page.getByRole('button', { name: /apply filter/i }).or(
                    this.page.locator('button:has-text("Apply Filter")').or(
                        this.page.locator('input[value*="Apply Filter" i]')
                    )
                )
            )
        );
        
        try {
            // Strategy 1: Check if "Filters:" heading exists and is visible
            const headingCount = await filtersHeading.count();
            if (headingCount > 0) {
                const isHeadingVisible = await filtersHeading.first().isVisible();
                if (isHeadingVisible) {
                    return true;
                }
            }
            
            // Strategy 2: Check if "Apply Filter" button exists and is visible
            const buttonCount = await applyFilterButton.count();
            if (buttonCount > 0) {
                const isButtonVisible = await applyFilterButton.first().isVisible();
                if (isButtonVisible) {
                    return true;
                }
            }
            
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Check if cancel button is displayed for a ticket ID
     * @param id The ticket ID to check
     * @returns True if cancel button is displayed, false otherwise
     */
    async isCancelButtonDisplayed(id: number): Promise<boolean> {
        return await this.isCancelTicketButtonDisplayed(id);
    }

    /**
     * Get ticket ID from the first row in the table
     * @returns Ticket ID from the first row, or null if not found
     */
    async getFirstTicketID(): Promise<number | null> {
        await this.page.waitForLoadState('networkidle');
        // Try to find ticket ID in the first row - could be in URL, text, or data attribute
        const firstRow = this.page.locator('table tbody tr').first().or(
            this.page.locator('table tr:has(input[value="Delete"])').first()
        );
        
        try {
            const rowText = await firstRow.textContent();
            if (rowText) {
                // Try to extract ticket ID from row text (look for numbers that could be ticket ID)
                // Or look for link with ticket ID in href
                const ticketLink = firstRow.locator('a[href*="id="]').first();
                const href = await ticketLink.getAttribute('href').catch(() => null);
                if (href) {
                    const match = href.match(/id=(\d+)/);
                    if (match && match[1]) {
                        return parseInt(match[1], 10);
                    }
                }
                
                // Alternative: look for ticket ID in the row text (usually first column or specific column)
                // Extract number from row - this is a fallback
                const numbers = rowText.match(/\d+/g);
                if (numbers && numbers.length > 0) {
                    // Try to use the first significant number (could be ticket ID)
                    return parseInt(numbers[0], 10);
                }
            }
        } catch {
            // Ignore
        }
        
        return null;
    }

    /**
     * Delete the first ticket in the table (ticket with Delete button)
     */
    async deleteFirstTicket(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        // Use CSS selector (not XPath) - no @ symbol for attributes in CSS
        const firstDeleteButton = this.page.locator('table tr:has(input[value="Delete"]) input[value="Delete"]').first();
        
        await firstDeleteButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Set up dialog handler to automatically accept "Are you sure?" dialog
        // Dialog will show "Are you sure?" message with OK and Cancel buttons
        this.page.once('dialog', async (dialog) => {
            // Verify dialog message is "Are you sure?"
            expect(dialog.message()).toBe('Are you sure?');
            // Automatically click OK to confirm deletion
            await dialog.accept();
        });
        
        // Click the delete button - dialog will be automatically accepted
        await firstDeleteButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Cancel the first ticket in the table (ticket with Cancel button)
     */
    async cancelFirstTicket(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        // Use CSS selector to find first Cancel button
        const firstCancelButton = this.page.locator('table tr:has(input[value="Cancel"]) input[value="Cancel"]').first();
        
        await firstCancelButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Set up dialog handler to automatically accept "Are you sure?" dialog
        // Dialog will show "Are you sure?" message with OK and Cancel buttons
        this.page.once('dialog', async (dialog) => {
            // Verify dialog message is "Are you sure?"
            expect(dialog.message()).toBe('Are you sure?');
            // Automatically click OK to confirm cancellation
            await dialog.accept();
        });
        
        // Click the cancel button - dialog will be automatically accepted
        await firstCancelButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if expired ticket is displayed in the table
     * Expired tickets have status "Expired" (usually in red text)
     * @returns True if expired ticket is displayed, false otherwise
     */
    async isTicketExpiredDisplayed(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        // Look for rows with "Expired" status that also have a Delete button
        // Expired tickets have status "Expired" and can be deleted
        // Use XPath to find table row containing "Expired" text and Delete button
        const expiredTicketRow = this.page.locator('//table//tr[contains(., "Expired") and .//input[@value="Delete"]]');
        
        try {
            const count = await expiredTicketRow.count();
            if (count > 0) {
                return await expiredTicketRow.first().isVisible();
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Delete expired ticket (first expired ticket found in the table)
     */
    async deleteTicketExpired(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        // Find the first expired ticket row that has a Delete button
        // Use XPath to find table row containing "Expired" text and Delete button
        const expiredTicketRow = this.page.locator('//table//tr[contains(., "Expired") and .//input[@value="Delete"]]').first();
        
        // Use CSS selector (not XPath) when chaining from XPath locator
        const deleteButton = expiredTicketRow.locator('input[value="Delete"]');
        
        await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Set up dialog handler to automatically accept "Are you sure?" dialog
        // Dialog will show "Are you sure?" message with OK and Cancel buttons
        this.page.once('dialog', async (dialog) => {
            // Verify dialog message is "Are you sure?"
            expect(dialog.message()).toBe('Are you sure?');
            // Automatically click OK to confirm deletion
            await dialog.accept();
        });
        
        // Click the delete button - dialog will be automatically accepted
        await deleteButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}

export default MyTicketPage;

