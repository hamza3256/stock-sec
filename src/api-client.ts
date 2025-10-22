import { NasdaqAPIResponse, SECFiling } from "./types";

export class NasdaqAPIClient {
  private baseUrl = "https://api.nasdaq.com/api/company";
  private symbol: string;

  constructor(symbol: string = "PCSA") {
    this.symbol = symbol;
  }

  /**
   * Fetches SEC filings for the company
   * @param limit Number of filings to retrieve
   * @returns Array of SEC filings
   */
  async fetchSECFilings(limit: number = 14): Promise<SECFiling[]> {
    const url = `${this.baseUrl}/${this.symbol}/sec-filings?limit=${limit}&sortColumn=filed&sortOrder=desc&IsQuoteMedia=true`;

    try {
      console.log(`Fetching SEC filings from: ${url}`);

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      const data = (await response.json()) as NasdaqAPIResponse;

      if (data.status.rCode !== 200) {
        throw new Error(`API returned error code: ${data.status.rCode}`);
      }

      if (!data.data || !data.data.rows) {
        console.warn("No filings data found in API response");
        return [];
      }

      console.log(`Successfully fetched ${data.data.rows.length} filings`);
      return data.data.rows;
    } catch (error) {
      console.error("Error fetching SEC filings:", error);
      throw error;
    }
  }

  /**
   * Creates a unique identifier for a filing
   */
  static createFilingId(filing: SECFiling): string {
    return `${filing.filed}_${filing.formType}_${
      filing.reportingOwner || "company"
    }`;
  }
}
