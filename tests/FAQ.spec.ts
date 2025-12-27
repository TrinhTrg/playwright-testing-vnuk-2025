import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";

test.describe('FAQ Tests', () => {
    const user = new User('test147@gmail.com', '123456789');

    test('Verify FAQ page is displayed properly without logging in', async ({ 
        homePage, 
        faqPage,
        page 
    }) => {
        // Step 1: Open homepage (without logging in)
        await homePage.open();
        await page.waitForLoadState('networkidle');

        // Step 2: Go to FAQ page
        await homePage.goToFAQPage();
        await page.waitForLoadState('networkidle');

        // Step 3: Verify that the FAQ page is displayed properly
        await faqPage.verifyFAQPageDisplayed();
    });
    test('Verify FAQ page is displayed properly with logging in', async ({ 
        homePage, 
        loginPage, 
        faqPage,
        page 
    }) => {
        // Step 1: Open homepage
        await homePage.open();
        // Step 2: Go to Login page
        await homePage.goToLoginPage();
        // Step 3: Login with user credentials
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);
        // Step 2: Go to FAQ page
        await homePage.goToFAQPage();
        await page.waitForLoadState('networkidle');
        // Step 3: Verify that the FAQ page is displayed properly
        await faqPage.verifyFAQPageDisplayed();
    });
});

