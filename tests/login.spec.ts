import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home.page";
import { LoginPage } from "../pages/login.page";

test.describe('Login Tests', () => {
    let homePage: HomePage;
    let loginPage: LoginPage;
    const testEmail = 'cijnuj@ramcloud.us';
    const validPassword = '123456789';
    
    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        loginPage = new LoginPage(page);
    });

    test('Verify user can login successfully', async ({ page }) => {
        await homePage.open();
        const headerText = await homePage.getHeaderText();
        expect(headerText).toBeTruthy();
        await homePage.goToLoginPage();
        await loginPage.login(testEmail, validPassword);
        await homePage.shouldWelcomeMsgVisible(testEmail);
        
        const greetingText = await homePage.getGreetingText();
        expect(greetingText).toBe(`Welcome ${testEmail}`);
    });

    test('Verify error message for non-existing email', async ({ page }) => {
        await homePage.open();
        const headerText = await homePage.getHeaderText();
        expect(headerText).toBeTruthy();
        await homePage.goToLoginPage();
        await loginPage.login('nonexisting@domain.com', validPassword);
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });
    
    test('Verify error message for email containing HTML scripts', async ({ page }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login("<script>alert('test')</script>", 'validpassword');
        
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });

//     test('Verify error message for invalid password', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToLoginPage();
//         const invalidPasswordUser = new User('cijnuj@ramcloud.us', 'invalidpassword');
//         await loginPage.login(invalidPasswordUser.email, invalidPasswordUser.password);
        
//         const errorMessage = await loginPage.getLoginErrorMessage();
//         expect(errorMessage).toBe('Invalid email or password.');
//     });

//     test('Verify error message for password containing HTML scripts', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToLoginPage();
//         const htmlScriptPasswordUser = new User('cijnuj@ramcloud.us', "<script>alert('test')</script>");
//         await loginPage.login(htmlScriptPasswordUser.email, htmlScriptPasswordUser.password);
        
//         const errorMessage = await loginPage.getLoginErrorMessage();
//         expect(errorMessage).toBe('Invalid password format.');
//     });

//     test('Verify error message for password containing SQL query', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToLoginPage();
//         const sqlQueryPasswordUser = new User('cijnuj@ramcloud.us', "SELECT * FROM users;");
//         await loginPage.login(sqlQueryPasswordUser.email, sqlQueryPasswordUser.password);
        
//         const errorMessage = await loginPage.getLoginErrorMessage();
//         expect(errorMessage).toBe('Invalid password format.');
//     });

//     test('Verify account locked after five incorrect login attempts', async ({ page }) => {
//         await homePage.open();
//         await homePage.goToLoginPage();
//         const invalidPasswordUser = new User('cijnuj@ramcloud.us', 'invalidpassword');

//         // Thử đăng nhập sai 5 lần
//         for (let i = 0; i < 5; i++) {
//             await loginPage.login(invalidPasswordUser.email, invalidPasswordUser.password);
//             const errorMessage = await loginPage.getLoginErrorMessage();
//             expect(errorMessage).toBe('Invalid email or password.');
//             // Có thể cần reload page hoặc clear form giữa các lần thử
//             await loginPage.clearForm();
//         }

//         // Lần thứ 6 - account bị lock
//         await loginPage.login(invalidPasswordUser.email, invalidPasswordUser.password);
//         const errorMessage = await loginPage.getLoginErrorMessage();
//         expect(errorMessage).toBe('Your account has been locked due to multiple failed login attempts. Please contact support.');
//     });
});