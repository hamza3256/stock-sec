import { Resend } from "resend";
import { SECFiling, SECFilingWithSymbol, EmailConfig } from "./types";

export class EmailService {
  private resend: Resend;
  private config: EmailConfig;

  constructor(apiKey: string, config: EmailConfig) {
    this.resend = new Resend(apiKey);
    this.config = config;
  }

  /**
   * Formats a filing for email display (mobile-responsive)
   */
  private formatFilingHTML(filing: SECFilingWithSymbol): string {
    return `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 20px;">
            <!-- Symbol & Filing Type Badge -->
            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-right: 8px;">
                ${filing.symbol}
              </span>
              <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                ${filing.formType}
              </span>
            </div>
            
            <!-- Filing Details Table -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 12px 0;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #6b7280; width: 35%;">
                  <strong>Company:</strong>
                </td>
                <td style="padding: 6px 0; font-size: 14px; color: #111827;">
                  ${filing.companyName}
                </td>
              </tr>
              ${
                filing.reportingOwner
                  ? `<tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">
                        <strong>Owner:</strong>
                      </td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827;">
                        ${filing.reportingOwner}
                      </td>
                    </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">
                  <strong>Filed Date:</strong>
                </td>
                <td style="padding: 6px 0; font-size: 14px; color: #111827;">
                  ${filing.filed}
                </td>
              </tr>
              ${
                filing.period
                  ? `<tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">
                        <strong>Period:</strong>
                      </td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827;">
                        ${filing.period}
                      </td>
                    </tr>`
                  : ""
              }
            </table>
            
            <!-- Action Buttons -->
            ${
              filing.view?.htmlLink
                ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 16px;">
                    <tr>
                      <td align="center" style="padding: 4px;">
                        <a href="${
                          filing.view.htmlLink
                        }" style="display: block; background-color: #1a73e8; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center;">
                          📄 View HTML
                        </a>
                      </td>
                      ${
                        filing.view.pdfLink
                          ? `<td align="center" style="padding: 4px;">
                              <a href="${filing.view.pdfLink}" style="display: block; background-color: #dc3545; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; text-align: center;">
                                📑 View PDF
                              </a>
                            </td>`
                          : ""
                      }
                    </tr>
                  </table>`
                : ""
            }
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Creates HTML email body for new filings (mobile-responsive, multi-symbol)
   */
  private createEmailHTML(filings: SECFilingWithSymbol[]): string {
    // Group filings by symbol
    const filingsBySymbol: { [symbol: string]: SECFilingWithSymbol[] } = {};
    filings.forEach((filing) => {
      if (!filingsBySymbol[filing.symbol]) {
        filingsBySymbol[filing.symbol] = [];
      }
      filingsBySymbol[filing.symbol].push(filing);
    });

    const symbols = Object.keys(filingsBySymbol).sort();

    // Generate HTML for each symbol's filings
    const filingsHTML = symbols
      .map((symbol) => {
        const symbolFilings = filingsBySymbol[symbol];
        const symbolFilingsHTML = symbolFilings
          .map((f) => this.formatFilingHTML(f))
          .join("");

        return `
          <!-- Symbol Section Header -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0 16px 0;">
            <tr>
              <td>
                <h2 style="margin: 0; font-size: 18px; color: #111827; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
                  <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 700; margin-right: 8px;">
                    ${symbol}
                  </span>
                  ${symbolFilings.length} New Filing${
          symbolFilings.length > 1 ? "s" : ""
        }
                </h2>
              </td>
            </tr>
          </table>
          ${symbolFilingsHTML}
        `;
      })
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PCSA SEC Filing Alert</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">
                🔔 New SEC Filing Alert
              </h1>
              <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                ${symbols.join(", ")} - ${filings.length} New Filing${
      filings.length > 1 ? "s" : ""
    }
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 20px; background-color: #ffffff;">
              
              <!-- Summary -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #f0f9ff; border-left: 4px solid #1a73e8; padding: 16px; border-radius: 6px;">
                    <p style="margin: 0; font-size: 16px; color: #111827; line-height: 1.5;">
                      <strong style="color: #1a73e8; font-size: 20px;">${
                        filings.length
                      }</strong> 
                      new SEC filing${
                        filings.length > 1 ? "s have" : " has"
                      } been published
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Filings List -->
              ${filingsHTML}
              
              <!-- View All Filings Buttons -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
                ${symbols
                  .map(
                    (sym) => `
                  <tr>
                    <td align="center" style="padding: 6px 0;">
                      <a href="https://www.nasdaq.com/market-activity/stocks/${sym.toLowerCase()}/sec-filings" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                        📊 View All ${sym} Filings
                      </a>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 20px; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      This is an automated notification from <strong>PCSA SEC Filings Watcher</strong>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Checked at: ${new Date().toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })}
                    </p>
                    <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">
                      Monitoring: ${symbols.join(", ")}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Sends email notification for new filings (multi-symbol support)
   */
  async sendNewFilingsNotification(
    filings: SECFilingWithSymbol[]
  ): Promise<void> {
    if (filings.length === 0) {
      console.log("No filings to notify about");
      return;
    }

    // Get unique symbols from filings
    const symbols = [...new Set(filings.map((f) => f.symbol))].sort();
    const symbolsText =
      symbols.length > 3
        ? `${symbols.slice(0, 3).join(", ")} +${symbols.length - 3} more`
        : symbols.join(", ");

    const emailHTML = this.createEmailHTML(filings);
    const subject = `${symbolsText} - ${filings.length} New Filing${
      filings.length > 1 ? "s" : ""
    }`;

    try {
      console.log(
        `Sending email notification for ${filings.length} filing(s)...`
      );

      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: Array.isArray(this.config.to) ? this.config.to : [this.config.to],
        subject: subject,
        html: emailHTML,
      });

      if (error) {
        console.error("Error sending email:", error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log("✅ Email notification sent successfully!", data);
    } catch (error) {
      console.error("Failed to send email notification:", error);
      throw error;
    }
  }

  /**
   * Sends a test email to verify configuration (mobile-responsive)
   */
  async sendTestEmail(): Promise<void> {
    const nasdaqFilingsUrl =
      "https://www.nasdaq.com/market-activity/stocks/pcsa/sec-filings";

    const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PCSA Watcher Test Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                ✅
              </h1>
              <h2 style="margin: 12px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Test Email Successful
              </h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 20px; background-color: #ffffff;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.6; text-align: center;">
                Your <strong>PCSA SEC Filings Watcher</strong> is configured correctly!
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">
                      ✓ Email notifications are working
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 600;">
                      ✓ Connection to Resend API successful
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">
                      ✓ Ready to monitor PCSA SEC filings
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 16px 0; font-size: 15px; color: #6b7280; line-height: 1.6; text-align: center;">
                You will receive notifications here when new filings are detected.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="${nasdaqFilingsUrl}" style="display: inline-block; background-color: #1a73e8; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                      View PCSA Filings
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Sent at: ${new Date().toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: Array.isArray(this.config.to) ? this.config.to : [this.config.to],
        subject: "✅ PCSA Watcher - Test Email",
        html: testHTML,
      });

      if (error) {
        throw new Error(`Failed to send test email: ${error.message}`);
      }

      console.log("✅ Test email sent successfully!", data);
    } catch (error) {
      console.error("Failed to send test email:", error);
      throw error;
    }
  }
}
