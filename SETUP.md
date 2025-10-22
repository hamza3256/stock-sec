# Quick Setup Guide

Follow these steps to get the PCSA SEC Filings Watcher up and running:

## Step 1: Install Dependencies

```bash
npm install
```

This will install:

- `resend` - Email service
- `node-cron` - Job scheduler
- `dotenv` - Environment configuration
- TypeScript and type definitions

## Step 2: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Add and verify your domain (or use their test domain for development)
3. Generate an API key from the [API Keys page](https://resend.com/api-keys)
4. Copy the API key (starts with `re_`)

## Step 3: Configure Environment

1. Copy the example environment file:

   ```bash
   cp env.example .env
   ```

   _(On Windows, use: `copy env.example .env`)_

2. Edit `.env` and add your settings:

   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   EMAIL_FROM=SEC Alerts <[email protected]>
   EMAIL_TO=[email protected]
   ```

   **Important Notes:**

   - The `EMAIL_FROM` domain must be verified in Resend
   - For testing, you can use Resend's test domain: `[email protected]`
   - You can add multiple recipients: `[email protected],[email protected]`

## Step 4: Test Email Configuration

Before running the full watcher, test that emails work:

```bash
SEND_TEST_EMAIL=true npm run dev
```

You should receive a test email at your configured address.

## Step 5: Run the Watcher

### Development Mode (with live reload)

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Step 6: Verify It's Working

You should see output like:

```
🚀 Starting SEC Filings Watcher...
   Symbol: PCSA
   Check Interval: Every 30 minute(s)
   Filings to track: 14

🔍 Checking for new SEC filings...
Fetching SEC filings from: https://api.nasdaq.com/api/company/PCSA/sec-filings...
Successfully fetched 14 filings
...
```

The watcher will:

1. Check immediately on startup
2. Continue checking every 30 minutes (or your configured interval)
3. Send email notifications when new filings are detected

## Stopping the Watcher

Press `Ctrl+C` to stop the watcher gracefully.

## Next Steps

- Adjust `CHECK_INTERVAL_MINUTES` in `.env` to your preferred frequency
- Set up as a system service for production (see README.md)
- Monitor the `watcher-state.json` file to see tracked filings
- Check logs for any errors or issues

## Troubleshooting

### "Missing required environment variables"

- Make sure you created the `.env` file (not `env.example`)
- Verify all required variables are set: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`

### "Failed to send email"

- Check your Resend API key is correct
- Verify your domain is verified in Resend
- Try using the test domain: `[email protected]`

### "Cannot find module"

- Run `npm install` to install dependencies
- Delete `node_modules` and run `npm install` again

### No new filings detected

- This is normal if there are no new filings since last check
- Delete `watcher-state.json` to reset and treat all filings as new
- Verify the API is accessible: visit the URL in your browser

## Advanced Configuration

Edit `.env` for more options:

```env
# Monitor a different stock symbol
SYMBOL=AAPL

# Check more frequently (minimum 5 minutes recommended)
CHECK_INTERVAL_MINUTES=10

# Track more filings
FILINGS_LIMIT=30

# Run once and exit (useful for cron jobs)
RUN_ONCE=true
```

## Support

For more details, see the main [README.md](README.md) file.

