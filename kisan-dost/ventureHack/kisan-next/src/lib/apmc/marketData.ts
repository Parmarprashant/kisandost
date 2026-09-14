import { fetchLiveMandiPrice, MandiPriceResult } from "@/lib/apmc/dataGovMandiService";
import MarketPrice from "@/models/MarketPrice";

const SEED_DATA = [
  { crop: "Wheat", mandi: "Chittorgarh", state: "Rajasthan", pricePerQuintal: 2450 },
  { crop: "Rice", mandi: "Surat", state: "Gujarat", pricePerQuintal: 2800 },
  { crop: "Maize", mandi: "Indore", state: "Madhya Pradesh", pricePerQuintal: 2050 },
  { crop: "Cotton", mandi: "Amreli", state: "Gujarat", pricePerQuintal: 7400 },
  { crop: "Sugarcane", mandi: "Kolhapur", state: "Maharashtra", pricePerQuintal: 350 },
];

/**
 * Returns the live market price per quintal (₹) using real data.gov.in Mandi APMC data
 */
export async function getMarketPrice(crop: string, mandiOrState?: string): Promise<number> {
  const result = await getDetailedMarketPrice(crop, mandiOrState);
  return result.pricePerQuintal;
}

/**
 * Returns comprehensive real-time Mandi APMC data including market name, arrival date, min/max prices
 */
export async function getDetailedMarketPrice(crop: string, mandiOrState?: string): Promise<MandiPriceResult> {
  // If mandiOrState resembles a known Indian state or district/mandi name, pass it
  return await fetchLiveMandiPrice(crop, mandiOrState);
}

export async function seedMarketPrices() {
  for (const data of SEED_DATA) {
    await MarketPrice.findOneAndUpdate(
      { crop: data.crop, mandi: data.mandi },
      { ...data, source: "CACP / APMC Baseline", lastUpdated: new Date() },
      { upsert: true }
    );
  }
}

export type { MandiPriceResult };
