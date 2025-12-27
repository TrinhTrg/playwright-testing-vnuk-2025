import { expect, Locator, Page } from "@playwright/test";

export class ConfirmAccountPage {
    private readonly page: Page;
    private readonly emailInput: Locator;
    private readonly confirmButton: Locator;
    private readonly confirmationCodeLabel: Locator;

    constructor(page: Page) {
        this.page = page;
        // Input field for confirmation code (not email) - try multiple selectors
        this.emailInput = this.page.locator('input[type="text"]').or(
            this.page.locator('input[name*="code" i]').or(
                this.page.locator('input[id*="code" i]').or(
                    this.page.locator('input[name*="email" i]').or(
                        this.page.locator('input[id*="email" i]').or(
                            this.page.locator('input[type="email"]').or(
                                // Fallback: first input in the form
                                this.page.locator('#content input[type="text"], #content input[type="email"]').first()
                            )
                        )
                    )
                )
            )
        );
        this.confirmButton = this.page.locator('input[type="submit"][value*="Confirm" i]').or(
            this.page.locator('button:has-text("Confirm")').or(
                this.page.getByRole('button', { name: /confirm/i })
            )
        );
        this.confirmationCodeLabel = this.page.getByText('Confirmation Code', { exact: false }).or(
            this.page.locator('label:has-text("Confirmation Code")')
        );
    }

    /**
     * Verify confirm account page is loaded
     */
    async verifyPageLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        // Verify "Confirmation Code" text is present
        const hasConfirmationCode = await this.confirmationCodeLabel.count();
        expect(hasConfirmationCode).toBeGreaterThan(0);
    }

    /**
     * Fill email in the confirmation form
     * @param email The email to fill
     */
    async fillEmail(email: string): Promise<void> {
        // Wait for input to be visible and enabled
        await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.emailInput.waitFor({ state: 'attached', timeout: 10000 });
        // Clear any existing value first
        await this.emailInput.clear();
        // Fill the email
        await this.emailInput.fill(email);
        // Verify the value was filled
        const value = await this.emailInput.inputValue();
        expect(value).toBe(email);
    }

    /**
     * Click Confirm button
     */
    async clickConfirmButton(): Promise<void> {
        await this.confirmButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.confirmButton.click();
    }

    /**
     * Confirm account with email
     * @param email The email to confirm
     */
    async confirmAccount(email: string): Promise<void> {
        await this.fillEmail(email);
        await this.clickConfirmButton();
    }

    /**
     * Get success message after confirmation
     * @returns The success message text
     */
    async getSuccessMessage(): Promise<string> {
        await this.page.waitForLoadState('networkidle');
        const successMessage = this.page.locator('p.message.success').or(
            this.page.locator('#content p:has-text("confirmed")').or(
                this.page.locator('#content p:has-text("success")')
            )
        );
        await successMessage.waitFor({ state: 'visible', timeout: 10000 });
        const text = await successMessage.textContent();
        return (text || '').trim();
    }
}

export default ConfirmAccountPage;

