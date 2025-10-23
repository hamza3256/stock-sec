# Multi-Stock SEC Filings Watcher

Automated monitoring service that tracks SEC filings for multiple companies via NASDAQ API and sends email notifications when new filings are published.

## Features

- 📊 **Multi-Stock Tracking** - Monitor unlimited companies simultaneously
- 🔍 **Automatic Monitoring** - Periodic checks via NASDAQ API
- 📧 **Email Notifications** - Beautiful HTML emails via Resend
- 💾 **State Management** - Tracks filings per company to avoid duplicates
- ⚙️ **Configurable** - Custom intervals, symbols, and email settings

## Quick Start

### Prerequisites

- Node.js 18+
- [Resend](https://resend.com) account and API key
- Verified sender domain in Resend

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**

   ```env
   RESEND_API_KEY=re_your_actual_api_key
   EMAIL_FROM=SEC Filings <[email protected]>
   EMAIL_TO=[email protected]
   SYMBOLS=PCSA,AAPL,TSLA
   ```

4. **Test configuration**

   ```bash
   SEND_TEST_EMAIL=true npm run dev
   ```

5. **Run the watcher**
   ```bash
   npm run dev
   ```

## Configuration

| Variable                 | Required | Default            | Description                                    |
| ------------------------ | -------- | ------------------ | ---------------------------------------------- |
| `RESEND_API_KEY`         | ✅ Yes   | -                  | Your Resend API key                            |
| `EMAIL_FROM`             | ✅ Yes   | -                  | Verified sender email address                  |
| `EMAIL_TO`               | ✅ Yes   | -                  | Recipient email(s), comma-separated            |
| `SYMBOLS`                | ✅ Yes   | -                  | Stock symbols to monitor (comma-separated)     |
| `EMAIL_SUBJECT`          | ❌ No    | `SEC Filing Alert` | Email subject line                             |
| `CHECK_INTERVAL_MINUTES` | ❌ No    | `30`               | Minutes between checks (min: 5)                |
| `FILINGS_LIMIT`          | ❌ No    | `14`               | Number of recent filings to track (per symbol) |
| `RUN_ONCE`               | ❌ No    | `false`            | Run single check and exit                      |
| `SEND_TEST_EMAIL`        | ❌ No    | `false`            | Send test email and exit                       |

## Usage

### Continuous Monitoring

```bash
npm run dev
```

### One-Time Check

```bash
RUN_ONCE=true npm run dev
```

### Test Email

```bash
SEND_TEST_EMAIL=true npm run dev
```

## How It Works

1. **API Polling** - Fetches recent SEC filings from NASDAQ API
2. **State Tracking** - Compares with previously seen filings in `watcher-state.json`
3. **Detection** - Identifies new filings by comparing filing IDs
4. **Notification** - Sends formatted email with filing details
5. **State Update** - Updates state file with latest filings

## Email Notifications

Emails include:

- Number of new filings
- Filing type (8-K, 10-Q, 10-K, etc.)
- Filing date and period
- Direct links to view filings
- Mobile-responsive design

## Deployment

### Docker

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

### Linux Service

Create `/etc/systemd/system/pcsa-watcher.service`:

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

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Email Issues

- Verify Resend API key
- Ensure sender domain is verified
- Check `EMAIL_FROM` format: `Name <[email protected]>`
- Run test email: `SEND_TEST_EMAIL=true npm run dev`

### No Filings Detected

- Check API URL directly: `https://api.nasdaq.com/api/company/{SYMBOL}/sec-filings`
- Delete `watcher-state.json` to reset state
- Verify network connectivity

### Rate Limiting

- Don't set `CHECK_INTERVAL_MINUTES` below 5 minutes
- NASDAQ API may have rate limits

## Development

```bash
npm run dev      # Development with ts-node
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

## Security

- Never commit `.env` files
- Use environment variables for secrets
- Restrict file permissions on sensitive files
- Rotate API keys periodically

## License

ISC

---

**Monitor any publicly traded company's SEC filings** 📈
