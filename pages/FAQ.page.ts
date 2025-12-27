import { expect, Locator, Page } from "@playwright/test";

export class FAQPage {
    private readonly page: Page;
    private readonly questionLocator: Locator;

    constructor(page: Page) {
        this.page = page;
        // Try multiple selectors for FAQ questions
        this.questionLocator = this.page.locator(".faq-question").or(
            this.page.locator("[class*='question']").or(
                this.page.locator("//*[contains(@class, 'question')]")
            )
        );
    }

    /**
     * Click on the first available question in FAQ page
     */
    async clickAnyQuestion(): Promise<void> {
        await this.questionLocator.first().waitFor({ state: 'visible', timeout: 10000 });
        await this.questionLocator.first().click();
    }

    /**
     * Get count of questions on FAQ page
     */
    async getQuestionsCount(): Promise<number> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Give time for dynamic content
        return await this.questionLocator.count();
    }

    /**
     * Verify that the FAQ page is displayed properly
     */
    async verifyFAQPageDisplayed(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Give time for page to load

        // Verify page title/heading contains FAQ
        const pageTitle = await this.page.locator('h1').textContent();
        expect(pageTitle).toBeTruthy();
        if (pageTitle) {
            expect(pageTitle.toLowerCase()).toContain('faq');
        }

        // Verify FAQ content is visible
        const pageContent = await this.page.textContent('body');
        expect(pageContent).toBeTruthy();

        // Verify no errors appear
        const errorMessages = await this.page.locator('.error, .error-message').count();
        expect(errorMessages).toBe(0);

        // Verify page has some content (questions or FAQ text)
        const hasContent = await this.page.locator('p, div, li, [class*="faq"], [class*="question"]').count() > 0;
        expect(hasContent).toBeTruthy();
    }
}

export default FAQPage;

