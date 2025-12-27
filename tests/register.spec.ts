import { test, expect } from "../fixtures/test";
import { RegisterForm } from "../models/register-form.model";

test.describe('Register Flow', () => {
    const testRegisterForm = new RegisterForm("test156@gmail.com", "123456789", "123456789", "123456789");

    test('Should register new account successfully', async ({ 
        homePage,
        registerPage,
        page
     }) => {
        // Bước 1: Mở Homepage
        await homePage.open();
        
        // Verify đang ở homepage
        const headerText = await homePage.getHeaderText();
        expect(headerText).toBeTruthy();

        // Bước 2: Điều hướng đến Register page
        await homePage.goToRegisterPage();
        
        // Verify đang ở register page
        await registerPage.verifyPageTitle('Create account');

        // Bước 3: Đăng ký tài khoản mới
        await registerPage.register(testRegisterForm.email, testRegisterForm.password, testRegisterForm.confirmPassword, testRegisterForm.pid);
        
        // Verify đăng ký thành công
        const successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).toContain("you're here");        
    });

    test('Register with existing email should fail', async ({
        homePage,
        registerPage,
        page
    }) => {
        // Tạo form mới để đăng ký lần đầu
        const newRegisterForm = new RegisterForm(
            'test157@gmail.com',
            testRegisterForm.password,
            testRegisterForm.confirmPassword,
            testRegisterForm.pid
        );
        
        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(
            newRegisterForm.email,
            newRegisterForm.password,
            newRegisterForm.confirmPassword,
            newRegisterForm.pid
        );
        const successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).toContain("you're here"); 
        
        // Reload lại trang homepage sau khi đăng ký thành công
        await homePage.goToRegisterPage();
        
        // Sử dụng email vừa tạo - tạo form với email đã tồn tại
        const existingRegisterForm = new RegisterForm(
            'test157@gmail.com', // Email đã tồn tại
            testRegisterForm.password,
            testRegisterForm.confirmPassword,
            testRegisterForm.pid
        );
        
        // Thử đăng ký với email đã tồn tại
        await registerPage.register(
            existingRegisterForm.email,
            existingRegisterForm.password,
            existingRegisterForm.confirmPassword,
            existingRegisterForm.pid
        );
        
        // Verify có error message
        const errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
    });

    test('Register with mismatched passwords should fail', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Password và confirmPassword không khớp
        const mismatchedPasswordForm = new RegisterForm(
            testRegisterForm.email,
            testRegisterForm.password,
            'DifferentPassword123!', // confirmPassword khác password
            testRegisterForm.pid
        );
        
        await registerPage.register(
            mismatchedPasswordForm.email,
            mismatchedPasswordForm.password,
            mismatchedPasswordForm.confirmPassword,
            mismatchedPasswordForm.pid
        );
        
        // Verify có error message
        const errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
    });

    test('An error message displays when user tries to register with invalid email format', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Thử đăng ký với email format không hợp lệ (không có @)
        const invalidEmailForm = new RegisterForm(
            'invalidemailformat', // Email không hợp lệ
            testRegisterForm.password,
            testRegisterForm.confirmPassword,
            testRegisterForm.pid
        );
        
        await registerPage.register(
            invalidEmailForm.email,
            invalidEmailForm.password,
            invalidEmailForm.confirmPassword,
            invalidEmailForm.pid
        );
        
        // Verify có error message đỏ chỉ ra email không hợp lệ
        const errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.toLowerCase()).toMatch(/invalid|error|format/i);
        
        // Verify registration fails - không có success message
        const successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).not.toContain("you're here");
    });

    test('An error message displays when user tries to register with invalid email length', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Test với email có độ dài < 6 characters
        const shortEmailForm = new RegisterForm(
            'a@b.c', // 5 characters - quá ngắn
            testRegisterForm.password,
            testRegisterForm.confirmPassword,
            testRegisterForm.pid
        );
        
        await registerPage.register(
            shortEmailForm.email,
            shortEmailForm.password,
            shortEmailForm.confirmPassword,
            shortEmailForm.pid
        );
        
        // Verify có error message chỉ ra email length không hợp lệ
        let errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.toLowerCase()).toMatch(/invalid|error|length|6|32/i);
        
        // Verify registration fails - không có success message
        let successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).not.toContain("you're here");
        
        // Test với email có độ dài > 32 characters
        await homePage.goToRegisterPage();
        const longEmailForm = new RegisterForm(
            'a'.repeat(30) + '@example.com', // > 32 characters - quá dài
            testRegisterForm.password,
            testRegisterForm.confirmPassword,
            testRegisterForm.pid
        );
        
        await registerPage.register(
            longEmailForm.email,
            longEmailForm.password,
            longEmailForm.confirmPassword,
            longEmailForm.pid
        );
        
        // Verify có error message chỉ ra email length không hợp lệ
        errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.toLowerCase()).toMatch(/invalid|error|length|6|32/i);
        
        // Verify registration fails - không có success message
        successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).not.toContain("you're here");
    });

    test('An error message displays when the user tries to register with an empty email', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Thử đăng ký với email rỗng
        const emptyEmailForm = new RegisterForm(
            '', // Email rỗng
            testRegisterForm.password,
            testRegisterForm.confirmPassword,
            testRegisterForm.pid
        );
        
        await registerPage.register(
            emptyEmailForm.email,
            emptyEmailForm.password,
            emptyEmailForm.confirmPassword,
            emptyEmailForm.pid
        );
        
        // Verify có error message chỉ ra email field là required
        const errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
        // Error message có thể có format khác nhau, chỉ cần verify có error message là đủ
        expect(errorMessage.length).toBeGreaterThan(0);
        
        // Verify registration fails - không có success message
        const successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).not.toContain("you're here");
    });

    test('An error message displays when the user tries to register with an empty password', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Thử đăng ký với password rỗng
        const emptyPasswordForm = new RegisterForm(
            testRegisterForm.email,
            '', // Password rỗng
            '', // ConfirmPassword rỗng
            testRegisterForm.pid
        );
        
        await registerPage.register(
            emptyPasswordForm.email,
            emptyPasswordForm.password,
            emptyPasswordForm.confirmPassword,
            emptyPasswordForm.pid
        );
        
        // Verify có error message chỉ ra password field là required
        const errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
        // Error message có thể có format khác nhau, chỉ cần verify có error message là đủ
        expect(errorMessage.length).toBeGreaterThan(0);
        
        // Verify registration fails - không có success message
        const successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).not.toContain("you're here");
    });

    test('Verify password field has show password icon', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Verify password field has show password icon
        await registerPage.verifyPasswordFieldHasShowPasswordIcon();
    });

    test('Verify confirm password field has show password icon', async ({ 
        homePage, 
        registerPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToRegisterPage();
        
        // Verify confirm password field has show password icon
        await registerPage.verifyConfirmPasswordFieldHasShowPasswordIcon();
    });
});