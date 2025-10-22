import * as cron from "node-cron";
import { NasdaqAPIClient } from "./api-client";
import { StateManager } from "./state-manager";
import { EmailService } from "./email-service";
import { SECFiling } from "./types";

export interface WatcherConfig {
  symbol: string;
  checkIntervalMinutes: number;
  limit: number;
  emailService: EmailService;
}

export class SECFilingsWatcher {
  private apiClient: NasdaqAPIClient;
  private stateManager: StateManager;
  private emailService: EmailService;
  private config: WatcherConfig;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(config: WatcherConfig) {
    this.config = config;
    this.apiClient = new NasdaqAPIClient(config.symbol);
    this.stateManager = new StateManager();
    this.emailService = config.emailService;
  }

  /**
   * Performs a single check for new filings
   */
  async checkForNewFilings(): Promise<void> {
    console.log("\n🔍 Checking for new SEC filings...");
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log("─".repeat(60));

    try {
      // Fetch current filings
      const filings = await this.apiClient.fetchSECFilings(this.config.limit);

      if (filings.length === 0) {
        console.log("⚠️  No filings found in API response");
        return;
      }

      // Create IDs for all current filings
      const currentFilingIds = filings.map((f) =>
        NasdaqAPIClient.createFilingId(f)
      );

      // Find new filings
      const newFilingIds = this.stateManager.findNewFilings(currentFilingIds);

      if (newFilingIds.length > 0) {
        // Filter to get only the new filing objects
        const newFilingsSet = new Set(newFilingIds);
        const newFilings = filings.filter((f) =>
          newFilingsSet.has(NasdaqAPIClient.createFilingId(f))
        );

        console.log("\n📋 New Filings Detected:");
        newFilings.forEach((filing, index) => {
          console.log(
            `  ${index + 1}. ${filing.formType} - Filed: ${filing.filed}${
              filing.reportingOwner ? ` (${filing.reportingOwner})` : ""
            }`
          );
        });

        // Send email notification
        try {
          await this.emailService.sendNewFilingsNotification(newFilings);
        } catch (emailError) {
          console.error("❌ Failed to send email notification:", emailError);
          // Continue even if email fails - we still want to update state
        }
      }

      // Update state with all current filings
      this.stateManager.updateState(currentFilingIds);

      console.log("─".repeat(60));
      console.log("✅ Check completed successfully\n");
    } catch (error) {
      console.error("❌ Error during filing check:", error);
      throw error;
    }
  }

  /**
   * Starts the watcher with scheduled checks
   */
  start(): void {
    console.log("🚀 Starting SEC Filings Watcher...");
    console.log(`   Symbol: ${this.config.symbol}`);
    console.log(
      `   Check Interval: Every ${this.config.checkIntervalMinutes} minute(s)`
    );
    console.log(`   Filings to track: ${this.config.limit}`);
    console.log("\n");

    // Perform initial check
    this.checkForNewFilings().catch((err) => {
      console.error("Error in initial check:", err);
    });

    // Schedule periodic checks
    const cronExpression = `*/${this.config.checkIntervalMinutes} * * * *`;

    this.cronJob = cron.schedule(cronExpression, async () => {
      try {
        await this.checkForNewFilings();
      } catch (error) {
        console.error("Error in scheduled check:", error);
      }
    });

    console.log(
      `⏰ Scheduled checks every ${this.config.checkIntervalMinutes} minute(s)`
    );
    console.log("   Press Ctrl+C to stop\n");
  }

  /**
   * Stops the watcher
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("🛑 Watcher stopped");
    }
  }

  /**
   * Performs a one-time check without scheduling
   */
  async runOnce(): Promise<void> {
    console.log("🔍 Running one-time check...\n");
    await this.checkForNewFilings();
  }
}
