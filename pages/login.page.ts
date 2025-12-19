import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
    private readonly page: Page;
    private readonly usernameTxt: Locator;
    private readonly passwordTxt: Locator;
    private readonly loginBtn: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameTxt = this.page.locator('#username');
        this.passwordTxt = this.page.locator('#password');
        this.loginBtn = this.page.locator('input[value="Login"]');
        this.errorMessage = this.page.locator('.error-message');
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameTxt.fill(username);
        await this.passwordTxt.fill(password);
        await this.loginBtn.click();
    }

    async getLoginErrorMessage(): Promise<string> {
        // Đợi một chút để page xử lý form submission
        await this.page.waitForTimeout(1000);
        
        // Thử tìm error message ở nhiều nơi có thể
        const errorSelectors = [
            'p.message.error', // Error message với class message error
            '.error-message',
            'span.field-validation-error',
            '.validation-summary-errors',
            '[class*="error"]',
            '#content p.message.error', // Error message trong content
            '#content p' // Có thể error message hiển thị trong content paragraph
        ];
        
        for (const selector of errorSelectors) {
            try {
                const element = this.page.locator(selector).first();
                const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
                if (isVisible) {
                    const text = await element.textContent();
                    if (text && text.trim()) {
                        // Kiểm tra xem có phải error message không
                        const lowerText = text.toLowerCase();
                        // Nếu có class error hoặc text chứa các từ khóa error thì return
                        if (lowerText.includes('error') || 
                            lowerText.includes('invalid') || 
                            lowerText.includes('blank') ||
                            lowerText.includes('format') ||
                            lowerText.includes('cannot') ||
                            lowerText.includes('failed') ||
                            lowerText.includes('locked') ||
                            lowerText.includes('incorrect')) {
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
            const allParagraphs = this.page.locator('#content p, p');
            const count = await allParagraphs.count();
            
            for (let i = 0; i < count; i++) {
                const paragraph = allParagraphs.nth(i);
                const text = await paragraph.textContent();
                if (text) {
                    const lowerText = text.toLowerCase();
                    // Nếu là error message (có các từ khóa error và không phải info text)
                    if ((lowerText.includes('error') || 
                         lowerText.includes('invalid') ||
                         lowerText.includes('blank') ||
                         lowerText.includes('cannot') ||
                         lowerText.includes('format') ||
                         lowerText.includes('failed') ||
                         lowerText.includes('locked') ||
                         lowerText.includes('incorrect') ||
                         lowerText.includes('try again')) &&
                        !lowerText.includes('need to login') && // Loại bỏ info text
                        !lowerText.includes('if you don')) { // Loại bỏ info text
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

    async clearForm(): Promise<void> {
        await this.usernameTxt.clear();
        await this.passwordTxt.clear();
    }

    async verifyPageTitle(expectedText: string): Promise<void> {
        await expect(this.page.locator('h1')).toContainText(new RegExp(expectedText, 'i'));
    }
}

export default LoginPage;