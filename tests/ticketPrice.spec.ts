import { test, expect } from "../fixtures/test";
import { User } from "../models/user.model";
import { Station } from "../types/station.type";
import { SeatType } from "../types/seat-type.type";

test.describe('Ticket Price Tests', () => {
    const user = new User('test147@gmail.com', '123456789');

    test('Verify ticket price page is displayed properly without logging in', async ({ 
        homePage, 
        ticketPricePage,
        page 
    }) => {
        // Step 1: Open homepage
        await homePage.open();
        // Step 2: Go to Ticket Price page
        await homePage.goToTicketPricePage();
        await ticketPricePage.verifyPageLoaded();
    });
    test('Check ticket price for Sài Gòn to Nha Trang route after logging in', async ({ 
        homePage, 
        loginPage, 
        ticketPricePage,
        page 
    }) => {
        // Step 1: Login to Railway
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);

        // Step 2: Go to the Ticket price tab
        await homePage.goToTicketPricePage();
        await ticketPricePage.verifyPageLoaded();

        // Step 3: In the train list, click the "Check Price" button for Sài Gòn to Nha Trang route
        const checkPriceCount = await ticketPricePage.getCheckPriceLinksCount();
        expect(checkPriceCount).toBeGreaterThan(0);
        
        await ticketPricePage.clickCheckPriceLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
        await page.waitForLoadState('networkidle');

        // Expected Results:
        // 1. The system redirects the user to the Price Details page of the selected route
        const currentUrl = ticketPricePage.getCurrentUrl();
        expect(currentUrl).toContain('Price');

        // 2. The page displays correct and complete fare information
        // Verify route information is correct (Sài Gòn to Nha Trang)
        await ticketPricePage.verifyRouteInformation(Station.SAI_GON, Station.NHA_TRANG);

        // Verify page has fare information (seat types and prices)
        const hasFareInfo = await ticketPricePage.verifyFareInformation();
        expect(hasFareInfo).toBeTruthy();

        // Verify page title
        const pageTitle = await page.locator('h1').textContent();
        expect(pageTitle).toBeTruthy();

        // Verify Book ticket button exists
        const bookTicketButton = page.locator("//a[contains(text(), 'Book Ticket')]").or(
            page.locator("//a[contains(text(), 'Book ticket')]").or(
                page.getByRole('link', { name: /book ticket/i })
            )
        );
        const bookTicketCount = await bookTicketButton.count();
        expect(bookTicketCount).toBeGreaterThan(0);

        // Click Book Ticket button for SOFT_SEAT (to ensure correct route)
        // This ensures we click the button for the correct route, not just the first button
        await ticketPricePage.clickBookTicketButtonForSeatType(SeatType.SOFT_SEAT);
        await page.waitForLoadState('networkidle');

        // Verify Book Ticket page displays correct route and seat information
        await ticketPricePage.verifyBookTicketPageRouteAndSeat(
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT
        );

        // Select SOFT_SEAT on Book Ticket page (because default might be Hard seat)
        await ticketPricePage.selectSeatTypeOnBookTicketPage(SeatType.SOFT_SEAT);

        // Click Book Ticket submit button to complete booking
        await ticketPricePage.clickBookTicketSubmitButton();
        await page.waitForLoadState('networkidle');

        // Verify ticket booked successfully page with correct route information
        await ticketPricePage.verifyTicketBookedSuccessfully(
            Station.SAI_GON,
            Station.NHA_TRANG
        );

        // 3. No errors or broken links appear
        const errorMessages = await page.locator('.error, .error-message').count();
        expect(errorMessages).toBe(0);

        // 4. The user can navigate back to the Ticket Price list normally
        await homePage.goToTicketPricePage();
        await ticketPricePage.verifyPageLoaded();
    });

    test('Check ticket price and book ticket without logging in', async ({ 
        homePage, 
        loginPage, 
        ticketPricePage,
        page 
    }) => {
        // Step 1: Đợi trang homepage load
        await homePage.open();
        await page.waitForLoadState('networkidle');

        // Step 2: Vào trang ticketprice (không đăng nhập)
        await homePage.goToTicketPricePage();
        await ticketPricePage.verifyPageLoaded();

        // Step 3: Click on button check price của route sài gòn nha trang
        const checkPriceCount = await ticketPricePage.getCheckPriceLinksCount();
        expect(checkPriceCount).toBeGreaterThan(0);
        
        await ticketPricePage.clickCheckPriceLinkForRoute(Station.SAI_GON, Station.NHA_TRANG);
        await page.waitForLoadState('networkidle');

        // Step 4: Đợi trang checkprice của route đó load
        const currentUrl = ticketPricePage.getCurrentUrl();
        expect(currentUrl).toContain('Price');

        // Step 5: Xác nhận thông tin trên trang khớp với route đã chọn
        await ticketPricePage.verifyRouteInformation(Station.SAI_GON, Station.NHA_TRANG);
        const hasFareInfo = await ticketPricePage.verifyFareInformation();
        expect(hasFareInfo).toBeTruthy();

        // Step 6: Chọn vào SOFT_SEAT và click on button BookTicket
        await ticketPricePage.clickBookTicketButtonForSeatType(SeatType.SOFT_SEAT);
        await page.waitForLoadState('networkidle');

        // Step 7: Đợi trang login hiện ra
        const loginUrl = ticketPricePage.getCurrentUrl();
        expect(loginUrl).toContain('Login');

        // Step 8: Đăng nhập bằng thông tin
        await loginPage.login(user.email, user.password);
        await homePage.shouldWelcomeMsgVisible(user.email);

        // Step 9: Đợi hệ thống hiển thị trang BookTicket (sau login sẽ tự động redirect)
        await page.waitForLoadState('networkidle');
        const bookTicketUrl = ticketPricePage.getCurrentUrl();
        expect(bookTicketUrl.includes('BookTicket') || bookTicketUrl.includes('Book')).toBeTruthy();

        // Step 10: Xác nhận thông tin trong các field của trang BookTicket hoàn toàn khớp với tuyến đã chọn (sài gòn nha trang)
        await ticketPricePage.verifyBookTicketPageRouteAndSeat(
            Station.SAI_GON,
            Station.NHA_TRANG,
            SeatType.SOFT_SEAT
        );

        // Step 11: Click on button BookTicket
        await ticketPricePage.clickBookTicketSubmitButton();
        await page.waitForLoadState('networkidle');

        // Step 12: Đợi trang booked ticket successfully hiện ra
        await ticketPricePage.verifyTicketBookedSuccessfully(
            Station.SAI_GON,
            Station.NHA_TRANG
        );
    });
    
});

