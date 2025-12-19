import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home.page";
import { RegisterPage } from "../pages/register.page";

test.describe('Register Flow', () => {
    let homePage: HomePage;
    let registerPage: RegisterPage;

    // Tạo dữ liệu test động - KHÔNG CẦN FAKER
    const timestamp = Date.now();
    //const testEmail = `` sử dụng e mail tĩnh để test tránh tạo nhiều tài khoản
    const testEmail = `test_${timestamp}@example.com`; // Tạo email unique với timestamp
    const testPassword = '123456789';
    // Tạo PID 9 chữ số random
    const testPID = Math.floor(Math.random() * 90000000 + 10000000).toString();

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        registerPage = new RegisterPage(page);
    });

    // test('Should register new account successfully', async ({ page }) => {
    //     // Bước 1: Mở Homepage
    //     await homePage.open();
        
    //     // Verify đang ở homepage
    //     const headerText = await homePage.getHeaderText();
    //     expect(headerText).toBeTruthy();

    //     // Bước 2: Điều hướng đến Register page
    //     await homePage.goToRegisterPage();
        
    //     // Verify đang ở register page
    //     await registerPage.verifyPageTitle('Create account');

    //     // Bước 3: Đăng ký tài khoản mới
    //     await registerPage.register(testEmail, testPassword, testPassword, testPID);
        
    //     // Verify đăng ký thành công
    //     const successMessage = await registerPage.getRegisterSuccessMessage();
    //     expect(successMessage.toLowerCase()).toContain("you're here");        
    // });

    test('Register with existing email should fail', async ({ page }) => {
        // tạo email mới
        const newEmail = `test147@gmail.com`;
        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(newEmail, testPassword, testPassword, testPID);
        const successMessage = await registerPage.getRegisterSuccessMessage();
        expect(successMessage.toLowerCase()).toContain("you're here"); 
        // reload lại trang homepage sau khi đăng ký thành công
        await homePage.goToRegisterPage();
        // Sử dụng email vừa tạo
        const existingEmail = 'test147@gmail.com'; // Email đã tồn tại
        
        // Thử đăng ký với email đã tồn tại
        await registerPage.register(existingEmail, testPassword, testPassword, testPID);
        
        // Verify có error message
        const errorMessage = await registerPage.getRegisterErrorMessage();
        expect(errorMessage).toBeTruthy();
    });

//     test('Register with mismatched passwords should fail', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToRegisterPage();
        
//         // Password và confirmPassword không khớp
//         await registerPage.register(testEmail, testPassword, 'DifferentPassword123!', testPID);
        
//         // Verify có error message
//         const errorMessage = await registerPage.getRegisterErrorMessage();
//         expect(errorMessage).toBeTruthy();
//     });

//     test('An error message displays when user tries to register with invalid email format', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToRegisterPage();
        
//         // Thử đăng ký với email format không hợp lệ (không có @)
//         const invalidEmail = 'invalidemailformat';
//         await registerPage.register(invalidEmail, testPassword, testPassword, testPID);
        
//         // Verify có error message đỏ chỉ ra email không hợp lệ
//         const errorMessage = await registerPage.getRegisterErrorMessage();
//         expect(errorMessage).toBeTruthy();
//         expect(errorMessage.toLowerCase()).toMatch(/invalid|error|format/i);
        
//         // Verify registration fails - không có success message
//         const successMessage = await registerPage.getRegisterSuccessMessage();
//         expect(successMessage.toLowerCase()).not.toContain("you're here");
//     });

//     test('An error message displays when user tries to register with invalid email length', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToRegisterPage();
        
//         // Test với email có độ dài < 6 characters
//         const shortEmail = 'a@b.c'; // 5 characters
//         await registerPage.register(shortEmail, testPassword, testPassword, testPID);
        
//         // Verify có error message chỉ ra email length không hợp lệ
//         let errorMessage = await registerPage.getRegisterErrorMessage();
//         expect(errorMessage).toBeTruthy();
//         expect(errorMessage.toLowerCase()).toMatch(/invalid|error|length|6|32/i);
        
//         // Verify registration fails - không có success message
//         let successMessage = await registerPage.getRegisterSuccessMessage();
//         expect(successMessage.toLowerCase()).not.toContain("you're here");
        
//         // Test với email có độ dài > 32 characters
//         await homePage.goToRegisterPage();
//         const longEmail = 'a'.repeat(30) + '@example.com'; // > 32 characters
//         await registerPage.register(longEmail, testPassword, testPassword, testPID);
        
//         // Verify có error message chỉ ra email length không hợp lệ
//         errorMessage = await registerPage.getRegisterErrorMessage();
//         expect(errorMessage).toBeTruthy();
//         expect(errorMessage.toLowerCase()).toMatch(/invalid|error|length|6|32/i);
        
//         // Verify registration fails - không có success message
//         successMessage = await registerPage.getRegisterSuccessMessage();
//         expect(successMessage.toLowerCase()).not.toContain("you're here");
//     });

//     test('An error message displays when the user tries to register with an empty email', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToRegisterPage();
        
//         // Thử đăng ký với email rỗng
//         await registerPage.register('', testPassword, testPassword, testPID);
        
//         // Verify có error message chỉ ra email field là required
//         const errorMessage = await registerPage.getRegisterErrorMessage();
//         expect(errorMessage).toBeTruthy();
//         // Error message có thể có format khác nhau, chỉ cần verify có error message là đủ
//         expect(errorMessage.length).toBeGreaterThan(0);
        
//         // Verify registration fails - không có success message
//         const successMessage = await registerPage.getRegisterSuccessMessage();
//         expect(successMessage.toLowerCase()).not.toContain("you're here");
//     });

//     test('An error message displays when the user tries to register with an empty password', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToRegisterPage();
        
//         // Thử đăng ký với password rỗng
//         await registerPage.register(testEmail, '', '', testPID);
        
//         // Verify có error message chỉ ra password field là required
//         const errorMessage = await registerPage.getRegisterErrorMessage();
//         expect(errorMessage).toBeTruthy();
//         // Error message có thể có format khác nhau, chỉ cần verify có error message là đủ
//         expect(errorMessage.length).toBeGreaterThan(0);
        
//         // Verify registration fails - không có success message
//         const successMessage = await registerPage.getRegisterSuccessMessage();
//         expect(successMessage.toLowerCase()).not.toContain("you're here");
//     });
});