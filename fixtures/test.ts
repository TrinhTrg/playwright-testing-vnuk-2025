import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { BookTicketPage } from '../pages/bookTicket.page';
import { RegisterPage } from '../pages/register.page';
import { ContactPage } from '../pages/contact.page';
import { FAQPage } from '../pages/FAQ.page';
import { TimetablePage } from '../pages/timetable.page';
import { TicketPricePage } from '../pages/ticketPrice.page';
import { MyTicketPage } from '../pages/myTicket.page';
import { ChangePasswordPage } from '../pages/changePassword.page';
import { ConfirmAccountPage } from '../pages/confirmAccount.page';

//định nghĩa các fixtures
type MyFixtures = {
    homePage: HomePage;
    loginPage: LoginPage;
    bookTicketPage: BookTicketPage;
    registerPage: RegisterPage;
    contactPage: ContactPage;
    faqPage: FAQPage;
    timetablePage: TimetablePage;
    ticketPricePage: TicketPricePage;
    myTicketPage: MyTicketPage;
    changePasswordPage: ChangePasswordPage;
    confirmAccountPage: ConfirmAccountPage;
};

// kế thừa base test với custom fixtures
export const test = base.extend<MyFixtures>({
    // mỗi fixture là một hàm nhận context của test
    homePage: async ({ page }, use) => {
        // Setup: tạo đối tượng trang
        const homePage = new HomePage(page);
        // sử dụng fixture trong test
        await use(homePage);
        // Teardown
    },

    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    bookTicketPage: async ({ page }, use) => {
        const bookTicketPage = new BookTicketPage(page);
        await use(bookTicketPage);
    },

    registerPage: async ({ page }, use) => {
        const registerPage = new RegisterPage(page);
        await use(registerPage);
    },

    contactPage: async ({ page }, use) => {
        const contactPage = new ContactPage(page);
        await use(contactPage);
    },

    faqPage: async ({ page }, use) => {
        const faqPage = new FAQPage(page);
        await use(faqPage);
    },

    timetablePage: async ({ page }, use) => {
        const timetablePage = new TimetablePage(page);
        await use(timetablePage);
    },

    ticketPricePage: async ({ page }, use) => {
        const ticketPricePage = new TicketPricePage(page);
        await use(ticketPricePage);
    },

    myTicketPage: async ({ page }, use) => {
        const myTicketPage = new MyTicketPage(page);
        await use(myTicketPage);
    },

    changePasswordPage: async ({ page }, use) => {
        const changePasswordPage = new ChangePasswordPage(page);
        await use(changePasswordPage);
    },

    confirmAccountPage: async ({ page }, use) => {
        const confirmAccountPage = new ConfirmAccountPage(page);
        await use(confirmAccountPage);
    },
});

export { expect } from '@playwright/test';

