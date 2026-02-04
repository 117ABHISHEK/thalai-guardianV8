# Email Configuration Guide

ThalAI Guardian uses **Nodemailer** to send email notifications (like appointment confirmations). For security, we recommend using a **Gmail App Password**.

## Prerequisites

- A Gmail account.
- 2-Step Verification enabled on your Google account.

## Step 1: Generate a Google App Password

1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is ON.
3. Search for **"App Passwords"** in the top search bar.
4. Name the app `ThalAI Guardian`.
5. Google will generate a **16-character code**. Copy this code (without spaces).

## Step 2: Configure `.env`

Open `thalai-backend/.env` and update the following variables:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## Step 3: Test

The system will now use these credentials whenever a notification needs to be sent. You can test this by:

- Booking an appointment.
- Accepting a blood request match.

> [!NOTE]
> If you are using a service other than Gmail (like Outlook or SendGrid), update the `EMAIL_SERVICE` accordingly and ensure the SMTP settings are correct in `notificationService.js`.
