// Bank of Canada overnight rate and best 5-year fixed rate history
// Source: Bank of Canada, Ratehub.ca
// Updated: April 2026

export interface RatePoint {
  date: string;   // YYYY-MM-DD
  label: string;  // short label for chart
  overnight: number;
  fiveYearFixed: number;
  event?: string; // annotation for significant changes
}

export const RATE_HISTORY: RatePoint[] = [
  // 2023
  { date: "2023-01-01", label: "Jan '23", overnight: 4.25, fiveYearFixed: 5.04 },
  { date: "2023-02-01", label: "Feb '23", overnight: 4.50, fiveYearFixed: 5.14, event: "BoC +0.25%" },
  { date: "2023-03-01", label: "Mar '23", overnight: 4.50, fiveYearFixed: 5.09 },
  { date: "2023-04-01", label: "Apr '23", overnight: 4.50, fiveYearFixed: 5.19 },
  { date: "2023-05-01", label: "May '23", overnight: 4.50, fiveYearFixed: 5.34 },
  { date: "2023-06-01", label: "Jun '23", overnight: 4.75, fiveYearFixed: 5.49, event: "BoC +0.25%" },
  { date: "2023-07-01", label: "Jul '23", overnight: 5.00, fiveYearFixed: 5.64, event: "BoC +0.25%" },
  { date: "2023-08-01", label: "Aug '23", overnight: 5.00, fiveYearFixed: 5.79 },
  { date: "2023-09-01", label: "Sep '23", overnight: 5.00, fiveYearFixed: 5.89 },
  { date: "2023-10-01", label: "Oct '23", overnight: 5.00, fiveYearFixed: 5.99 },
  { date: "2023-11-01", label: "Nov '23", overnight: 5.00, fiveYearFixed: 5.79 },
  { date: "2023-12-01", label: "Dec '23", overnight: 5.00, fiveYearFixed: 5.49 },
  // 2024
  { date: "2024-01-01", label: "Jan '24", overnight: 5.00, fiveYearFixed: 5.19 },
  { date: "2024-02-01", label: "Feb '24", overnight: 5.00, fiveYearFixed: 5.04 },
  { date: "2024-03-01", label: "Mar '24", overnight: 5.00, fiveYearFixed: 4.89 },
  { date: "2024-04-01", label: "Apr '24", overnight: 5.00, fiveYearFixed: 4.99 },
  { date: "2024-05-01", label: "May '24", overnight: 5.00, fiveYearFixed: 4.89 },
  { date: "2024-06-01", label: "Jun '24", overnight: 4.75, fiveYearFixed: 4.74, event: "First cut in 4 yrs" },
  { date: "2024-07-01", label: "Jul '24", overnight: 4.50, fiveYearFixed: 4.54, event: "BoC −0.25%" },
  { date: "2024-08-01", label: "Aug '24", overnight: 4.25, fiveYearFixed: 4.34, event: "BoC −0.25%" },
  { date: "2024-09-01", label: "Sep '24", overnight: 4.25, fiveYearFixed: 4.19 },
  { date: "2024-10-01", label: "Oct '24", overnight: 3.75, fiveYearFixed: 4.09, event: "BoC −0.50%" },
  { date: "2024-11-01", label: "Nov '24", overnight: 3.75, fiveYearFixed: 4.04 },
  { date: "2024-12-01", label: "Dec '24", overnight: 3.25, fiveYearFixed: 3.94, event: "BoC −0.50%" },
  // 2025
  { date: "2025-01-01", label: "Jan '25", overnight: 3.00, fiveYearFixed: 3.84, event: "BoC −0.25%" },
  { date: "2025-02-01", label: "Feb '25", overnight: 3.00, fiveYearFixed: 3.79 },
  { date: "2025-03-01", label: "Mar '25", overnight: 2.75, fiveYearFixed: 3.84, event: "BoC −0.25%" },
  { date: "2025-04-01", label: "Apr '25", overnight: 2.75, fiveYearFixed: 3.89 },
  { date: "2025-05-01", label: "May '25", overnight: 2.75, fiveYearFixed: 3.94 },
  { date: "2025-06-01", label: "Jun '25", overnight: 2.75, fiveYearFixed: 3.89 },
  { date: "2025-07-01", label: "Jul '25", overnight: 2.75, fiveYearFixed: 3.84 },
  { date: "2025-08-01", label: "Aug '25", overnight: 2.50, fiveYearFixed: 3.79, event: "BoC −0.25%" },
  { date: "2025-09-01", label: "Sep '25", overnight: 2.25, fiveYearFixed: 3.84, event: "BoC −0.25%" },
  { date: "2025-10-01", label: "Oct '25", overnight: 2.25, fiveYearFixed: 3.89 },
  { date: "2025-11-01", label: "Nov '25", overnight: 2.25, fiveYearFixed: 3.94 },
  { date: "2025-12-01", label: "Dec '25", overnight: 2.25, fiveYearFixed: 3.99 },
  // 2026
  { date: "2026-01-01", label: "Jan '26", overnight: 2.25, fiveYearFixed: 4.04 },
  { date: "2026-02-01", label: "Feb '26", overnight: 2.25, fiveYearFixed: 3.94 },
  { date: "2026-03-01", label: "Mar '26", overnight: 2.25, fiveYearFixed: 3.89, event: "BoC holds" },
  { date: "2026-04-01", label: "Apr '26", overnight: 2.25, fiveYearFixed: 3.89 },
];

export const CURRENT_OVERNIGHT = 2.25;
export const CURRENT_PRIME = 4.45;
export const RATE_DATA_AS_OF = "April 9, 2026";
