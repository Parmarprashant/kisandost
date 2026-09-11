import MarketPrice from "@/models/MarketPrice";


const SEED_DATA = [
  { crop: "Wheat", mandi: "Chittorgarh", pricePerQuintal: 2350 },
  { crop: "Rice", mandi: "Surat", pricePerQuintal: 3100 },
  { crop: "Maize", mandi: "Indore", pricePerQuintal: 1950 },
  { crop: "Cotton", mandi: "Amreli", pricePerQuintal: 7200 },
  { crop: "Sugarcane", mandi: "Kolhapur", pricePerQuintal: 350 },
];

export async function getMarketPrice(crop: string, mandi: string) {
  // Try to find in DB
  const priceData = await MarketPrice.findOne({ crop, mandi });
  
  // If not found, use a fallback from seed or simulate
  if (!priceData) {
    const fallback = SEED_DATA.find(d => d.crop.toLowerCase() === crop.toLowerCase());
    return fallback ? fallback.pricePerQuintal : 2000; // Default fallback
  }
  
  return priceData.pricePerQuintal;
}

export async function seedMarketPrices() {
  for (const data of SEED_DATA) {
    await MarketPrice.findOneAndUpdate(
      { crop: data.crop, mandi: data.mandi },
      { ...data, lastUpdated: new Date() },
      { upsert: true }
    );
  }
}
