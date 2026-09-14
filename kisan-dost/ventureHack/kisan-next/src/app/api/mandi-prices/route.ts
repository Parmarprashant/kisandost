import { NextRequest, NextResponse } from "next/server";
import { getDetailedMarketPrice } from "@/lib/apmc/marketData";

export const dynamic = "force-dynamic";

/**
 * GET /api/mandi-prices?crop=Wheat&state=Rajasthan&district=Alwar
 * Fetches verified real-time Indian Government Mandi (APMC) price from data.gov.in
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop") || "Wheat";
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;

    const data = await getDetailedMarketPrice(crop, state || district);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("[API /api/mandi-prices] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Mandi price",
      },
      { status: 500 }
    );
  }
}
