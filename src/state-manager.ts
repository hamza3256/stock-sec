import * as fs from "fs";
import * as path from "path";
import { WatcherState } from "./types";

export class StateManager {
  private stateFilePath: string;

  constructor(stateFilePath: string = "./watcher-state.json") {
    this.stateFilePath = path.resolve(stateFilePath);
  }

  /**
   * Loads the current state from disk
   */
  loadState(): WatcherState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const content = fs.readFileSync(this.stateFilePath, "utf-8");
        const state = JSON.parse(content);
        console.log(
          `Loaded state with ${
            state.lastSeenFilings?.length || 0
          } tracked filings`
        );
        return state;
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }

    // Return default state if file doesn't exist or error occurs
    console.log("Initializing new state");
    return {
      lastChecked: new Date().toISOString(),
      lastSeenFilings: [],
    };
  }

  /**
   * Saves the current state to disk
   */
  saveState(state: WatcherState): void {
    try {
      const content = JSON.stringify(state, null, 2);
      fs.writeFileSync(this.stateFilePath, content, "utf-8");
      console.log(
        `State saved: ${state.lastSeenFilings.length} filings tracked`
      );
    } catch (error) {
      console.error("Error saving state:", error);
      throw error;
    }
  }

  /**
   * Updates the state with new filings
   */
  updateState(filingIds: string[]): WatcherState {
    const state: WatcherState = {
      lastChecked: new Date().toISOString(),
      lastSeenFilings: filingIds,
    };
    this.saveState(state);
    return state;
  }

  /**
   * Identifies new filings by comparing with previous state
   */
  findNewFilings(currentFilingIds: string[]): string[] {
    const previousState = this.loadState();
    const previousFilings = new Set(previousState.lastSeenFilings);

    const newFilings = currentFilingIds.filter(
      (id) => !previousFilings.has(id)
    );

    if (newFilings.length > 0) {
      console.log(`Found ${newFilings.length} new filing(s)`);
    } else {
      console.log("No new filings detected");
    }

    return newFilings;
  }
}
