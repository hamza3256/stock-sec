# PCSA SEC Filings Watcher

A robust, automated monitoring service that tracks SEC filings for PCSA (Processa Pharmaceuticals) via the NASDAQ API and sends email notifications when new filings are published.

## ✨ Features

- 🔍 **Automatic Monitoring** - Periodically checks NASDAQ API for new SEC filings
- 📧 **Email Notifications** - Beautiful HTML email alerts via Resend when new filings are detected
- 💾 **State Management** - Tracks previously seen filings to avoid duplicate notifications
- ⚙️ **Configurable** - Customizable check intervals, symbols, and email settings
- 🎯 **Production Ready** - Error handling, logging, and graceful shutdown support
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

| Variable                 | Required | Default                 | Description                         |
| ------------------------ | -------- | ----------------------- | ----------------------------------- |
| `RESEND_API_KEY`         | ✅ Yes   | -                       | Your Resend API key                 |
| `EMAIL_FROM`             | ✅ Yes   | -                       | Verified sender email address       |
| `EMAIL_TO`               | ✅ Yes   | -                       | Recipient email(s), comma-separated |
| `EMAIL_SUBJECT`          | ❌ No    | `PCSA SEC Filing Alert` | Email subject line                  |
| `SYMBOL`                 | ❌ No    | `PCSA`                  | Stock symbol to monitor             |
| `CHECK_INTERVAL_MINUTES` | ❌ No    | `30`                    | Minutes between checks (min: 5)     |
| `FILINGS_LIMIT`          | ❌ No    | `14`                    | Number of recent filings to track   |
| `RUN_ONCE`               | ❌ No    | `false`                 | Run single check and exit           |
| `SEND_TEST_EMAIL`        | ❌ No    | `false`                 | Send test email and exit            |

### Example Configurations

**Basic monitoring (check every 30 minutes):**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=Filings <[email protected]>
EMAIL_TO=[email protected]
```

**Frequent monitoring with multiple recipients:**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=SEC Alerts <[email protected]>
EMAIL_TO=[email protected],[email protected]
CHECK_INTERVAL_MINUTES=10
```

**One-time check (useful for cron jobs):**

```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=Filings <[email protected]>
EMAIL_TO=[email protected]
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
   Symbol: PCSA
   Check Interval: Every 30 minute(s)
   Filings to track: 14

🔍 Checking for new SEC filings...
Timestamp: 10/22/2025, 2:30:00 PM
────────────────────────────────────────────────────────────
Fetching SEC filings from: https://api.nasdaq.com/api/company/PCSA/sec-filings...
Successfully fetched 14 filings
Found 1 new filing(s)

📋 New Filings Detected:
  1. 8-K - Filed: 10/22/2025

Sending email notification for 1 filing(s)...
✅ Email notification sent successfully!
State saved: 14 filings tracked
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

- [ ] Add support for multiple stock symbols
- [ ] Webhook notifications (Slack, Discord, etc.)
- [ ] Web dashboard for monitoring status
- [ ] SMS notifications via Twilio
- [ ] Database storage for filing history
- [ ] Filtering by filing type (8-K, 10-Q, etc.)

---

**Made for monitoring PCSA SEC filings** 📈

#   s t o c k - s e c  
 