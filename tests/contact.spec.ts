import { test, expect } from "../fixtures/test";

test.describe('Contact Tests', () => {
    test('Verify Contact page is displayed properly without logging in', async ({ 
        homePage, 
        contactPage,
        page 
    }) => {
        // Step 1: Open homepage (without logging in)
        await homePage.open();
        await page.waitForLoadState('networkidle');

        // Step 2: Go to Contact page
        await homePage.goToContactPage();
        await page.waitForLoadState('networkidle');

        // Step 3: Verify that the Contact page is displayed properly
        await contactPage.verifyContactPageDisplayed();
    });
});

