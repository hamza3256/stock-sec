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
        
        // Migrate old format to new format if needed
        if (state.lastSeenFilings && !state.symbols) {
          console.log("Migrating old state format to multi-symbol format");
          return {
            lastChecked: state.lastChecked,
            symbols: {},
          };
        }
        
        const totalFilings = Object.values(state.symbols || {}).reduce(
          (sum: number, symbolState: any) => sum + (symbolState.lastSeenFilings?.length || 0),
          0
        );
        console.log(
          `Loaded state with ${Object.keys(state.symbols || {}).length} symbol(s), ${totalFilings} total filings tracked`
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
      symbols: {},
    };
  }

  /**
   * Saves the current state to disk
   */
  saveState(state: WatcherState): void {
    try {
      const content = JSON.stringify(state, null, 2);
      fs.writeFileSync(this.stateFilePath, content, "utf-8");
      
      const totalFilings = Object.values(state.symbols).reduce(
        (sum, symbolState) => sum + symbolState.lastSeenFilings.length,
        0
      );
      console.log(
        `State saved: ${Object.keys(state.symbols).length} symbol(s), ${totalFilings} filings tracked`
      );
    } catch (error) {
      console.error("Error saving state:", error);
      throw error;
    }
  }

  /**
   * Updates the state with new filings for a specific symbol
   */
  updateSymbolState(symbol: string, filingIds: string[]): WatcherState {
    const state = this.loadState();
    
    state.symbols[symbol] = {
      lastSeenFilings: filingIds,
    };
    state.lastChecked = new Date().toISOString();
    
    this.saveState(state);
    return state;
  }

  /**
   * Identifies new filings for a specific symbol by comparing with previous state
   */
  findNewFilings(symbol: string, currentFilingIds: string[]): string[] {
    const previousState = this.loadState();
    const symbolState = previousState.symbols[symbol];
    const previousFilings = new Set(symbolState?.lastSeenFilings || []);

    const newFilings = currentFilingIds.filter(
      (id) => !previousFilings.has(id)
    );

    if (newFilings.length > 0) {
      console.log(`[${symbol}] Found ${newFilings.length} new filing(s)`);
    } else {
      console.log(`[${symbol}] No new filings detected`);
    }

    return newFilings;
  }
  
  /**
   * Gets the state for a specific symbol
   */
  getSymbolState(symbol: string): string[] {
    const state = this.loadState();
    return state.symbols[symbol]?.lastSeenFilings || [];
  }
}
