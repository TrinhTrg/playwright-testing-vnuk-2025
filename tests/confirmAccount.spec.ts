import { test, expect } from "../fixtures/test";
import { RegisterForm } from "../models/register-form.model";

test.describe('Confirm Account Tests', () => {
    const registerForm = new RegisterForm("test160@gmail.com", "123456789", "123456789", "123456789");

    test('Confirm account successfully', async ({ 
        homePage, 
        registerPage,
        confirmAccountPage,
        page 
    }) => {
        // Step 1: Đợi homepage open
        await homePage.open();
        await page.waitForLoadState('networkidle');
        
        // Step 2: Vào trang register
        await homePage.goToRegisterPage();
        await page.waitForLoadState('networkidle');
        
        // Step 3: Đăng ký email mới
        await registerPage.register(
            registerForm.email,
            registerForm.password,
            registerForm.confirmPassword,
            registerForm.pid
        );
        await registerPage.getRegisterSuccessMessage();
        await page.waitForLoadState('networkidle');
        
        // Step 4: Reload lại trang đăng ký
        await homePage.goToRegisterPage();
        
        // Step 5: Đợi trang đăng ký hiển thị
        await registerPage.verifyPageTitle('Create account');
        
        // Step 6: Click link "test here"
        await registerPage.clickTestHereLink();
        
        // Step 7: Đợi confirm page load
        await page.waitForLoadState('networkidle');
        
        // Step 8: Xác nhận có dòng "Confirmation Code"
        await confirmAccountPage.verifyPageLoaded();
        
        // Step 9: Fill email vừa tạo vào input
        await confirmAccountPage.fillEmail(registerForm.email);
        
        // Step 10: Click Confirm button
        await confirmAccountPage.clickConfirmButton();
        await page.waitForLoadState('networkidle');
        
        // Step 11: Verify đúng (success message hoặc redirect)
        const confirmSuccessMessage = await confirmAccountPage.getSuccessMessage();
        expect(confirmSuccessMessage).toBeTruthy();
    });
});

