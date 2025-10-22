export interface SECFilingView {
  htmlLink: string;
  docLink: string;
  pdfLink: string;
  xbrLink: string;
  ixbrlContent: string;
  xlsLink: string;
  xBrlSubDoc: string;
}

export interface SECFiling {
  companyName: string;
  reportingOwner: string;
  formType: string;
  filed: string;
  period: string;
  view: SECFilingView;
}

export interface NasdaqAPIResponse {
  data: {
    symbol: string;
    totalRecords: number;
    rows: SECFiling[];
    headers: {
      companyName: string;
      formType: string;
      filed: string;
      period: string;
      view: string;
    };
    latest?: Array<{
      label: string;
      value: string;
    }>;
    filterOptions?: any[];
  };
  message: string | null;
  status: {
    rCode: number;
    bCodeMessage: any;
    developerMessage: any;
  };
}

export interface WatcherState {
  lastChecked: string;
  lastSeenFilings: string[]; // Array of filing identifiers (filed + formType + reportingOwner)
}

export interface EmailConfig {
  from: string;
  to: string | string[];
  subject: string;
}
