import { expect, Locator, Page } from "@playwright/test";

export class RegisterPage {
    private readonly page: Page;
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly pidInput: Locator;
    private readonly registerButton: Locator;
    private readonly successMessage: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = this.page.locator('#email');
        this.passwordInput = this.page.locator('#password');
        this.confirmPasswordInput = this.page.locator('#confirmPassword');
        this.pidInput = this.page.locator('#pid');
        this.registerButton = this.page.locator('input[type="submit"]');
        this.successMessage = this.page.locator('#content p');
        this.errorMessage = this.page.locator('.error-message');
    }

    async register(email: string, password: string, confirmPassword: string, pid: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(confirmPassword);
        await this.pidInput.fill(pid);
        
        // Scroll to button và click
        await this.registerButton.scrollIntoViewIfNeeded();
        await this.registerButton.click();
    }

    async getRegisterSuccessMessage(): Promise<string> {
        // Tìm success message cụ thể - message chứa "you're here"
        try {
            // Tìm paragraph có text chứa "you're here"
            const allParagraphs = this.page.locator('#content p');
            const count = await allParagraphs.count();
            
            for (let i = 0; i < count; i++) {
                const paragraph = allParagraphs.nth(i);
                const text = await paragraph.textContent();
                if (text && text.toLowerCase().includes("you're here")) {
                    return text.trim();
                }
            }
            
            return '';
        } catch {
            return '';
        }
    }

    async getRegisterErrorMessage(): Promise<string> {
        // Đợi một chút để page xử lý form submission
        await this.page.waitForTimeout(1000);
        
        // Thử tìm error message ở nhiều nơi có thể
        const errorSelectors = [
            'p.message.error', // Error message với class message error
            '.error-message',
            'span.field-validation-error',
            '.validation-summary-errors',
            '[class*="error"]',
            '#content p.message.error' // Error message trong content
        ];
        
        for (const selector of errorSelectors) {
            try {
                const element = this.page.locator(selector).first();
                const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        // Kiểm tra xem có phải error message không (không phải success message)
                        const lowerText = text.toLowerCase();
                        // Nếu có class error hoặc text chứa các từ khóa error thì return
                        if (lowerText.includes('error') || 
                            lowerText.includes('exist') || 
                            lowerText.includes('invalid') || 
                            lowerText.includes('fail') ||
                            lowerText.includes('already') ||
                            lowerText.includes('match') ||
                            lowerText.includes('in use')) {
                            return text.trim();
                        }
                    }
                }
            } catch {
                continue;
            }
        }
        
        // Fallback: tìm tất cả paragraph và filter error message
        try {
            const allParagraphs = this.page.locator('#content p');
            const count = await allParagraphs.count();
            
            for (let i = 0; i < count; i++) {
                const paragraph = allParagraphs.nth(i);
                const text = await paragraph.textContent();
                if (text) {
                    const lowerText = text.toLowerCase();
                    // Nếu là error message (có các từ khóa error và không phải success)
                    if ((lowerText.includes('error') || 
                         lowerText.includes('already') ||
                         lowerText.includes('invalid') ||
                         lowerText.includes('exist') ||
                         lowerText.includes('in use')) &&
                        !lowerText.includes("you're here")) {
                        return text.trim();
                    }
                }
            }
        } catch {
            // Ignore
        }
        
        return '';
    }

    async isErrorMessageVisible(): Promise<boolean> {
        try {
            await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
            return await this.errorMessage.isVisible();
        } catch {
            return false;
        }
    }

    async verifyPageTitle(expectedText: string): Promise<void> {
        await expect(this.page.locator('h1')).toContainText(new RegExp(expectedText, 'i'));
    }
    async clickTestHereLink(): Promise<void> {
        // From page snapshot, the link text is "here" with URL /Confirm.cshtml
        const hereLink = this.page.getByRole('link', { name: 'here' }).or(
            this.page.locator('a:has-text("here")').or(
                this.page.locator('//a[contains(text(), "here")]').filter({ hasText: /^here$/i })
            )
        );
        await hereLink.waitFor({ state: 'visible', timeout: 10000 });
        await hereLink.click();
    }

    /**
     * Verify password field has show password icon
     */
    async verifyPasswordFieldHasShowPasswordIcon(): Promise<void> {
        // Find show password icon near password input field
        // Common patterns: button/icon with class containing "show", "eye", "toggle", "password"
        const showPasswordIcon = this.page.locator('#password').locator('..').locator('button[class*="show" i], button[class*="eye" i], button[class*="toggle" i]').or(
            this.page.locator('#password').locator('..').locator('[class*="show-password" i], [class*="eye" i], [class*="toggle-password" i]').or(
                this.page.locator('button[aria-label*="show" i][aria-label*="password" i]').or(
                    this.page.locator('button[title*="show" i][title*="password" i]').or(
                        this.page.locator('//button[contains(@aria-label, "show") and contains(@aria-label, "password")]').or(
                            this.page.locator('//button[contains(@title, "show") and contains(@title, "password")]')
                        )
                    )
                )
            )
        );
        await showPasswordIcon.waitFor({ state: 'visible', timeout: 10000 });
        expect(await showPasswordIcon.isVisible()).toBeTruthy();
    }

    /**
     * Verify confirm password field has show password icon
     */
    async verifyConfirmPasswordFieldHasShowPasswordIcon(): Promise<void> {
        // Find show password icon near confirm password input field
        const showPasswordIcon = this.page.locator('#confirmPassword').locator('..').locator('button[class*="show" i], button[class*="eye" i], button[class*="toggle" i]').or(
            this.page.locator('#confirmPassword').locator('..').locator('[class*="show-password" i], [class*="eye" i], [class*="toggle-password" i]').or(
                this.page.locator('button[aria-label*="show" i][aria-label*="password" i]').or(
                    this.page.locator('button[title*="show" i][title*="password" i]').or(
                        this.page.locator('//button[contains(@aria-label, "show") and contains(@aria-label, "password")]').or(
                            this.page.locator('//button[contains(@title, "show") and contains(@title, "password")]')
                        )
                    )
                )
            )
        );
        await showPasswordIcon.waitFor({ state: 'visible', timeout: 10000 });
        expect(await showPasswordIcon.isVisible()).toBeTruthy();
    }
}

export default RegisterPage;