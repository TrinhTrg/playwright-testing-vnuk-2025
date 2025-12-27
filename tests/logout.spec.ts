import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";

test.describe('Logout Tests', () => {
    const user = new User("test148@gmail.com", "123456789");

    test('Logout successfully', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        // Step 1: Open homepage
        await homePage.open();
        
        // Step 2: Go to Login page
        await homePage.goToLoginPage();
        
        // Step 3: Login
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);
        
        // Step 4: Verify greeting text shows welcome message with user email
        const greetingTextBeforeLogout = await homePage.getGreetingText();
        expect(greetingTextBeforeLogout).toBe(`Welcome ${user.email}`);
        
        // Step 5: Logout
        await homePage.goToLogout();
        
        // Step 6: Verify greeting text shows "Welcome guest!" after logout
        await page.waitForLoadState('networkidle');
        const greetingTextAfterLogout = await homePage.getGreetingText();
        expect(greetingTextAfterLogout).toBe("Welcome guest!");
    });
});

