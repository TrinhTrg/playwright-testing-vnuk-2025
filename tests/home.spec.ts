import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";

test.describe('Home Tests', () => {
    const user = new User('test147@gmail.com', '123456789');

    test('Verify homepage is displayed properly and logging in', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        // Step 1: Đợi trang mở
        await homePage.open();
        await page.waitForLoadState('networkidle');

        // Step 2: Verify homepage có dòng title h1 'Welcome to Safe Railway'
        const headerText = await homePage.getHeaderText();
        expect(headerText).toContain('Welcome to Safe Railway');

        // Step 3: Vào trang login
        await homePage.goToLoginPage();
        await page.waitForLoadState('networkidle');

        // Step 4: Đăng nhập
        await loginPage.login(user.email, user.password);
        await page.waitForLoadState('networkidle');

        // Step 5: Verify hiển thị dòng 'welcome + email user'
        await homePage.shouldWelcomeMsgVisible(user.email);
        
        // Verify greeting text chứa welcome và email
        const greetingText = await homePage.getGreetingText();
        expect(greetingText).toContain('Welcome');
        expect(greetingText).toContain(user.email);
    });
});

