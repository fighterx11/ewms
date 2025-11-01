# EasyPay Wallet (EWMS)

This is a prototype of EasyPay, a simple e-wallet application built to simulate the core flow of a modern digital wallet, from user authentication to making various types of payments.

## Core Features

### Authentication
A complete auth flow using a mobile number, a (simulated) OTP, and a 4-digit user PIN.

### Wallet Actions
- **Add Money:** Top up your wallet balance (uses a dummy card or a dev button)
- **Send Money:** Transfer funds to other users on the app using their mobile number
- **Pay Merchants:** Simulate a merchant payment by entering a merchant ID
- **Bill Payments:** A section to pay for mobile recharges, electricity, and water bills for dummy providers
- **Kolkata Metro Booking:** A special feature to book "Aamar Kolkata Metro" tickets, complete with line/station selection, fare calculation (with a 10% discount), and a QR code ticket generator

### Transaction History
A searchable and filterable list of all your past transactions.

### Security
Transactions like sending money or paying bills require PIN verification.

## Tech Stack

- **Frontend:** ReactJS (with Vite)
- **Backend:** Supabase (for database and user management)
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Icons:** Lucide React

## Prototype Showcase

### 1. Login & Dashboard
![Welcome](./screenshots/welcome-page.jpg)
![Login Screen](./screenshots/login.jpg)
![Verify OTP](./screenshots/verify-otp.jpg)
![Enter Pin](./screenshots/enter-pin.jpg)
![Dashboard](./screenshots/dashboard.jpg)

### 2. Core Flow: Sending Money
![Add Money](./screenshots/add-money.jpg)
![Send Money](./screenshots/send-money.jpg)
![Merchant Pay](./screenshots/merchant-pay.jpg)
![Bill Payments & Recharges](./screenshots/bill-payment-recharges.jpg)
![Transaction History](./screenshots/transaction-history.jpg)

### 3. Feature: Metro Booking
![Metro Selection](./screenshots/metro-selection.jpg)
![Metro Booking](./screenshots/metro-booking.jpg)
![Pin Verification](./screenshots/pin-verify.jpg)
![Metro Ticket](./screenshots/metro-ticket.jpg)

## How to Use This Prototype

This is a demo, so many features are simplified for testing.

### Login Credentials
- **Login:** You can use any 10-digit mobile number to sign up or log in
- **OTP:** Always `123456`
- **PIN:** Always `1234` (for setting, logging in, and authorizing transactions)
- **KYC:** You can skip the KYC step after signing up, or just enter a name
- **Starting Balance:** New users are given a starting balance of ₹1000.00

### Add Money
- Use the "Add ₹500 for Development Mode" button for a quick top-up
- Or, use the dummy card:
  - **Card:** `1234 1234 1234 1234`
  - **CVV:** `123`

### Send Money (Test Numbers)
You can pretend to send money to these numbers:
- `+919876543210`
- `+919876543211`
- `+919876543212`

### Pay Merchant (Test IDs)
- `MERCH123` (Cafe Coffee Day)
- `MERCH456` (Big Bazaar)
- `MERCH789` (Pizza Hut)