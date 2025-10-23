# Multi-Stock SEC Filings Watcher

A robust, automated monitoring service that tracks SEC filings for multiple companies via the NASDAQ API and sends email notifications when new filings are published. Monitor PCSA, AAPL, TSLA, and any other publicly traded companies simultaneously!

## ✨ Features

- 📊 **Multi-Stock Tracking** - Monitor unlimited companies simultaneously (PCSA, AAPL, TSLA, etc.)
- 🔍 **Automatic Monitoring** - Periodically checks NASDAQ API for new SEC filings
- 📧 **Smart Email Notifications** - Beautiful HTML emails grouped by symbol via Resend
- 💾 **Per-Symbol State Management** - Tracks filings separately for each company
- ⚙️ **Highly Configurable** - Customizable check intervals, symbols, and email settings
- 🎯 **Production Ready** - Error handling, logging, and graceful shutdown support
- 📱 **Mobile-Responsive Emails** - Professional emails that look great on all devices
- 🧪 **Test Mode** - Verify email configuration with test emails

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A [Resend](https://resend.com) account and API key
- Verified sender domain in Resend

### Installation

1. **Clone or download the project**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your settings:

   ```env
   RESEND_API_KEY=re_your_actual_api_key
   EMAIL_FROM=SEC Filings <[email protected]>
   EMAIL_TO=[email protected]
   SYMBOLS=PCSA,AAPL,TSLA
   ```

5. **Test your email configuration** (optional but recommended)

   ```bash
   SEND_TEST_EMAIL=true npm run dev
   ```

6. **Run the watcher**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Or build and run production
   npm run build
   npm start
   ```

## 📖 Configuration

### Environment Variables

| Variable                 | Required | Default            | Description                                     |
| ------------------------ | -------- | ------------------ | ----------------------------------------------- |
| `RESEND_API_KEY`         | ✅ Yes   | -                  | Your Resend API key                             |
| `EMAIL_FROM`             | ✅ Yes   | -                  | Verified sender email address                   |
| `EMAIL_TO`               | ✅ Yes   | -                  | Recipient email(s), comma-separated             |
| `SYMBOLS`                | ✅ Yes   | -                  | Stock symbols to monitor (comma-separated)      |
| `EMAIL_SUBJECT`          | ❌ No    | `SEC Filing Alert` | Email subject line (symbol added automatically) |
| `CHECK_INTERVAL_MINUTES` | ❌ No    | `30`               | Minutes between checks (min: 5)                 |
| `FILINGS_LIMIT`          | ❌ No    | `14`               | Number of recent filings to track (per symbol)  |
| `RUN_ONCE`               | ❌ No    | `false`            | Run single check and exit                       |
| `SEND_TEST_EMAIL`        | ❌ No    | `false`            | Send test email and exit                        |

### Example Configurations

**Single stock monitoring:**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=Filings <[email protected]>
EMAIL_TO=[email protected]
SYMBOLS=PCSA
```

**Track multiple tech stocks:**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=SEC Alerts <[email protected]>
EMAIL_TO=[email protected],[email protected]
SYMBOLS=AAPL,MSFT,TSLA,NVDA,META
CHECK_INTERVAL_MINUTES=15
```

**Monitor biotech and pharma companies:**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=Biotech Tracker <[email protected]>
EMAIL_TO=[email protected]
SYMBOLS=PCSA,MRNA,BNTX,PFE,JNJ
FILINGS_LIMIT=20
```

**One-time check (useful for cron jobs):**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=Filings <[email protected]>
EMAIL_TO=[email protected]
SYMBOLS=PCSA,AAPL
RUN_ONCE=true
```

## 🔧 Usage

### Continuous Monitoring

Run the watcher continuously with periodic checks:

```bash
npm run dev
```

The watcher will:

1. Perform an initial check immediately
2. Schedule periodic checks based on `CHECK_INTERVAL_MINUTES`
3. Send email notifications when new filings are detected
4. Continue running until stopped (Ctrl+C)

### One-Time Check

Perform a single check and exit:

```bash
RUN_ONCE=true npm run dev
```

This is useful for:

- Testing the setup
- Running via external schedulers (cron, Task Scheduler, etc.)
- Integration with CI/CD pipelines

### Test Email

Verify your email configuration works:

```bash
SEND_TEST_EMAIL=true npm run dev
```

You should receive a test email at your configured recipient address.

## 📊 How It Works

1. **API Polling**: Fetches recent SEC filings from NASDAQ API
2. **State Tracking**: Compares with previously seen filings stored in `watcher-state.json`
3. **Detection**: Identifies new filings by comparing filing IDs (date + type)
4. **Notification**: Sends formatted email with filing details via Resend
5. **State Update**: Updates the state file with latest filings

### State File

The watcher maintains a `watcher-state.json` file to track:

- Last check timestamp
- Previously seen filing IDs

This prevents duplicate notifications when the service restarts.

## 📧 Email Notifications

Emails include:

- Number of new filings
- Filing type (e.g., 8-K, 10-Q, 10-K)
- Filing date
- Period covered
- Description
- Direct link to view the filing

### Sample Email

```
🔔 New SEC Filing Alert
PCSA - New Filings Detected

1 new SEC filing has been published:

8-K
Filed: 2025-10-22
Period: N/A
Description: Current Report
[View Filing →]
```

## 🚀 Production Deployment

### Running as a Service (Linux)

Create a systemd service file `/etc/systemd/system/pcsa-watcher.service`:

```ini
[Unit]
Description=PCSA SEC Filings Watcher
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/PCSA
ExecStart=/usr/bin/node /path/to/PCSA/dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable pcsa-watcher
sudo systemctl start pcsa-watcher
sudo systemctl status pcsa-watcher
```

### Running on Windows

Use Task Scheduler or run as a Windows Service using tools like [node-windows](https://www.npmjs.com/package/node-windows).

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

CMD ["node", "dist/index.js"]
```

Run:

```bash
docker build -t pcsa-watcher .
docker run -d --env-file .env --name pcsa-watcher pcsa-watcher
```

### Cloud Deployment Options

- **AWS Lambda** + EventBridge (scheduled runs)
- **Google Cloud Functions** + Cloud Scheduler
- **Azure Functions** + Timer Trigger
- **Heroku** with Heroku Scheduler add-on
- **Railway**, **Render**, or **Fly.io** for always-on instances

## 🛠️ Development

### Scripts

```bash
npm run dev      # Run with ts-node (development)
npm run watch    # Run with auto-reload on file changes
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled JavaScript
```

### Project Structure

```
PCSA/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── api-client.ts      # NASDAQ API client
│   ├── state-manager.ts   # State persistence
│   ├── email-service.ts   # Resend email integration
│   ├── watcher.ts         # Main watcher logic
│   └── index.ts           # Entry point
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔍 Monitoring & Logs

The watcher outputs detailed logs:

```
🚀 Starting SEC Filings Watcher...
   Symbols: PCSA, AAPL, TSLA
   Check Interval: Every 30 minute(s)
   Filings to track: 14 per symbol

🔍 Checking for new SEC filings...
Timestamp: 10/22/2025, 2:30:00 PM
Symbols: PCSA, AAPL, TSLA
────────────────────────────────────────────────────────────

[PCSA] Fetching filings...
Fetching SEC filings from: https://api.nasdaq.com/api/company/PCSA/sec-filings...
Successfully fetched 14 filings
[PCSA] Found 2 new filing(s)
[PCSA] 📋 2 new filing(s):
  1. 8-K - Filed: 10/22/2025
  2. 4 - Filed: 10/21/2025 (NEAL JAMES R)

[AAPL] Fetching filings...
Successfully fetched 14 filings
[AAPL] No new filings detected

[TSLA] Fetching filings...
Successfully fetched 14 filings
[TSLA] Found 1 new filing(s)
[TSLA] 📋 1 new filing(s):
  1. 10-Q - Filed: 10/20/2025

📧 Sending email for 3 total new filing(s)...
✅ Email notification sent successfully!
State saved: 3 symbol(s), 42 filings tracked
────────────────────────────────────────────────────────────
✅ Check completed successfully
```

## ❓ Troubleshooting

### Email not sending

1. Verify your Resend API key is correct
2. Ensure your sender domain is verified in Resend
3. Check the `EMAIL_FROM` format: `Name <[email protected]>`
4. Run test email: `SEND_TEST_EMAIL=true npm run dev`

### No new filings detected

1. Check if filings actually exist: visit the API URL directly
2. Delete `watcher-state.json` to reset state
3. Verify the API is accessible from your network

### Rate limiting

- Don't set `CHECK_INTERVAL_MINUTES` below 5 minutes
- The NASDAQ API may have rate limits

### State file issues

If the state file becomes corrupted:

```bash
rm watcher-state.json
```

The watcher will create a new one on next run.

## 🔐 Security

- **Never commit `.env`** - It contains sensitive API keys
- **Use environment variables** for all secrets
- **Restrict file permissions** on `.env` and `watcher-state.json`
- **Rotate API keys** periodically
- **Use verified domains** in Resend to prevent spoofing

## 📝 License

ISC

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📚 API Reference

### NASDAQ SEC Filings API

**Endpoint:**

```
GET https://api.nasdaq.com/api/company/{SYMBOL}/sec-filings
```

**Parameters:**

- `limit`: Number of filings to return
- `sortColumn`: Column to sort by (e.g., "filed")
- `sortOrder`: Sort direction ("asc" or "desc")
- `IsQuoteMedia`: Boolean flag

**Example Response:**

```json
{
  "data": {
    "rows": [
      {
        "filed": "10/22/2025",
        "type": "8-K",
        "description": "Current Report",
        "url": "https://...",
        "period": "N/A"
      }
    ]
  }
}
```

## 🎯 Roadmap

- [x] Add support for multiple stock symbols ✅
- [x] Mobile-responsive email templates ✅
- [ ] Webhook notifications (Slack, Discord, etc.)
- [ ] Web dashboard for monitoring status
- [ ] SMS notifications via Twilio
- [ ] Database storage for filing history
- [ ] Filtering by filing type (8-K, 10-Q, etc.)
- [ ] Real-time notifications via WebSocket
- [ ] Custom filing alerts (e.g., only 8-K forms)

---

**Monitor any publicly traded company's SEC filings** 📈 | Built with ❤️ for investors and traders

#   s t o c k - s e c 
 
 #   s t o c k - s e c 
 
 
