# Website enquiry email

The homepage and custom-plan forms POST to `/api/contact`. Messages go only to `hello@ideomint.com`; the visitor is the Reply-To address. Success means the SMTP server accepted the message, not a guarantee of inbox placement. No database is involved. IdeoFest email configuration is unchanged.

Add these server-only settings to `.env.local` (never commit credentials):

```dotenv
CONTACT_SMTP_HOST=your-account-specific-Zoho-SMTP-host
CONTACT_SMTP_PORT=465
CONTACT_SMTP_USER=hello@ideomint.com
CONTACT_SMTP_PASSWORD=your-Zoho-application-password
```

Find the exact outgoing host in the account’s Zoho Mail settings: the hostname depends on data centre and account plan. Port 465 uses implicit TLS; 587 requires STARTTLS. Generate an application-specific password in the account security settings when required. Do not reuse the IdeoFest admin password or paste secrets in chat.

Official instructions: https://www.zoho.com/mail/help/zoho-smtp.html

Restart the local dev server after configuration. Submit one clearly labelled test enquiry; confirm receipt in Zoho, check spam, and verify Reply opens the visitor’s address. Missing/invalid SMTP settings must display an error and retain the entered form data. Test blank/invalid inputs and keyboard submission too. A live mailbox test has not yet been completed.

Existing proxy applies an in-memory global API limiter. This is not a distributed abuse-control guarantee; monitor delivery and add shared rate limiting if traffic requires it.
