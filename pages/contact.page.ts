import { expect, Locator, Page } from "@playwright/test";

export class ContactPage {
    private readonly page: Page;
    private readonly header: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = this.page.locator('h1');
    }

    /**
     * Get header text of the contact page
     * @returns The header text
     */
    async getHeader(): Promise<string> {
        await this.header.waitFor({ state: 'visible', timeout: 10000 });
        const headerText = await this.header.textContent();
        return (headerText || '').trim();
    }

    /**
     * Verify that the Contact page is displayed properly
     */
    async verifyContactPageDisplayed(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Give time for page to load

        // Verify page title/heading contains Contact
        const pageTitle = await this.page.locator('h1').textContent();
        expect(pageTitle).toBeTruthy();
        if (pageTitle) {
            expect(pageTitle.toLowerCase()).toContain('contact');
        }

        // Verify Contact content is visible
        const pageContent = await this.page.textContent('body');
        expect(pageContent).toBeTruthy();

        // Verify no errors appear
        const errorMessages = await this.page.locator('.error, .error-message').count();
        expect(errorMessages).toBe(0);

        // Verify page has some content
        const hasContent = await this.page.locator('p, div, li, [class*="contact"]').count() > 0;
        expect(hasContent).toBeTruthy();
    }
}

export default ContactPage;

