# run terminal
npm init playwright@latest

# chạy test
npx playwright test
npx playwright show-report

# chạy test riêng từng testcase
- lấy ví dụ từ một testcase trong bookTicket 
npx playwright test bookTicket -g "Depart date allows selecting dates from 3 to 30 days ahead"
npx playwright test bookTicket -grep "Depart date allows selecting dates from 3 to 30 days ahead"

# Running the Example Test in UI Mode
Run tests with UI Mode for watch mode, live step view, time travel debugging and more.

npx playwright test --ui

