import { expect, Locator, Page } from "@playwright/test";
import { RAILWAY_URL, PAGES } from "../constants/constants";

export class HomePage {
    private readonly page: Page;
    private readonly navBarLogin: Locator;
    private readonly navBarRegister: Locator;
    private readonly navBarBookTicket: Locator;
    private readonly navBarMyTicket: Locator;
    private readonly navBarTimetable: Locator;
    private readonly greetingLabel: Locator;
    private readonly header: Locator;
    private readonly ticketPriceLink: Locator;
    private readonly faqTab: Locator;
    private readonly contactLink: Locator;
    private readonly changePasswordLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.navBarLogin = this.page.locator("//a[span[text()='Login']]").or(
            this.page.getByRole("link", { name: 'Login' })
        );
        this.navBarRegister = this.page.locator("//a[span[text()='Register']]").or(
            this.page.getByRole("link", { name: 'Register' })
        );
        this.navBarBookTicket = this.page.locator("//a[span[text()='Book ticket']]");
        this.navBarMyTicket = this.page.locator("//a[span[text()='My ticket']]");
        this.navBarTimetable = this.page.locator("//a[span[text()='Timetable']]").or(
            this.page.getByRole("link", { name: 'Timetable' })
        );
        this.greetingLabel = this.page.locator("div.account strong");
        this.header = this.page.locator("h1");
        this.ticketPriceLink = this.page.getByRole("link", { name: "Ticket Price" });
        this.faqTab = this.page.getByRole("link", { name: "FAQ" });
        this.contactLink = this.page.getByRole("link", { name: "Contact" });
        this.changePasswordLink = this.page.getByRole("link", { name: /change password/i }).or(
            this.page.locator("//a[span[text()='Change password']]").or(
                this.page.locator("//a[contains(text(), 'Change password')]")
            )
        );
    }

    async open(): Promise<void> {
        await this.page.goto(RAILWAY_URL);
    }

    async goToLoginPage(): Promise<void> {
        await this.navBarLogin.click();
    }

    async goToRegisterPage(): Promise<void> {
        await this.navBarRegister.click();
    }

    async goToBookTicketPage(): Promise<void> {
        await this.navBarBookTicket.click();
    }

    async goToMyTicketPage(): Promise<void> {
        await this.navBarMyTicket.click();
    }

    async goToTimetablePage(): Promise<void> {
        await this.navBarTimetable.click();
    }

    async goToTicketPricePage(): Promise<void> {
        await this.page.goto(`${RAILWAY_URL}${PAGES.TICKET_PRICE}`);
    }

    async goToFAQPage(): Promise<void> {
        await this.faqTab.click();
    }

    async goToContactPage(): Promise<void> {
        await this.contactLink.click();
    }

    async goToChangePasswordPage(): Promise<void> {
        // Navigate directly to Change Password page (no need to click link if already on the page)
        await this.page.goto(`${RAILWAY_URL}${PAGES.CHANGE_PASSWORD}`);
        await this.page.waitForLoadState('networkidle');
    }

    async goToLogout(): Promise<void> {
        const logoutLink = this.page.getByRole("link", { name: /log out/i }).or(
            this.page.locator("//a[span[text()='Log out']]").or(
                this.page.locator("//a[contains(text(), 'Log out')]")
            )
        );
        await logoutLink.waitFor({ state: 'visible', timeout: 10000 });
        await logoutLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async shouldWelcomeMsgVisible(email: string): Promise<void> {
        const welcomeMsg = this.page.getByText(`Welcome ${email}`);
        await expect(welcomeMsg).toBeVisible();
    }

    async getGreetingText(): Promise<string> {
        await this.greetingLabel.waitFor({ state: 'visible', timeout: 5000 });
        const text = await this.greetingLabel.textContent();
        return (text || '').trim();
    }

    async getHeaderText(): Promise<string> {
        return (await this.header.textContent()) || '';
    }
}

export default HomePage;