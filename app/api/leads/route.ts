import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// ── Google Sheets lead storage ──────────────────────────────────────────────
// Required environment variables (set in Vercel dashboard):
//   GOOGLE_SHEET_ID            — ID from the Sheet URL (/d/SHEET_ID/edit)
//   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
//   GOOGLE_PRIVATE_KEY         — private key from service account JSON
//                                (include full -----BEGIN/END PRIVATE KEY-----)

async function appendToSheet(row: string[]) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key:  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range:         "Sheet1!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email,
      mortgageType, savings, bestRate, userRate,
      homePrice, balance, mode, province,
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const timestamp    = new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" });
    const savingsFormatted = savings ? `$${Number(savings).toLocaleString("en-CA")}` : "";
    const homePriceFormatted = homePrice ? `$${Number(homePrice).toLocaleString("en-CA")}` : "";
    const balanceFormatted   = balance   ? `$${Number(balance).toLocaleString("en-CA")}` : "";

    const row = [
      timestamp,
      name        || "",
      email,
      mode        || "",
      province    || "",
      mortgageType || "",
      homePriceFormatted,
      balanceFormatted,
      userRate    ? `${userRate}%`  : "",
      bestRate    ? `${bestRate}%`  : "",
      savingsFormatted,
      userRate && bestRate ? `${(Number(userRate) - Number(bestRate)).toFixed(2)}%` : "",
    ];

    // Write to Google Sheet
    if (
      process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    ) {
      await appendToSheet(row);
    } else {
      // Fallback: log to console if env vars not set yet
      console.log("Lead (env vars not configured):", {
        name, email, mode, province, mortgageType,
        homePrice: homePriceFormatted, userRate, bestRate, savings: savingsFormatted,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
