import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";
import { RegisterForm } from "../models/register-form.model";
import { Ticket } from "../models/ticket.model";
import { Station } from "../types/station.type";
import { SeatType } from "../types/seat-type.type";

test.describe('My Ticket Tests', () => {
    const user = new User("test148@gmail.com", "123456789");
    const user1 = new User("tun1@gmail.com", "trinhtrinh");
    const registerForm = new RegisterForm("trinhnet123@gmail.com", "123456789", "123456789", "123456789");
    const registerForm1 = new RegisterForm("trinhnet126@gmail.com", "123456789", "123456789", "123456789");

    test('Book ticket, go to My Ticket page and delete ticket', async ({ 
        homePage, 
        loginPage, 
        bookTicketPage,
        myTicketPage,
        page 
    }) => {
        // Step 1: Login to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);

        // Step 2: Go to My Ticket page
        await homePage.goToMyTicketPage();
        await page.waitForLoadState('networkidle');

        // Step 3: Verify ticket expired is displayed
        const isTicketExpiredDisplayed = await myTicketPage.isTicketExpiredDisplayed();
        expect(isTicketExpiredDisplayed).toBeTruthy();

        // Step 4: Delete ticket expired
        await myTicketPage.deleteTicketExpired();
        await page.waitForLoadState('networkidle');

        // Step 5: Verify ticket expired is deleted
        const isDisplayed = await myTicketPage.isTicketExpiredDisplayed();
        expect(isDisplayed).toBeFalsy();

        // Step 6: Verify filter function is not displayed when ticket count < 6 rows
        await page.waitForLoadState('networkidle');
        const ticketRowsCount = await myTicketPage.getTicketRowsCount();
        expect(ticketRowsCount).toBeLessThan(6);
        
        const isFilterVisible = await myTicketPage.isFilterFunctionDisplayed();
        expect(isFilterVisible).toBeFalsy();
    });

    test('Cancel a booked ticket', async ({ 
        homePage, 
        registerPage,
        bookTicketPage,
        myTicketPage,
        page 
    }) => {
        // step 0: Register a new account
        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(registerForm.email, registerForm.password, registerForm.confirmPassword, registerForm.pid);
        await registerPage.getRegisterSuccessMessage();
        await homePage.shouldWelcomeMsgVisible(registerForm.email);

        // Step 2: Check if user has reached ticket limit (10 tickets) and cancel one if needed
        await homePage.goToMyTicketPage();
        await page.waitForLoadState('networkidle');
        const currentTicketCount = await myTicketPage.getTicketRowsCount();
        
        // Step 3: Book a ticket
        const departDate = new Date();
        departDate.setDate(departDate.getDate() + 5);
        const ticket = new Ticket(
            departDate,
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT,
            1
        );

        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        await bookTicketPage.bookTicket(ticket);
        await page.waitForLoadState('networkidle');

        // Verify ticket booked successfully
        const headerText = await bookTicketPage.getHeaderText();
        expect(headerText).toBe("Ticket Booked Successfully!");

        // Get ticket ID from URL
        const ticketId = bookTicketPage.getTicketID();

        // Step 4: Go to the My Ticket tab
        await homePage.goToMyTicketPage();
        await page.waitForLoadState('networkidle');

        // Step 5: Select a booked ticket eligible for cancellation and click Cancel
        const isCancelButtonVisible = await myTicketPage.isCancelButtonDisplayed(ticketId);
        expect(isCancelButtonVisible).toBeTruthy();

        // Click Cancel button
        await myTicketPage.cancelTicketByID(ticketId);
        await page.waitForLoadState('networkidle');

        // Verify ticket is cancelled (not displayed anymore)
        const isDisplayed = await myTicketPage.isTicketDisplayed(ticketId);
        expect(isDisplayed).toBeFalsy();

        // Step 6: Verify filter function is not displayed when ticket count < 6 rows
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Give time for page to update after cancel
        const ticketRowsCount = await myTicketPage.getTicketRowsCount();
        expect(ticketRowsCount).toBeLessThan(6);
        
        const isFilterVisible = await myTicketPage.isFilterFunctionDisplayed();
        expect(isFilterVisible).toBeFalsy();
    });

    test('Filter function is displayed when the table has 6 bookings', async ({ 
        homePage, 
        registerPage, 
        loginPage, 
        bookTicketPage,
        myTicketPage,
        page 
    }) => {
        // Step 1: Register a new account

        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(registerForm1.email, registerForm1.password, registerForm1.confirmPassword, registerForm1.pid);
        await registerPage.getRegisterSuccessMessage();
        // Step 2: Login to Railway
        await homePage.goToLoginPage();
        await loginPage.login(registerForm1.email, registerForm1.password);
        await homePage.shouldWelcomeMsgVisible(registerForm1.email);
        // Step 3: Go to Book Ticket page
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
    


        // Step 4: Book 6 tickets separately (each booking creates 1 row in the table)
        // Filter function only appears when there are 6 separate bookings (rows), not 1 booking with amount = 6
        const departDate = new Date();
        departDate.setDate(departDate.getDate() + 5);
        
        // Book ticket 1
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        const ticket1 = new Ticket(departDate, Station.SAI_GON, Station.NHA_TRANG, SeatType.SOFT_SEAT, 1);
        await bookTicketPage.bookTicket(ticket1);
        await page.waitForLoadState('networkidle');
        expect(await bookTicketPage.getHeaderText()).toBe("Ticket Booked Successfully!");
        
        // Book ticket 2
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        const ticket2 = new Ticket(departDate, Station.SAI_GON, Station.NHA_TRANG, SeatType.SOFT_SEAT, 1);
        await bookTicketPage.bookTicket(ticket2);
        await page.waitForLoadState('networkidle');
        expect(await bookTicketPage.getHeaderText()).toBe("Ticket Booked Successfully!");
        
        // Book ticket 3
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        const ticket3 = new Ticket(departDate, Station.SAI_GON, Station.NHA_TRANG, SeatType.SOFT_SEAT, 1);
        await bookTicketPage.bookTicket(ticket3);
        await page.waitForLoadState('networkidle');
        expect(await bookTicketPage.getHeaderText()).toBe("Ticket Booked Successfully!");
        
        // Book ticket 4
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        const ticket4 = new Ticket(departDate, Station.SAI_GON, Station.NHA_TRANG, SeatType.SOFT_SEAT, 1);
        await bookTicketPage.bookTicket(ticket4);
        await page.waitForLoadState('networkidle');
        expect(await bookTicketPage.getHeaderText()).toBe("Ticket Booked Successfully!");
        
        // Book ticket 5
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        const ticket5 = new Ticket(departDate, Station.SAI_GON, Station.NHA_TRANG, SeatType.SOFT_SEAT, 1);
        await bookTicketPage.bookTicket(ticket5);
        await page.waitForLoadState('networkidle');
        expect(await bookTicketPage.getHeaderText()).toBe("Ticket Booked Successfully!");
        
        // Book ticket 6
        await homePage.goToBookTicketPage();
        await page.waitForLoadState('networkidle');
        const ticket6 = new Ticket(departDate, Station.SAI_GON, Station.NHA_TRANG, SeatType.SOFT_SEAT, 1);
        await bookTicketPage.bookTicket(ticket6);
        await page.waitForLoadState('networkidle');
        expect(await bookTicketPage.getHeaderText()).toBe("Ticket Booked Successfully!");
        
        // Step 5: Go to the My Ticket page
        await homePage.goToMyTicketPage();
        await page.waitForLoadState('networkidle');

        // Step 6: Verify that the ticket table displays 6 rows
        await page.waitForTimeout(1000); // Give time for page to update
        const ticketRowsCount = await myTicketPage.getTicketRowsCount();
        expect(ticketRowsCount).toBeGreaterThanOrEqual(6);

        // Step 7: Observe whether the Filter function is visible
        await page.waitForTimeout(1000); // Give time for filter to appear
        const isFilterVisible = await myTicketPage.isFilterFunctionDisplayed();
        expect(isFilterVisible).toBeTruthy();
    });
});


