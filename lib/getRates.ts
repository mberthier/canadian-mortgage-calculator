import { google } from "googleapis";
import { unstable_cache } from "next/cache";
import { RATE_PRESETS, RATES_UPDATED, RATES_BOC_OVERNIGHT, RATES_PRIME } from "./constants";
import type { RatePreset } from "./types";

export interface LiveRates {
  presets:      RatePreset[];
  updatedLabel: string;
  bocOvernight: number;
  prime:        number;
  source:       "sheet" | "fallback";
}

async function fetchFromSheet(): Promise<LiveRates | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const id    = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !id) return null;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: key },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: "Rates!A2:F20", // skip header row
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return null;

    // Expected sheet columns: Label | Rate | Term | Type | BocOvernight | Prime | UpdatedLabel
    // First data row carries the meta fields (BocOvernight, Prime, UpdatedLabel)
    const presets: RatePreset[] = [];
    let bocOvernight = RATES_BOC_OVERNIGHT;
    let prime        = RATES_PRIME;
    let updatedLabel = RATES_UPDATED;

    rows.forEach((row, i) => {
      const [label, rateStr, termStr, type] = row;
      if (!label || !rateStr || !termStr || !type) return;

      const rate = parseFloat(rateStr);
      const term = parseInt(termStr, 10);
      if (isNaN(rate) || isNaN(term)) return;

      presets.push({ label, rate, term, type: type as "fixed" | "variable" });

      // Meta fields on first row
      if (i === 0) {
        if (row[4]) bocOvernight = parseFloat(row[4]) || bocOvernight;
        if (row[5]) prime        = parseFloat(row[5]) || prime;
        if (row[6]) updatedLabel = row[6] || updatedLabel;
      }
    });

    if (presets.length === 0) return null;

    return { presets, updatedLabel, bocOvernight, prime, source: "sheet" };
  } catch (err) {
    console.error("getRates: sheet fetch failed", err);
    return null;
  }
}

// Cache for 1 hour — revalidates automatically
export const getRates = unstable_cache(
  async (): Promise<LiveRates> => {
    const live = await fetchFromSheet();
    if (live) return live;

    // Fallback to hardcoded constants
    return {
      presets:      RATE_PRESETS,
      updatedLabel: RATES_UPDATED,
      bocOvernight: RATES_BOC_OVERNIGHT,
      prime:        RATES_PRIME,
      source:       "fallback",
    };
  },
  ["live-rates"],
  { revalidate: 3600 } // 1 hour
);
