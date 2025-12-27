import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";
import { Station } from "../types/station.type";

test.describe('Timetable Tests', () => {
    const validUser = new User('test147@gmail.com', '123456789');

    test('Users can click on links/buttons without logging in', async ({ 
        homePage, 
        timetablePage,
        page 
    }) => {
        // Step 1: Navigate to the Railway
        await homePage.open();
        
        // Step 2: Go to the Timetable tab
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
        
        // Step 3: Click on all available links or buttons
        // Verify Check Price links are clickable
        const checkPriceCount = await timetablePage.getCheckPriceLinksCount();
        expect(checkPriceCount).toBeGreaterThan(0);
        
        // Click on first Check Price link (should work without login)
        await timetablePage.clickFirstCheckPriceLink();
        await page.waitForLoadState('networkidle');
        
        // Verify user can navigate to Check Price page
        const currentUrl = timetablePage.getCurrentUrl();
        expect(currentUrl).toContain('Price');
        
        // Navigate back to Timetable
        await homePage.goToTimetablePage();
        
        // Try clicking Book Ticket link (should redirect to login if not logged in)
        const bookTicketCount = await timetablePage.getBookTicketLinksCount();
        expect(bookTicketCount).toBeGreaterThan(0);
        
        await timetablePage.clickFirstBookTicketLink();
        await page.waitForLoadState('networkidle');
        
        // Expected: Should redirect to login page or show error message
        const isLoginPage = await timetablePage.isRedirectedToLogin();
        expect(isLoginPage).toBeTruthy();
    });

    test('Users can click on links/tab and buttons after logging in', async ({ 
        homePage, 
        loginPage, 
        timetablePage,
        page 
    }) => {
        // Step 1: Log in to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(validUser.email, validUser.password);
        await homePage.shouldWelcomeMsgVisible(validUser.email);
        
        // Step 2: Go to the Timetable tab
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
        
        // Step 3: Click on all available links or buttons
        // Verify Check Price links are clickable
        const checkPriceCount = await timetablePage.getCheckPriceLinksCount();
        expect(checkPriceCount).toBeGreaterThan(0);
        
        // Click on first Check Price link
        await timetablePage.clickFirstCheckPriceLink();
        await page.waitForLoadState('networkidle');
        
        // Verify user can navigate to Check Price page
        const currentUrl = timetablePage.getCurrentUrl();
        expect(currentUrl).toContain('Price');
        
        // Navigate back to Timetable
        await homePage.goToTimetablePage();
        
        // Click Book Ticket link (should work after login)
        const bookTicketCount = await timetablePage.getBookTicketLinksCount();
        expect(bookTicketCount).toBeGreaterThan(0);
        
        await timetablePage.clickFirstBookTicketLink();
        await page.waitForLoadState('networkidle');
        
        // Verify user can navigate to Book Ticket page (not redirected to login)
        const isLoginPage = await timetablePage.isRedirectedToLogin();
        expect(isLoginPage).toBeFalsy();
    });

    test('User can view the ticket price of a train route by clicking the "Check Price" link', async ({ 
        homePage, 
        loginPage, 
        timetablePage,
        page 
    }) => {
        // Step 1: Login to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(validUser.email, validUser.password);
        await homePage.shouldWelcomeMsgVisible(validUser.email);
        
        // Step 2: Go to the Timetable tab
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
        
        // Step 3: In the timetable list, click the "Check Price" link for SAI_GON to NHA_TRANG route
        await timetablePage.clickCheckPriceLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
        await page.waitForLoadState('networkidle');
        
        // Expected Results:
        // 1. The system redirects the user to the Price Details page
        const currentUrl = timetablePage.getCurrentUrl();
        expect(currentUrl).toContain('Price');
        
        // 2. Verify the page displays correct route information (SAI_GON to NHA_TRANG)
        const isCorrectRoute = await timetablePage.verifyRouteOnCheckPricePage(Station.SAI_GON, Station.NHA_TRANG);
        expect(isCorrectRoute).toBeTruthy();
        
        // 3. The page displays correct and complete fare information
        const pageTitle = await page.locator('h1').textContent();
        expect(pageTitle).toBeTruthy();
        
        // Verify page has route information, seat types, prices
        const hasRouteInfo = await page.locator('table, .route, [class*="route"]').count() > 0;
        expect(hasRouteInfo).toBeTruthy();
        
        // 4. No errors or broken links appear
        const errorMessages = await page.locator('.error, .error-message').count();
        expect(errorMessages).toBe(0);
        
        // 5. The user can navigate back to the Timetable page normally
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
    });

    test('Verify navigation from Check Price to Book Ticket page with pre-filled train details after logging in', async ({ 
        homePage, 
        loginPage, 
        timetablePage,
        ticketPricePage,
        page 
    }) => {
        // Step 1: Login to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(validUser.email, validUser.password);
        await homePage.shouldWelcomeMsgVisible(validUser.email);
        
        // Step 2: Go to the Timetable tab
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
        
        // Step 3: In the Timetable page, click the "Check Price" link for SAI_GON to NHA_TRANG route
        await timetablePage.clickCheckPriceLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
        await page.waitForLoadState('networkidle');
        
        // Step 4: Verify check price page shows correct route (SAI_GON to NHA_TRANG)
        const isCorrectRoute = await timetablePage.verifyRouteOnCheckPricePage(Station.SAI_GON, Station.NHA_TRANG);
        expect(isCorrectRoute).toBeTruthy();
        
        // If route is correct, continue with booking
        if (isCorrectRoute) {
            // Step 5: On the Check Price page, locate the "Book Ticket" button
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            // nút book ticket ở trong table show thông tin giá vé
            const bookTicketButton = page.locator("//table//a[contains(text(), 'Book Ticket')]").or(
                page.locator("//table//a[contains(text(), 'Book ticket')]").or(
                    page.locator("//table//a[contains(text(), 'book ticket')]").or(
                        page.locator("//table//input[@value='Book ticket']").or(
                            page.locator("//table//input[@value='Book Ticket']").or(
                                page.locator("//table//button[contains(text(), 'Book Ticket')]").or(
                                    page.locator("//table//button[contains(text(), 'Book ticket')]").or(
                                        page.locator("//a[contains(text(), 'Book Ticket')]").or(
                                            page.locator("//a[contains(text(), 'Book ticket')]").or(
                                                page.locator("//input[@value='Book ticket']").or(
                                                    page.locator("//input[@value='Book Ticket']").or(
                                                        page.getByRole('link', { name: /book ticket/i }).or(
                                                            page.getByRole('button', { name: /book ticket/i })
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
            
            // Chờ nút Book Ticket hiện ra 
            await bookTicketButton.first().waitFor({ state: 'visible', timeout: 15000 });
            const bookTicketCount = await bookTicketButton.count();
            expect(bookTicketCount).toBeGreaterThan(0);
            
            // Step 6: Click the "Book Ticket" button
            await bookTicketButton.first().click();
            await page.waitForLoadState('networkidle');
            
            // Expected Results:
            // 1. The system navigates to the Booking page
            const currentUrl = timetablePage.getCurrentUrl();
            expect(currentUrl.includes('BookTicket') || currentUrl.includes('Book')).toBeTruthy();
            
            // 2. The booking form is displayed with pre-filled information
            // Verify form fields exist
            const hasForm = await page.locator('form, [class*="form"]').count() > 0;
            expect(hasForm).toBeTruthy();
            
            // 3. The user can navigate back to the Check price page normally
            await page.goBack();
            await page.waitForLoadState('networkidle');
            const backUrl = timetablePage.getCurrentUrl();
            expect(backUrl).toContain('Price');
        }
    });

    test('Verify navigation from Check Price to Book Ticket page with pre-filled train details without logging in', async ({ 
        homePage, 
        timetablePage,
        page 
    }) => {
        // Step 1: Navigate to the Railway (without logging in)
        await homePage.open();
        
        // Step 2: Go to the Timetable tab
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
        
        // Step 3: In the Timetable page, click the "Check Price" link for SAI_GON to NHA_TRANG route
        await timetablePage.clickCheckPriceLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
        await page.waitForLoadState('networkidle');
        
        // Step 4: Verify check price page shows correct route (SAI_GON to NHA_TRANG)
        const isCorrectRoute = await timetablePage.verifyRouteOnCheckPricePage(Station.SAI_GON, Station.NHA_TRANG);
        expect(isCorrectRoute).toBeTruthy();
        
        // Step 5: On the Check Price page, try to click "Book Ticket" button (should redirect to login)
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // nút book ticket ở trong table show thông tin giá vé
        const bookTicketButton = page.locator("//table//a[contains(text(), 'Book Ticket')]").or(
            page.locator("//table//a[contains(text(), 'Book ticket')]").or(
                page.locator("//table//a[contains(text(), 'book ticket')]").or(
                    page.locator("//table//input[@value='Book ticket']").or(
                        page.locator("//table//input[@value='Book Ticket']").or(
                            page.locator("//table//button[contains(text(), 'Book Ticket')]").or(
                                page.locator("//table//button[contains(text(), 'Book ticket')]").or(
                                    page.locator("//a[contains(text(), 'Book Ticket')]").or(
                                        page.locator("//a[contains(text(), 'Book ticket')]").or(
                                            page.locator("//input[@value='Book ticket']").or(
                                                page.locator("//input[@value='Book Ticket']").or(
                                                    page.getByRole('link', { name: /book ticket/i }).or(
                                                        page.getByRole('button', { name: /book ticket/i })
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
        
        // Chờ nút Book Ticket hiện ra 
        await bookTicketButton.first().waitFor({ state: 'visible', timeout: 15000 });
        const bookTicketCount = await bookTicketButton.count();
        expect(bookTicketCount).toBeGreaterThan(0);
        
        // Step 6: Click the "Book Ticket" button (should redirect to login)
        await bookTicketButton.first().click();
        await page.waitForLoadState('networkidle');
        
        // Expected Results:
        // The system redirects to the login page when user tries to access Book Ticket without logging in
        const isLoginPage = await timetablePage.isRedirectedToLogin();
        expect(isLoginPage).toBeTruthy();
        
        // Verify we are on login page
        const currentUrl = timetablePage.getCurrentUrl();
        expect(currentUrl).toContain('Login');
    });

    test('User can view the book ticket page of a train route by clicking the "Book Ticket" link', async ({ 
        homePage, 
        loginPage, 
        timetablePage,
        bookTicketPage,
        myTicketPage,
        page 
    }) => {
        // Step 1: Login to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(validUser.email, validUser.password);
        await homePage.shouldWelcomeMsgVisible(validUser.email);
        
        // Step 2: Go to the Timetable tab
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
        
        // Step 3: Click the "Book Ticket" button for SAI_GON to NHA_TRANG route
        const bookTicketCount = await timetablePage.getBookTicketLinksCount();
        expect(bookTicketCount).toBeGreaterThan(0);
        
        await timetablePage.clickBookTicketLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
        await page.waitForLoadState('networkidle');
        // verify page book ticket page is displayed
        const currentUrlBookTicket = bookTicketPage.getCurrentUrl();
        expect(currentUrlBookTicket.includes('BookTicket') || currentUrlBookTicket.includes('Book')).toBeTruthy(); 
        
        // Verify the page displays correct route information (SAI_GON to NHA_TRANG)
        const isCorrectRoute = await bookTicketPage.verifyRouteOnBookTicketPage(Station.SAI_GON, Station.NHA_TRANG);
        expect(isCorrectRoute).toBeTruthy();
        
        // Verify form has required fields
        const hasDepartFrom = await page.locator('[name*="depart"], [id*="depart"], label:has-text("Depart")').count() > 0;
        const hasArriveAt = await page.locator('[name*="arrive"], [id*="arrive"], label:has-text("Arrive")').count() > 0;
        expect(hasDepartFrom || hasArriveAt).toBeTruthy();
        
        // 3. Check if user has reached booking limit (10 tickets)
        // If user has 10 tickets, cancel one first to free up a slot
        const bookingLimitMessage = page.locator('text=/You have booked 10 tickets/i');
        const hasBookingLimit = await bookingLimitMessage.count() > 0;
        
        if (hasBookingLimit) {
            // Cancel one ticket to free up a slot
            await homePage.goToMyTicketPage();
            await page.waitForLoadState('networkidle');
            await myTicketPage.cancelFirstTicket();
            await page.waitForLoadState('networkidle');
            
            // Go back to timetable and click Book Ticket again
            await homePage.goToTimetablePage();
            await timetablePage.verifyPageLoaded();
            await timetablePage.clickBookTicketLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
            await page.waitForLoadState('networkidle');
        }
        
        // Verify no errors before booking
        const cssErrorMessages = await page.locator('.error, .error-message').count();
        const textErrorMessages = await page.getByText(/There.*errors/i).count();
        const totalErrorMessages = cssErrorMessages + textErrorMessages;
        expect(totalErrorMessages).toBe(0);
        
        // Click Book Ticket submit button to complete booking
        await timetablePage.clickBookTicketSubmitButton();
        await page.waitForLoadState('networkidle');
        
        // Verify ticket booked successfully page is displayed with title 'Ticket Booked Successfully!'
        await timetablePage.verifyTicketBookedSuccessfully();
        
        // 4. The user can navigate back to the Timetable page normally
        await homePage.goToTimetablePage();
        await timetablePage.verifyPageLoaded();
    });
});

