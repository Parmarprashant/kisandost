import { NextRequest, NextResponse } from "next/server";
import { getDistrictSuggestion } from "@/lib/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { 
      district, 
      season = "Kharif",
      waterAvailability = "Medium",
      recommendedCrops = []
    } = await request.json();

    if (!district) {
      return NextResponse.json(
        { error: "District parameter is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Getting suggestions for district: ${district}, season: ${season}`);

    const advisory = await getDistrictSuggestion(
      district, 
      season, 
      waterAvailability, 
      recommendedCrops
    );

    return NextResponse.json({ advisory });
  } catch (error: any) {
    console.error("[API] Error getting district suggestion:", error);

    return NextResponse.json(
      {
        error: "Failed to get district suggestion",
        message: error?.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
