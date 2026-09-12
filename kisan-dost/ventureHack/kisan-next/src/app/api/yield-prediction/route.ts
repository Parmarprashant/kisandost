import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import YieldPrediction from '@/models/YieldPrediction';

/**
 * Authentic ICAR Agronomic Crop Physiology Database
 * Standard regional yields (ICAR / Directorate of Economics & Statistics benchmarks)
 * and physiological water/canopy response curves.
 */
interface CropPhysiology {
  name: string;
  baseYieldAcre: number;      // tons/acre regional average
  baseYieldHectare: number;   // tons/hectare regional average
  minOptimalRain: number;     // mm seasonal requirement
  maxOptimalRain: number;     // mm
  minOptimalMoisture: number; // % root zone moisture
  maxOptimalMoisture: number; // %
  waterSensitivity: number;   // 0.6 (drought hardy) to 1.5 (heavy water requirement)
}

export const CROP_PROFILES: Record<string, CropPhysiology> = {
  rice: {
    name: "Rice (Paddy)",
    baseYieldAcre: 2.10,
    baseYieldHectare: 5.19,
    minOptimalRain: 250,
    maxOptimalRain: 500,
    minOptimalMoisture: 42,
    maxOptimalMoisture: 60,
    waterSensitivity: 1.45,
  },
  wheat: {
    name: "Wheat",
    baseYieldAcre: 1.85,
    baseYieldHectare: 4.57,
    minOptimalRain: 120,
    maxOptimalRain: 260,
    minOptimalMoisture: 30,
    maxOptimalMoisture: 46,
    waterSensitivity: 1.00,
  },
  corn: {
    name: "Corn (Maize)",
    baseYieldAcre: 2.35,
    baseYieldHectare: 5.81,
    minOptimalRain: 180,
    maxOptimalRain: 360,
    minOptimalMoisture: 32,
    maxOptimalMoisture: 48,
    waterSensitivity: 1.15,
  },
  cotton: {
    name: "Cotton",
    baseYieldAcre: 0.95,
    baseYieldHectare: 2.35,
    minOptimalRain: 100,
    maxOptimalRain: 250,
    minOptimalMoisture: 22,
    maxOptimalMoisture: 38,
    waterSensitivity: 0.70,   // Drought-hardy taproot
  },
  soybean: {
    name: "Soybean",
    baseYieldAcre: 1.15,
    baseYieldHectare: 2.84,
    minOptimalRain: 180,
    maxOptimalRain: 320,
    minOptimalMoisture: 30,
    maxOptimalMoisture: 45,
    waterSensitivity: 1.25,   // Sensitive during flowering & pod-fill
  },
  sugarcane: {
    name: "Sugarcane",
    baseYieldAcre: 34.0,
    baseYieldHectare: 84.0,
    minOptimalRain: 350,
    maxOptimalRain: 650,
    minOptimalMoisture: 44,
    maxOptimalMoisture: 60,
    waterSensitivity: 1.35,
  },
};

/**
 * Agronomic Multiplier Engine
 * Models photosynthetic vigor (NDVI), root-zone hydration (soil moisture),
 * precipitation adequacy (rainfall), and Liebig's Law of the Minimum.
 */
function calculateCropMultiplier(
  profile: CropPhysiology,
  ndvi: number,
  soilMoisture: number,
  rainfall: number
): {
  multiplier: number;
  ndviFactor: number;
  moistureFactor: number;
  rainFactor: number;
  waterComposite: number;
} {
  // 1. NDVI Biomass & Canopy Vigor Factor (Standard healthy canopy ~ 0.65 -> 1.00x)
  let ndviFactor: number;
  if (ndvi >= 0.75) {
    ndviFactor = 1.08 + Math.min(0.18, ((ndvi - 0.75) / 0.20) * 0.18); // 1.08x to 1.26x
  } else if (ndvi >= 0.58) {
    ndviFactor = 0.92 + ((ndvi - 0.58) / 0.17) * 0.16; // 0.92x to 1.08x
  } else if (ndvi >= 0.35) {
    ndviFactor = 0.60 + ((ndvi - 0.35) / 0.23) * 0.32; // 0.60x to 0.92x
  } else {
    ndviFactor = 0.30 + ((ndvi - 0.10) / 0.25) * 0.30; // 0.30x to 0.60x
  }

  // 2. Soil Moisture Factor (Root zone hydration)
  let moistureFactor: number;
  if (soilMoisture >= profile.minOptimalMoisture && soilMoisture <= profile.maxOptimalMoisture) {
    moistureFactor = 1.08; // Optimal root hydration
  } else if (soilMoisture < profile.minOptimalMoisture) {
    const deficitRatio = (profile.minOptimalMoisture - soilMoisture) / profile.minOptimalMoisture;
    const penalty = Math.min(0.65, deficitRatio * profile.waterSensitivity * 0.85);
    moistureFactor = Math.max(0.35, 1.0 - penalty);
  } else {
    const excessRatio = (soilMoisture - profile.maxOptimalMoisture) / (65 - profile.maxOptimalMoisture);
    const penalty = Math.min(0.35, excessRatio * 0.45);
    moistureFactor = Math.max(0.65, 1.05 - penalty);
  }

  // 3. Rainfall Factor (Precipitation adequacy)
  let rainFactor: number;
  if (rainfall >= profile.minOptimalRain && rainfall <= profile.maxOptimalRain) {
    rainFactor = 1.10; // Optimal rain
  } else if (rainfall < profile.minOptimalRain) {
    const rainDeficit = (profile.minOptimalRain - rainfall) / profile.minOptimalRain;
    const penalty = Math.min(0.65, rainDeficit * profile.waterSensitivity * 0.75);
    rainFactor = Math.max(0.35, 1.0 - penalty);
  } else {
    const excessRain = (rainfall - profile.maxOptimalRain) / 300;
    const penalty = Math.min(0.30, excessRain * 0.40);
    rainFactor = Math.max(0.70, 1.05 - penalty);
  }

  // 4. Combined Water Availability (Soil moisture 60% + Rainfall 40%)
  // Irrigated fields maintain good moisture even when rainfall is low.
  const waterComposite = (moistureFactor * 0.60) + (rainFactor * 0.40);

  // 5. Total Agronomic Multiplier
  let raw = (ndviFactor * 0.40) + (waterComposite * 0.60);

  // Liebig's Law of the Minimum:
  // If water availability is constrained, canopy biomass cannot yield full grain/fruit.
  if (waterComposite < 0.85) {
    raw = Math.min(raw, waterComposite * 1.15);
  }

  const multiplier = Math.max(0.30, Math.min(1.30, raw));
  return { multiplier, ndviFactor, moistureFactor, rainFactor, waterComposite };
}

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    try {
      const authData = await auth();
      userId = authData.userId;
    } catch {
      // Allow unauthenticated for demo
    }

    let body: {
      crop_type?: string;
      area_acres?: number;
      area_unit?: "acres" | "hectares";
      ndvi?: number;
      soil_moisture?: number;
      rainfall?: number;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
    }

    const { crop_type, area_acres, area_unit = "acres", ndvi, soil_moisture, rainfall } = body;

    const cropKey = (crop_type || "").toLowerCase().trim();
    const profile = CROP_PROFILES[cropKey];

    if (!profile) {
      return NextResponse.json(
        { error: `Crop "${crop_type}" not recognized. Valid crops: ${Object.keys(CROP_PROFILES).join(", ")}` },
        { status: 400 }
      );
    }

    const numAcres = Number(area_acres) || 1;
    const numNdvi = Math.max(0.1, Math.min(0.95, Number(ndvi) ?? 0.65));
    const numMoisture = Math.max(5, Math.min(60, Number(soil_moisture) ?? 30));
    const numRainfall = Math.max(0, Math.min(500, Number(rainfall) ?? 150));

    // Calculate crop-specific environmental impact
    const { multiplier, ndviFactor, moistureFactor, rainFactor, waterComposite } = calculateCropMultiplier(
      profile,
      numNdvi,
      numMoisture,
      numRainfall
    );

    // Yield Calculations
    const yieldPerAcre = Number((profile.baseYieldAcre * multiplier).toFixed(2));
    const yieldPerHectare = Number((profile.baseYieldHectare * multiplier).toFixed(2));
    const totalYield = Number((yieldPerAcre * numAcres).toFixed(2));

    // Baselines
    const baselineAcre = profile.baseYieldAcre;
    const baselineHectare = profile.baseYieldHectare;

    // Percent difference vs regional baseline
    const percentDiff = Number((((multiplier - 1.0) / 1.0) * 100).toFixed(1));

    // Dynamic agronomic insight explaining the exact drivers
    let insight = "";
    if (percentDiff <= -25) {
      insight = `Significant yield deficit (${Math.abs(percentDiff)}% below baseline). Severe moisture constraint (rain ${numRainfall}mm, soil moisture ${numMoisture}%) is suppressing ${profile.name} productivity. Immediate supplemental irrigation and foliar stress-recovery nutrients are essential.`;
    } else if (percentDiff < -3) {
      const constraintText = numRainfall < profile.minOptimalRain ? `sub-optimal rainfall (${numRainfall}mm vs ${profile.minOptimalRain}mm optimal)` : `soil moisture (${numMoisture}%)`;
      insight = `Yield is projected at ${Math.abs(percentDiff)}% below regional baseline. While canopy vigor (NDVI ${numNdvi.toFixed(2)}) is supportive, ${constraintText} is capping yield. Supplementary irrigation will recover potential.`;
    } else if (percentDiff <= 4) {
      insight = `Projected yield matches regional average (~${baselineAcre} t/acre). Soil moisture (${numMoisture}%) and rainfall (${numRainfall}mm) are near physiological equilibrium for ${profile.name}.`;
    } else if (percentDiff <= 15) {
      insight = `Favorable harvest projected (+${percentDiff}% above regional average). Strong vegetation vigor (NDVI ${numNdvi.toFixed(2)}) and healthy soil moisture (${numMoisture}%) provide ideal growth conditions.`;
    } else {
      insight = `Exceptional yield potential (+${percentDiff}% above regional average)! Optimal soil hydration (${numMoisture}%), rainfall (${numRainfall}mm), and peak canopy vigor (NDVI ${numNdvi.toFixed(2)}) maximize crop development.`;
    }

    if (userId) {
      try {
        await dbConnect();
        await YieldPrediction.create({
          userId,
          crop_type: cropKey,
          area_acres: numAcres,
          ndvi: numNdvi,
          soil_moisture: numMoisture,
          rainfall: numRainfall,
          predicted_yield: totalYield,
          yield_per_acre: yieldPerAcre,
          backend: "crop-physiology-engine",
        });
      } catch (dbErr) {
        console.warn("Failed to store yield record:", dbErr);
      }
    }

    console.log(`[YieldAI] Crop=${profile.name}, Area=${numAcres}ac, NDVI=${numNdvi}, Moist=${numMoisture}%, Rain=${numRainfall}mm`);
    console.log(`[YieldAI] Predicted=${yieldPerAcre} t/acre vs Base=${baselineAcre} t/acre [${percentDiff > 0 ? "+" : ""}${percentDiff}%], Total=${totalYield}t`);

    return NextResponse.json({
      predicted_yield: yieldPerHectare,           // tons/hectare rate
      yield_per_acre: yieldPerAcre,               // tons/acre rate
      average_regional_yield: baselineHectare,    // tons/hectare baseline
      average_regional_per_acre: baselineAcre,    // tons/acre baseline
      total_yield: totalYield,                    // Total farm harvest across whole acreage
      area_acres: numAcres,
      area_unit,
      crop: crop_type,
      percent_difference: percentDiff,
      is_above_average: percentDiff >= 0,
      insights: insight,
    });
  } catch (error: unknown) {
    console.error("Yield prediction error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
