import * as cron from "node-cron";
import { NasdaqAPIClient } from "./api-client";
import { StateManager } from "./state-manager";
import { EmailService } from "./email-service";
import { SECFiling, SECFilingWithSymbol } from "./types";

export interface WatcherConfig {
  symbols: string[]; // Changed from single symbol to array
  checkIntervalMinutes: number;
  limit: number;
  emailService: EmailService;
}

export class SECFilingsWatcher {
  private stateManager: StateManager;
  private emailService: EmailService;
  private config: WatcherConfig;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(config: WatcherConfig) {
    this.config = config;
    this.stateManager = new StateManager();
    this.emailService = config.emailService;
  }

  /**
   * Performs a single check for new filings across all symbols
   */
  async checkForNewFilings(): Promise<void> {
    console.log("\n🔍 Checking for new SEC filings...");
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log(`Symbols: ${this.config.symbols.join(", ")}`);
    console.log("─".repeat(60));

    const allNewFilings: SECFilingWithSymbol[] = [];

    try {
      // Check each symbol
      for (const symbol of this.config.symbols) {
        console.log(`\n[${symbol}] Fetching filings...`);

        try {
          const apiClient = new NasdaqAPIClient(symbol);
          const filings = await apiClient.fetchSECFilings(this.config.limit);

          if (filings.length === 0) {
            console.log(`[${symbol}] ⚠️  No filings found in API response`);
            continue;
          }

          // Create IDs for all current filings
          const currentFilingIds = filings.map((f) =>
            NasdaqAPIClient.createFilingId(f)
          );

          // Find new filings for this symbol
          const newFilingIds = this.stateManager.findNewFilings(
            symbol,
            currentFilingIds
          );

          if (newFilingIds.length > 0) {
            // Filter to get only the new filing objects
            const newFilingsSet = new Set(newFilingIds);
            const newFilings = filings.filter((f) =>
              newFilingsSet.has(NasdaqAPIClient.createFilingId(f))
            );

            // Add symbol to each filing and add to collection
            const filingsWithSymbol: SECFilingWithSymbol[] = newFilings.map(
              (f) => ({ ...f, symbol })
            );
            allNewFilings.push(...filingsWithSymbol);

            console.log(`[${symbol}] 📋 ${newFilings.length} new filing(s):`);
            newFilings.forEach((filing, index) => {
              console.log(
                `  ${index + 1}. ${filing.formType} - Filed: ${filing.filed}${
                  filing.reportingOwner ? ` (${filing.reportingOwner})` : ""
                }`
              );
            });
          }

          // Update state for this symbol
          this.stateManager.updateSymbolState(symbol, currentFilingIds);
        } catch (symbolError) {
          console.error(`[${symbol}] ❌ Error fetching filings:`, symbolError);
          // Continue with other symbols even if one fails
        }
      }

      // Send email notification if there are any new filings
      if (allNewFilings.length > 0) {
        console.log(
          `\n📧 Sending email for ${allNewFilings.length} total new filing(s)...`
        );
        try {
          await this.emailService.sendNewFilingsNotification(allNewFilings);
        } catch (emailError) {
          console.error("❌ Failed to send email notification:", emailError);
          // Don't throw - we've already updated state
        }
      }

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
    console.log(`   Symbols: ${this.config.symbols.join(", ")}`);
    console.log(
      `   Check Interval: Every ${this.config.checkIntervalMinutes} minute(s)`
    );
    console.log(`   Filings to track: ${this.config.limit} per symbol`);
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
