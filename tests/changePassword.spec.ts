import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";
import { ChangePasswordForm } from "../models/change-password-form.model";

test.describe('Change Password Tests', () => {
    const user = new User("trinhdo910@gmail.com", "12345678");

    test('Change password successfully', async ({ 
        homePage, 
        loginPage,
        changePasswordPage,
        page 
    }) => {
        // Step 1: Open homepage
        await homePage.open();
        
        // Step 2: Go to Login page
        await homePage.goToLoginPage();
        
        // Step 3: Login
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);
        
        // Step 4: Go to Change Password page
        await homePage.goToChangePasswordPage();
        await page.waitForLoadState('networkidle');
        
        // Step 5: Generate new password and create change password form
        const newPassword = "trinh123456";
        const changePasswordForm = new ChangePasswordForm(
            user.password, // current password
            newPassword,  // new password
            newPassword   // confirm password (same as new password)
        );
        
        // Step 6: Change password
        await changePasswordPage.changePassword(changePasswordForm);
        await page.waitForLoadState('networkidle');
        
        // Step 7: Verify success message
        const successMessage = await changePasswordPage.getChangePasswordSuccessMessage();
        expect(successMessage).toBe("Your password has been updated!");
    });
});

