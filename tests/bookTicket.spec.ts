import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";
import { Ticket } from "../models/ticket.model";
import { Station } from "../types/station.type";
import { SeatType } from "../types/seat-type.type";
import { RegisterForm } from "../models/register-form.model";

test.describe('Book Ticket Tests', () => {
    const user = new User("test147@gmail.com", "123456789");
    const user1 = new User("test148@gmail.com", "123456789");
    const registerForm1 = new RegisterForm("test158@gmail.com", "123456789", "123456789", "123456789");
    const registerForm2 = new RegisterForm("test159@gmail.com", "123456789", "123456789", "123456789");

    test('Book ticket successfully and verify ticket information', async ({ 
        homePage, 
        loginPage, 
        bookTicketPage,
        page 
    }) => {
        const departDate = new Date();
        departDate.setDate(departDate.getDate() + 3); // 3 ngày từ hôm nay
        const ticket = new Ticket(
            departDate,
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT,
            1
        );

        // Step 1: Open homepage
        await homePage.open();
        await homePage.goToLoginPage();

        // Step 2: Login
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);

        // Step 3: Go to Book Ticket page
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');

        // Step 4: Book ticket
        await bookTicketPage.bookTicket(ticket);
        await page.waitForLoadState('networkidle');

        // Step 5: Verify header text
        const headerText = await bookTicketPage.getHeaderText();
        expect(headerText).toBe("Ticket Booked Successfully!");

        // Step 6: Verify booked ticket information
        const bookedTicket = await bookTicketPage.getBookedTicket();
        expect(ticket.equals(bookedTicket)).toBeTruthy();
    });
    test('Verify user can book max is 10 tickets', async ({ 
        homePage,
        registerPage,
        loginPage,
        bookTicketPage,
        page
    }) => {
        // Step 1: Open homepage and register and login
        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(registerForm2.email, registerForm2.password, registerForm2.confirmPassword, registerForm2.pid);
        await registerPage.getRegisterSuccessMessage();
        await homePage.goToLoginPage();
        await loginPage.login(registerForm2.email, registerForm2.password);
        await homePage.shouldWelcomeMsgVisible(registerForm2.email);

        // Step 2: Go to Book Ticket page
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');

        // Step 3: Book exactly 10 tickets (maximum allowed)
        const departDate = new Date();
        departDate.setDate(departDate.getDate() + 5);
        
        const ticket = new Ticket(
            departDate,
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT,
            10
        );

        await bookTicketPage.bookTicket(ticket);
        await page.waitForLoadState('networkidle');

        // Step 4: Verify booking was successful
        const headerText = await bookTicketPage.getHeaderText();
        expect(headerText).toBe("ticket booked successfully!");

        // Step 5: Verify booked ticket information
        const bookedTicket = await bookTicketPage.getBookedTicket();
        expect(ticket.equals(bookedTicket)).toBeTruthy();
        expect(bookedTicket.amount).toBe(10);
    });

    test('Verify cannot book more than maximum allowed tickets', async ({ 
        homePage,
        loginPage,
        registerPage,
        bookTicketPage,
        page
     }) => {
        // Step 1: Open homepage and register and login
        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(registerForm1.email, registerForm1.password, registerForm1.confirmPassword, registerForm1.pid);
        await registerPage.getRegisterSuccessMessage();
        await homePage.goToLoginPage();
        await loginPage.login(registerForm1.email, registerForm1.password);
        await homePage.shouldWelcomeMsgVisible(registerForm1.email);

        // Step 2: Book the maximum allowed tickets (10 tickets)
        const departDate = new Date();
        departDate.setDate(departDate.getDate() + 5);
        
        const initialTicket = new Ticket(
            departDate,
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT,
            10
        );
        
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        await bookTicketPage.bookTicket(initialTicket);
        await page.waitForLoadState('networkidle');
        //Verify booking was successful
        const headerText = await bookTicketPage.getHeaderText();
        expect(headerText).toBe("ticket booked successfully!");

        // Step 4: Try to book more than the maximum allowed tickets (1 more ticket, total 11 tickets)
        const exceedingTicket = new Ticket(
            departDate,
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT,
            1
        );
        
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        await bookTicketPage.bookTicket(exceedingTicket);
        await page.waitForLoadState('networkidle');

        // Step 5: Verify error message is displayed
        const errorMessage = await bookTicketPage.getErrorMessage();
        expect(errorMessage).toBe("You have reached the maximum number of tickets allowed.");
    });

    test('User is redirected to Login when accessing Book Ticket page without logging in', async ({ 
        homePage, 
        bookTicketPage,
        page 
    }) => {
        // Step 1: Navigate to Railway
        await homePage.open();
        await page.waitForLoadState('networkidle');

        // Step 2: Go to the Book Ticket tab
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');

        // Expected Result: The system redirects to the login page
        const isLoginPage = await bookTicketPage.isRedirectedToLogin();
        expect(isLoginPage).toBeTruthy();
        
        // Verify URL contains Login
        const currentUrl = bookTicketPage.getCurrentUrl();
        expect(currentUrl).toContain('Login');
    });

    test('Depart date allows selecting dates from 3 to 30 days ahead', async ({ 
        homePage, 
        loginPage, 
        bookTicketPage,
        page 
    }) => {
        // Step 1: Login to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);

        // Step 2: Go to the Book Ticket tab
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');

        // Step 3: Open the Depart date picker (wait for select to be visible)
        await page.waitForLoadState('networkidle');

        // Step 4: Test different date scenarios
        const today = new Date();
        
        // Test date < current + 3
        const dateLessThan3Days = new Date(today);
        dateLessThan3Days.setDate(today.getDate() + 2); // 2 days ahead
        const existsLessThan3 = await bookTicketPage.isDateOptionExists(dateLessThan3Days);
        if (existsLessThan3) {
            const isDisabledLessThan3 = await bookTicketPage.isDateOptionDisabled(dateLessThan3Days);
            expect(isDisabledLessThan3).toBeTruthy(); // Should be disabled
        } else {
            expect(existsLessThan3).toBeFalsy();
        }

        // Test date = current + 3 (should be selectable)
        const dateEqual3Days = new Date(today);
        dateEqual3Days.setDate(today.getDate() + 3); // 3 days ahead
        const isDisabledEqual3 = await bookTicketPage.isDateOptionDisabled(dateEqual3Days);
        expect(isDisabledEqual3).toBeFalsy(); // Should be selectable

        // Test date between current+3 and current+30 (should be selectable)
        const dateBetween = new Date(today);
        dateBetween.setDate(today.getDate() + 15); // 15 days ahead
        const isDisabledBetween = await bookTicketPage.isDateOptionDisabled(dateBetween);
        expect(isDisabledBetween).toBeFalsy(); // Should be selectable

        // Test date = current + 30 (should be selectable if it exists in dropdown)
        const dateEqual30Days = new Date(today);
        dateEqual30Days.setDate(today.getDate() + 30); // 30 days ahead
        const existsEqual30 = await bookTicketPage.isDateOptionExists(dateEqual30Days);
        if (existsEqual30) {
            const isDisabledEqual30 = await bookTicketPage.isDateOptionDisabled(dateEqual30Days);
            expect(isDisabledEqual30).toBeFalsy(); // Should be selectable
        } else {
            console.log('Date 30 days ahead is not available in dropdown');
        }

        // Test date > current + 30 (should be disabled or not exist in dropdown)
        const dateGreaterThan30Days = new Date(today);
        dateGreaterThan30Days.setDate(today.getDate() + 31); // 31 days ahead
        const existsGreaterThan30 = await bookTicketPage.isDateOptionExists(dateGreaterThan30Days);
        if (existsGreaterThan30) {
            const isDisabledGreaterThan30 = await bookTicketPage.isDateOptionDisabled(dateGreaterThan30Days);
            expect(isDisabledGreaterThan30).toBeTruthy(); // Should be disabled
        } else {
            // Date doesn't exist in dropdown (not available, which is correct)
            expect(existsGreaterThan30).toBeFalsy();
        }
    });
});