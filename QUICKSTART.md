# 🚀 Quick Start - 5 Minutes to Running

## Prerequisites

- Node.js 18+ installed
- A Resend account ([sign up free](https://resend.com))

## 1️⃣ Install & Configure (2 minutes)

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env
# On Windows: copy env.example .env
```

## 2️⃣ Get Resend API Key (1 minute)

1. Visit [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Copy the key (starts with `re_`)

## 3️⃣ Edit .env File (1 minute)

Open `.env` and update these 3 required values:

```env
RESEND_API_KEY=re_paste_your_key_here
EMAIL_FROM=Alerts <[email protected]>
EMAIL_TO=[email protected]
```

> 💡 For testing, you can use `[email protected]` as your FROM address

## 4️⃣ Test Email (30 seconds)

```bash
SEND_TEST_EMAIL=true npm run dev
```

Check your inbox! You should receive a test email.

## 5️⃣ Start Watching (30 seconds)

```bash
npm run dev
```

That's it! 🎉 You're now monitoring PCSA SEC filings.

---

## What Happens Now?

✅ The watcher checks for new SEC filings every 30 minutes  
✅ When a new filing is published, you get an email  
✅ The service runs continuously until you stop it (Ctrl+C)

## Sample Email You'll Receive

```
🔔 New SEC Filing Alert
PCSA - New Filings Detected

1 new SEC filing has been published:

┌─────────────────────────────────┐
│ 8-K                            │
│ Filed: 10/22/2025              │
│ Period: N/A                    │
│ Description: Current Report    │
│ [View Filing →]                │
└─────────────────────────────────┘
```

## Console Output Example

```
🚀 Starting SEC Filings Watcher...
   Symbol: PCSA
   Check Interval: Every 30 minute(s)

🔍 Checking for new SEC filings...
Successfully fetched 14 filings
Found 2 new filing(s)

📋 New Filings Detected:
  1. 8-K - Filed: 10/22/2025
  2. 10-Q - Filed: 10/20/2025

✅ Email notification sent successfully!
⏰ Next check in 30 minutes...
```

## Common Customizations

### Check More Frequently

Edit `.env`:

```env
CHECK_INTERVAL_MINUTES=10
```

### Monitor Multiple Email Addresses

Edit `.env`:

```env
EMAIL_TO=[email protected],[email protected]
```

### Monitor Different Stock

Edit `.env`:

```env
SYMBOL=AAPL
```

### Run Once (No Continuous Monitoring)

```bash
RUN_ONCE=true npm run dev
```

## Stopping the Watcher

Just press `Ctrl+C` in the terminal.

## Need Help?

- **Full documentation**: See [README.md](README.md)
- **Detailed setup**: See [SETUP.md](SETUP.md)
- **Email not working?** Check your Resend API key and verify the sender domain
- **No filings detected?** That's normal - means no new filings since last check

---

**You're all set!** The watcher will keep you informed of all new PCSA SEC filings. 📊

