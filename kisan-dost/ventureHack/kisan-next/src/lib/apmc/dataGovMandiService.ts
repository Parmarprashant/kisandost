/**
 * Government of India Mandi (APMC) Real-Time Price Service
 * Integrated with data.gov.in API (Ministry of Agriculture and Farmers Welfare)
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 */

import dbConnect from "@/lib/mongodb";
import MarketPrice from "@/models/MarketPrice";

export interface MandiPriceResult {
  crop: string;
  mandi: string;
  district: string;
  state: string;
  pricePerQuintal: number;
  minPrice: number;
  maxPrice: number;
  arrivalDate: string;
  source: "data.gov.in (Live APMC)" | "data.gov.in (National APMC Average)" | "Database Cache" | "Government MSP Baseline";
  variety?: string;
  timestamp: string;
}

// Map common frontend crop names to data.gov.in official commodity terms
const COMMODITY_MAPPINGS: Record<string, string[]> = {
  wheat: ["Wheat"],
  rice: ["Rice", "Paddy(Common)", "Paddy(Dhan)(Common)"],
  paddy: ["Paddy(Common)", "Paddy(Dhan)(Common)", "Rice"],
  maize: ["Maize"],
  cotton: ["Cotton"],
  sugarcane: ["Sugarcane", "Gur(Jaggery)"],
  soybean: ["Soyabean"],
  soyabean: ["Soyabean"],
  mustard: ["Mustard"],
  gram: ["Bengal Gram(Gram)(Whole)", "Gram Raw(Chholia)"],
  chana: ["Bengal Gram(Gram)(Whole)"],
  bajra: ["Bajra(Pearl Millet/Cumbu)"],
  jowar: ["Jowar(Sorghum)"],
  potato: ["Potato"],
  tomato: ["Tomato"],
  onion: ["Onion"],
  groundnut: ["Groundnut"],
  barley: ["Barley (Jau)"],
};

// Official Government Minimum Support Price (MSP) / Statutory Benchmarks (₹ / quintal)
const MSP_BENCHMARKS: Record<string, number> = {
  wheat: 2425,
  rice: 2700,
  paddy: 2300,
  maize: 2090,
  cotton: 7121,
  sugarcane: 350, // Statutory FRP (Fair and Remunerative Price)
  soybean: 4892,
  soyabean: 4892,
  mustard: 5650,
  gram: 5440,
  chana: 5440,
  bajra: 2500,
  jowar: 3180,
  potato: 1500,
  tomato: 1400,
  onion: 2100,
  groundnut: 6783,
  barley: 1850,
};

// In-memory cache to prevent excessive network requests (TTL: 30 minutes)
interface CacheEntry {
  data: MandiPriceResult;
  expiry: number;
}
const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 mins

/**
 * Fetch real-time Mandi price for a crop and location from data.gov.in
 */
export async function fetchLiveMandiPrice(
  crop: string,
  state?: string,
  district?: string
): Promise<MandiPriceResult> {
  const cleanCrop = crop.trim();
  const lowerCrop = cleanCrop.toLowerCase();
  const cleanState = state?.trim();
  const cacheKey = `${lowerCrop}_${cleanState?.toLowerCase() || "all"}`;

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  const apiKey = process.env.DATA_GOV_API_KEY || "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
  const resourceId = process.env.DATA_GOV_MANDI_RESOURCE_ID || "9ef84268-d588-465a-a308-a864a43d0070";
  const commoditiesToTry = COMMODITY_MAPPINGS[lowerCrop] || [cleanCrop];

  // 2. Try fetching from data.gov.in API
  try {
    for (const commodity of commoditiesToTry) {
      const result = await queryDataGovApi({
        apiKey,
        resourceId,
        commodity,
        state: cleanState,
        district,
      });

      if (result) {
        // Cache result in memory
        memoryCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL_MS });

        // Asynchronously persist to MongoDB for long-term tracking
        persistPriceToDb(result).catch((e) =>
          console.warn("[MandiService] DB persist error:", e.message)
        );

        return result;
      }
    }
  } catch (apiError: any) {
    console.warn(`[MandiService] data.gov.in API call failed: ${apiError.message}. Using fallback.`);
  }

  // 3. Fallback: Check MongoDB MarketPrice collection
  try {
    await dbConnect();
    const query: any = { crop: new RegExp(`^${cleanCrop}$`, "i") };
    if (cleanState) {
      query.$or = [{ state: new RegExp(`^${cleanState}$`, "i") }, { state: "" }];
    }
    const dbRecord = await MarketPrice.findOne(query).sort({ lastUpdated: -1 });

    if (dbRecord) {
      const fallbackResult: MandiPriceResult = {
        crop: cleanCrop,
        mandi: dbRecord.mandi || "Regional APMC",
        district: dbRecord.district || "",
        state: dbRecord.state || cleanState || "India",
        pricePerQuintal: Number(dbRecord.pricePerQuintal),
        minPrice: dbRecord.minPrice || Number(dbRecord.pricePerQuintal) * 0.95,
        maxPrice: dbRecord.maxPrice || Number(dbRecord.pricePerQuintal) * 1.05,
        arrivalDate: dbRecord.arrivalDate || new Date().toLocaleDateString("en-IN"),
        source: "Database Cache",
        variety: dbRecord.variety || "FAQ",
        timestamp: new Date().toISOString(),
      };
      memoryCache.set(cacheKey, { data: fallbackResult, expiry: Date.now() + CACHE_TTL_MS });
      return fallbackResult;
    }
  } catch (dbErr: any) {
    console.warn("[MandiService] DB fallback lookup failed:", dbErr.message);
  }

  // 4. Ultimate Safety Net: Government MSP / FRP Benchmark
  const msp = MSP_BENCHMARKS[lowerCrop] || 2200;
  const benchmarkResult: MandiPriceResult = {
    crop: cleanCrop,
    mandi: cleanState ? `${cleanState} APMC Benchmark` : "National APMC Benchmark",
    district: district || "",
    state: cleanState || "India",
    pricePerQuintal: msp,
    minPrice: Math.round(msp * 0.95),
    maxPrice: Math.round(msp * 1.05),
    arrivalDate: new Date().toLocaleDateString("en-IN"),
    source: "Government MSP Baseline",
    variety: "FAQ Standard",
    timestamp: new Date().toISOString(),
  };

  memoryCache.set(cacheKey, { data: benchmarkResult, expiry: Date.now() + CACHE_TTL_MS });
  return benchmarkResult;
}

/**
 * Internal helper to query data.gov.in with timeouts and state/national fallback
 */
async function queryDataGovApi({
  apiKey,
  resourceId,
  commodity,
  state,
  district,
}: {
  apiKey: string;
  resourceId: string;
  commodity: string;
  state?: string;
  district?: string;
}): Promise<MandiPriceResult | null> {
  const baseUrl = `https://api.data.gov.in/resource/${resourceId}`;

  // Helper for single request with 4-second timeout
  const executeQuery = async (params: Record<string, string>) => {
    const url = new URL(baseUrl);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "20");

    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const json = await response.json();
      return json.records && Array.isArray(json.records) && json.records.length > 0
        ? json.records
        : null;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  };

  // Step 1: Query with state filter if state provided
  if (state) {
    const stateRecords = await executeQuery({
      "filters[commodity]": commodity,
      "filters[state]": state,
    });

    if (stateRecords && stateRecords.length > 0) {
      // If district matches, pick it, otherwise pick the first valid record
      let chosen = stateRecords[0];
      if (district) {
        const districtMatch = stateRecords.find(
          (r: any) =>
            r.district?.toLowerCase() === district.toLowerCase() ||
            district.toLowerCase().includes(r.district?.toLowerCase() || "")
        );
        if (districtMatch) chosen = districtMatch;
      }

      const modalPrice = Number(chosen.modal_price) || Number(chosen.max_price) || Number(chosen.min_price);
      if (modalPrice > 0) {
        return {
          crop: chosen.commodity || commodity,
          mandi: chosen.market ? `${chosen.market}` : `${chosen.district || state} APMC`,
          district: chosen.district || "",
          state: chosen.state || state,
          pricePerQuintal: Math.round(modalPrice),
          minPrice: Number(chosen.min_price) || Math.round(modalPrice * 0.95),
          maxPrice: Number(chosen.max_price) || Math.round(modalPrice * 1.05),
          arrivalDate: chosen.arrival_date || new Date().toLocaleDateString("en-IN"),
          source: "data.gov.in (Live APMC)",
          variety: chosen.variety || "FAQ",
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  // Step 2: National query for the commodity if state query yielded nothing or no state provided
  const nationalRecords = await executeQuery({
    "filters[commodity]": commodity,
  });

  if (nationalRecords && nationalRecords.length > 0) {
    // Pick the most relevant record or compute average
    const validPrices = nationalRecords
      .map((r: any) => Number(r.modal_price))
      .filter((p: number) => !isNaN(p) && p > 0);

    const avgPrice =
      validPrices.length > 0
        ? Math.round(validPrices.reduce((a: number, b: number) => a + b, 0) / validPrices.length)
        : Number(nationalRecords[0].modal_price) || 2200;

    const sample = nationalRecords[0];
    return {
      crop: sample.commodity || commodity,
      mandi: sample.market ? `${sample.market} (National avg: ₹${avgPrice})` : `National APMC Average`,
      district: sample.district || "",
      state: sample.state || "National",
      pricePerQuintal: avgPrice,
      minPrice: Math.min(...validPrices.slice(0, 10)),
      maxPrice: Math.max(...validPrices.slice(0, 10)),
      arrivalDate: sample.arrival_date || new Date().toLocaleDateString("en-IN"),
      source: "data.gov.in (National APMC Average)",
      variety: sample.variety || "FAQ",
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Helper to update MongoDB with live rate
 */
async function persistPriceToDb(data: MandiPriceResult) {
  try {
    await dbConnect();
    await MarketPrice.findOneAndUpdate(
      { crop: data.crop, mandi: data.mandi },
      {
        crop: data.crop,
        mandi: data.mandi,
        pricePerQuintal: data.pricePerQuintal,
        state: data.state,
        district: data.district,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        variety: data.variety || "",
        arrivalDate: data.arrivalDate,
        source: data.source,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (err: any) {
    console.warn("[MandiService] MongoDB upsert warning:", err.message);
  }
}
