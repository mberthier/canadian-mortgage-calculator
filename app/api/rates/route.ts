import { NextResponse } from "next/server";
import { getRates } from "@/lib/getRates";

export const revalidate = 3600; // 1 hour

export async function GET() {
  const rates = await getRates();
  return NextResponse.json(rates);
}
