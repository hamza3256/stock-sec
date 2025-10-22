import * as dotenv from "dotenv";
import { SECFilingsWatcher } from "./watcher";
import { EmailService } from "./email-service";

// Load environment variables
dotenv.config();

// Validate required environment variables
function validateEnv(): void {
  const required = ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_TO"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nPlease check your .env file and try again.");
    process.exit(1);
  }
}

async function main() {
  try {
    validateEnv();

    // Configuration
    const config = {
      symbol: process.env.SYMBOL || "PCSA",
      checkIntervalMinutes: parseInt(
        process.env.CHECK_INTERVAL_MINUTES || "30",
        10
      ),
      limit: parseInt(process.env.FILINGS_LIMIT || "14", 10),
      resendApiKey: process.env.RESEND_API_KEY!,
      emailFrom: process.env.EMAIL_FROM!,
      emailTo: process.env.EMAIL_TO!.split(",").map((e) => e.trim()),
      emailSubject: process.env.EMAIL_SUBJECT || "PCSA SEC Filing Alert",
      runOnce: process.env.RUN_ONCE === "true",
      sendTestEmail: process.env.SEND_TEST_EMAIL === "true",
    };

    // Initialize email service
    const emailService = new EmailService(config.resendApiKey, {
      from: config.emailFrom,
      to: config.emailTo,
      subject: config.emailSubject,
    });

    // Send test email if requested
    if (config.sendTestEmail) {
      console.log("📧 Sending test email...\n");
      await emailService.sendTestEmail();
      console.log("\n✅ Test email sent! Check your inbox.");
      process.exit(0);
    }

    // Initialize watcher
    const watcher = new SECFilingsWatcher({
      symbol: config.symbol,
      checkIntervalMinutes: config.checkIntervalMinutes,
      limit: config.limit,
      emailService,
    });

    // Run once or start continuous monitoring
    if (config.runOnce) {
      await watcher.runOnce();
      console.log("✅ One-time check completed");
      process.exit(0);
    } else {
      watcher.start();
    }

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n\n📊 Shutting down gracefully...");
      watcher.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n\n📊 Shutting down gracefully...");
      watcher.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the application
main();

