import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";

test.describe('Login Tests', () => {
    const validUser = new User('test147@gmail.com', '123456789');

    test('Verify user can login successfully', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        const headerText = await homePage.getHeaderText();
        expect(headerText).toBeTruthy();
        await homePage.goToLoginPage();
        await loginPage.login(validUser.email, validUser.password);
        await homePage.shouldWelcomeMsgVisible(validUser.email);
        
        const greetingText = await homePage.getGreetingText();
        expect(greetingText).toBe(`Welcome ${validUser.email}`);
    });

    test('Verify error message for non-existing email', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        const headerText = await homePage.getHeaderText();
        expect(headerText).toBeTruthy();
        await homePage.goToLoginPage();
        const nonExistingUser = new User('nonexisting@domain.com', '123456789');
        await loginPage.login(nonExistingUser.email, nonExistingUser.password);
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });
    
    test('Verify error message for email containing HTML scripts', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        const htmlScriptEmailUser = new User("<script>alert('test')</script>", 'validpassword');
        await loginPage.login(htmlScriptEmailUser.email, htmlScriptEmailUser.password);
        
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });

    test('Verify error message for invalid password', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        const invalidPasswordUser = new User('test147@gmail.com', 'invalidpassword');
        await loginPage.login(invalidPasswordUser.email, invalidPasswordUser.password);
        
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });

    test('Verify error message for password containing HTML scripts', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        const htmlScriptPasswordUser = new User('cijnuj@ramcloud.us', "<script>alert('test')</script>");
        await loginPage.login(htmlScriptPasswordUser.email, htmlScriptPasswordUser.password);
        
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });

    test('Verify error message for password containing SQL query', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        const sqlQueryPasswordUser = new User('cijnuj@ramcloud.us', "SELECT * FROM users;");
        await loginPage.login(sqlQueryPasswordUser.email, sqlQueryPasswordUser.password);
        
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Invalid username or password. Please try again.');
    });

    test('Verify account locked after five incorrect login attempts', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        const invalidPasswordUser = new User('cijnuj@ramcloud.us', 'invalidpassword');

        // Thử đăng nhập sai 5 lần
        for (let i = 0; i < 5; i++) {
            await loginPage.login(invalidPasswordUser.email, invalidPasswordUser.password);
            const errorMessage = await loginPage.getLoginErrorMessage();
            expect(errorMessage).toBe('Invalid username or password. Please try again.');
            // Có thể cần reload page hoặc clear form giữa các lần thử
            await loginPage.clearForm();
        }

        // Lần thứ 6 - account bị lock
        await loginPage.login(invalidPasswordUser.email, invalidPasswordUser.password);
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBe('Your account has been locked due to multiple failed login attempts. Please contact support.');
    });

    test('Verify password field has show password icon', async ({ 
        homePage, 
        loginPage,
        page 
    }) => {
        await homePage.open();
        await homePage.goToLoginPage();
        
        // Verify password field has show password icon
        await loginPage.verifyPasswordFieldHasShowPasswordIcon();
    });
});