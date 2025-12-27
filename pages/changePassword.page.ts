import { expect, Locator, Page } from "@playwright/test";
import { ChangePasswordForm } from "../models/change-password-form.model";

export class ChangePasswordPage {
    private readonly page: Page;
    private readonly currentPasswordInput: Locator;
    private readonly newPasswordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly changePasswordButton: Locator;
    private readonly changePasswordSuccessMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.currentPasswordInput = this.page.locator('#currentPassword');
        this.newPasswordInput = this.page.locator('#newPassword');
        this.confirmPasswordInput = this.page.locator('#confirmPassword');
        this.changePasswordButton = this.page.locator('input[type="submit"]');
        this.changePasswordSuccessMessage = this.page.locator('p.message.success').or(
            this.page.locator('p:has-text("Your password has been updated!")').or(
                this.page.locator('#content p.message.success')
            )
        );
    }

    /**
     * Get change password success message
     * @returns The success message text
     */
    async getChangePasswordSuccessMessage(): Promise<string> {
        await this.changePasswordSuccessMessage.waitFor({ state: 'visible', timeout: 10000 });
        const text = await this.changePasswordSuccessMessage.textContent();
        return (text || '').trim();
    }

    /**
     * Change password with the provided form data
     * @param form The change password form data
     */
    async changePassword(form: ChangePasswordForm): Promise<void> {
        await this.enterCurrentPassword(form.currentPassword);
        await this.enterNewPassword(form.newPassword);
        await this.enterConfirmPassword(form.confirmPassword);
        
        // Scroll into view before clicking (similar to Java DriverUtils.scrollIntoView)
        await this.changePasswordButton.scrollIntoViewIfNeeded();
        await this.clickChangePasswordButton();
    }

    /**
     * Enter current password
     * @param currentPassword The current password
     */
    private async enterCurrentPassword(currentPassword: string): Promise<void> {
        await this.currentPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.currentPasswordInput.fill(currentPassword);
    }

    /**
     * Enter new password
     * @param newPassword The new password
     */
    private async enterNewPassword(newPassword: string): Promise<void> {
        await this.newPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.newPasswordInput.fill(newPassword);
    }

    /**
     * Enter confirm password
     * @param confirmPassword The confirm password
     */
    private async enterConfirmPassword(confirmPassword: string): Promise<void> {
        await this.confirmPasswordInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.confirmPasswordInput.fill(confirmPassword);
    }

    /**
     * Click change password button
     */
    private async clickChangePasswordButton(): Promise<void> {
        await this.changePasswordButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.changePasswordButton.click();
    }
}

export default ChangePasswordPage;

