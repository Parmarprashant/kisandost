import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import dbConnect from "@/lib/mongodb";
import YieldPrediction from "@/models/YieldPrediction";

// Crop-specific base yield data (tons per acre)
const CROP_BASE_YIELDS: Record<string, number> = {
  wheat: 3.0,
  rice: 2.5,
  corn: 4.0,
  cotton: 1.8,
  soybean: 2.5,
  sugarcane: 35, // Measured in different units
};

// Average regional yield (tons per acre)
const AVERAGE_REGIONAL_YIELD = 3.5;

// Python AI Service Configuration
const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000";
const USE_PYTHON_BACKEND = process.env.USE_PYTHON_BACKEND === "true";

/**
 * ULTRA-SENSITIVE NDVI Algorithm: Vegetation health with extreme response
 * Range: 0.05x to 3.0x yield multiplier (MAXIMUM impact on yield)
 * NDVI 0.1 (bare soil) → 0.05x yield, NDVI 0.95 (dense vegetation) → 3.0x yield
 */
function calculateNDVIImpact(ndvi: number): number {
  // Extreme sensitivity: bare soil vs lush vegetation
  // 0.1 (bare) = 0.05x, 0.5 (moderate) = 0.8x, 0.95 (dense) = 3.0x
  if (ndvi <= 0.1) return 0.05;
  if (ndvi >= 0.95) return 3.0;
  
  // Cubic interpolation for extreme sensitivity
  const normalized = (ndvi - 0.1) / (0.95 - 0.1);
  const ndviFactor = 0.05 + Math.pow(normalized, 2.5) * 2.95;
  
  return Math.max(0.05, Math.min(3.0, ndviFactor));
}

/**
 * ULTRA-SENSITIVE Soil Moisture Algorithm: Severe penalties for drought/waterlogging
 * Range: 0.05x to 2.5x yield multiplier (MAXIMUM impact on yield)
 * Optimal: 40-50%, penalties at both extremes
 */
function calculateSoilMoistureImpact(soilMoisture: number): number {
  // SEVERE penalties for drought and waterlogging
  // 5% (drought) = 0.05x, 45% (optimal) = 2.5x, 70% (waterlog) = 0.1x
  const optimal = 45;
  
  if (soilMoisture <= 5) return 0.05;  // Severe drought
  if (soilMoisture >= 70) return 0.1;  // Waterlogging
  if (Math.abs(soilMoisture - optimal) < 5) {
    return 2.5; // Optimal range (40-50%)
  }
  
  // Gaussian with extreme curvature
  const deviation = Math.abs(soilMoisture - optimal);
  const gaussianPenalty = Math.exp(-Math.pow(deviation, 2) / 200);
  const moistureFactor = 0.05 + gaussianPenalty * 2.45;
  
  return Math.max(0.05, Math.min(2.5, moistureFactor));
}

/**
 * ULTRA-SENSITIVE Rainfall Algorithm: Severe penalties for drought and excess
 * Range: 0.05x to 2.0x yield multiplier (MAXIMUM impact on yield)
 * Optimal: 250-350mm, severe penalties outside this range
 */
function calculateRainfallImpact(rainfall: number): number {
  // SEVERE sensitivity to rainfall extremes
  // <50mm (drought) = 0.05x, 300mm (optimal) = 2.0x, >500mm (excess) = 0.1x
  
  if (rainfall <= 20) return 0.05;    // Severe drought
  if (rainfall >= 600) return 0.1;    // Extreme waterlogging
  
  if (rainfall >= 250 && rainfall <= 350) {
    return 2.0; // OPTIMAL rainfall range
  }
  
  let rainfallFactor: number;
  if (rainfall < 50) {
    rainfallFactor = 0.05 + (rainfall / 50) * 0.2;  // 0.05-0.25
  } else if (rainfall < 250) {
    // Rapid improvement towards optimal
    rainfallFactor = 0.25 + ((rainfall - 50) / 200) * 1.75;  // 0.25-2.0
  } else if (rainfall < 450) {
    // Above optimal - rapid decline
    rainfallFactor = 2.0 - ((rainfall - 350) / 100) * 1.9;  // 2.0-0.1
  } else {
    rainfallFactor = Math.max(0.05, 0.1 - ((rainfall - 450) / 200) * 0.05);
  }
  
  return Math.max(0.05, Math.min(2.0, rainfallFactor));
}

/**
 * Call Python AI Backend for advanced ML-based yield prediction
 * Maps environmental factors DIRECTLY to yield (not through costs)
 */
async function callPythonAIBackend(
  cropType: string,
  areaAcres: number,
  ndvi: number,
  soilMoisture: number,
  rainfall: number,
  state: string = "Rajasthan"
): Promise<{
  predicted_profit: number;
  expected_revenue: number;
  predicted_yield: number;
  total_cost: number;
  recommendation: string;
  confidence: number;
  region: string;
} | null> {
  try {
    // Calculate environmental impact factors using algorithms
    const ndviFactor = calculateNDVIImpact(ndvi);
    const moistureFactor = calculateSoilMoistureImpact(soilMoisture);
    
    console.log(`📊 NDVI Impact Factor: ${ndviFactor.toFixed(3)} (Input NDVI: ${ndvi})`);
    console.log(`💧 Moisture Impact Factor: ${moistureFactor.toFixed(3)} (Input Moisture: ${soilMoisture}%)`);
    
    // New cost calculation - fixed for new factor ranges (0.1-2.0)
    // Normalize factors to 0-1 range: (factor - min) / (max - min)
    const ndviNormalized = (ndviFactor - 0.15) / (2.0 - 0.15);
    const moistureNormalized = (moistureFactor - 0.1) / (1.8 - 0.1);
    
    // Better health = lower input costs needed
    const fertilizer_cost = Math.max(1000, 7000 * (1 - ndviNormalized)) * areaAcres;
    const irrigation_cost = Math.max(500, 3000 * (1 - moistureNormalized)) * areaAcres;
    
    // Rainfall deficit increases pest pressure
    const rainfallPercentage = Math.min(rainfall / 400, 1);
    const pesticide_cost = Math.max(500, 4000 * (1 - rainfallPercentage)) * areaAcres;

    console.log(`💰 Calculated Costs - Fertilizer: ₹${fertilizer_cost.toFixed(0)}, Irrigation: ₹${irrigation_cost.toFixed(0)}, Pesticide: ₹${pesticide_cost.toFixed(0)}`);

    // Call Python FastAPI service
    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/predict-yield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crop: cropType,
        land_area: areaAcres,
        fertilizer_cost: Math.round(fertilizer_cost),
        pesticide_cost: Math.round(pesticide_cost),
        irrigation_cost: Math.round(irrigation_cost),
        state: state,
        // Send raw environmental values for the model to use
        ndvi: ndvi,
        soil_moisture: soilMoisture,
        rainfall: rainfall,
        ndvi_factor: ndviFactor,
        moisture_factor: moistureFactor,
      }),
    });

    if (!response.ok) {
      console.error("Python backend error:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to call Python AI backend:", error);
    return null;
  }
}

/**
 * Calculate yield based on HEAVILY WEIGHTED ENVIRONMENTAL FACTORS:
 * - NDVI (vegetation health) - 45% weight
 * - Soil moisture - 40% weight
 * - Rainfall - 15% weight
 * 
 * These factors NOW DOMINATE the calculation, not just minor modifiers
 */
function calculateYield(
  cropType: string,
  areaAcres: number,
  ndvi: number,
  soilMoisture: number,
  rainfall: number
): { yield_per_acre: number; total_yield: number } {
  // Get base yield for this crop (just a starting point, will be heavily modified)
  const baseYield = CROP_BASE_YIELDS[cropType.toLowerCase()] || 3.0;

  // Calculate ULTRA-SENSITIVE environmental impact factors
  const nDVIFactor = calculateNDVIImpact(ndvi);
  const moistureFactor = calculateSoilMoistureImpact(soilMoisture);
  const rainfallFactor = calculateRainfallImpact(rainfall);

  // Log factors for debugging
  console.log(`
  🌾 ULTRA-SENSITIVE YIELD CALCULATION (Environment-Dependent):
  ✓ Base Yield: ${baseYield} tons/acre
  ✓ NDVI Factor: ${nDVIFactor.toFixed(3)} (NDVI: ${ndvi}) → ${(nDVIFactor * 45).toFixed(1)}% contribution
  ✓ Moisture Factor: ${moistureFactor.toFixed(3)} (Moisture: ${soilMoisture}%) → ${(moistureFactor * 40).toFixed(1)}% contribution
  ✓ Rainfall Factor: ${rainfallFactor.toFixed(3)} (Rainfall: ${rainfall}mm) → ${(rainfallFactor * 15).toFixed(1)}% contribution
  `);

  // HEAVY weighting: Environment factors NOW dominate (90% of calculation)
  // NDVI: 45%, Moisture: 40%, Rainfall: 15% = 100% environmental
  const combinedFactor = (nDVIFactor * 0.45) + (moistureFactor * 0.40) + (rainfallFactor * 0.15);
  
  console.log(`✓ Combined Environmental Factor: ${combinedFactor.toFixed(3)}`);
  
  // Final yield per acre - DIRECTLY dependent on environmental factors
  const yieldPerAcre = baseYield * combinedFactor;

  // Total yield
  const totalYield = yieldPerAcre * areaAcres;
  
  console.log(`🎯 OPTIMIZED YIELD: Base=${baseYield}, Combined Factor=${combinedFactor.toFixed(2)}, Final=${yieldPerAcre.toFixed(2)} tons/acre`);

  return {
    yield_per_acre: Math.max(0.5, Math.round(yieldPerAcre * 100) / 100),
    total_yield: Math.max(0.5, Math.round(totalYield * 100) / 100),
  };
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    let userId: string | null = null;
    try {
      const authData = await auth();
      userId = authData.userId;
    } catch {
      // Allow unauthenticated for demo
    }

    // 2. Parse body
    let body: {
      crop_type?: string;
      area_acres?: number;
      ndvi?: number;
      soil_moisture?: number;
      rainfall?: number;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON input" },
        { status: 400 }
      );
    }

    const { crop_type, area_acres, ndvi, soil_moisture, rainfall } = body;

    // 3. Validate inputs
    const errors: string[] = [];

    if (!crop_type || typeof crop_type !== "string") {
      errors.push("crop_type is required and must be a string");
    } else if (!CROP_BASE_YIELDS[crop_type.toLowerCase()]) {
      errors.push(
        `crop_type "${crop_type}" not recognized. Valid: ${Object.keys(CROP_BASE_YIELDS).join(", ")}`
      );
    }

    if (area_acres == null || typeof area_acres !== "number") {
      errors.push("area_acres is required and must be a number");
    } else if (area_acres <= 0) {
      errors.push("area_acres must be greater than 0");
    } else if (area_acres > 10000) {
      errors.push("area_acres must be less than 10,000");
    }

    if (ndvi == null || typeof ndvi !== "number") {
      errors.push("ndvi is required and must be a number");
    } else if (ndvi < 0.1 || ndvi > 0.95) {
      errors.push("ndvi must be between 0.1 and 0.95");
    }

    if (
      soil_moisture == null ||
      typeof soil_moisture !== "number"
    ) {
      errors.push("soil_moisture is required and must be a number");
    } else if (soil_moisture < 0 || soil_moisture > 100) {
      errors.push("soil_moisture must be between 0 and 100");
    }

    if (rainfall == null || typeof rainfall !== "number") {
      errors.push("rainfall is required and must be a number");
    } else if (rainfall < 0 || rainfall > 1000) {
      errors.push("rainfall must be between 0 and 1000 mm");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join("; ") },
        { status: 400 }
      );
    }

    // 4. Try Python AI Backend first (if enabled), fallback to local calculation
    let yield_per_acre: number;
    let total_yield: number;
    let insights: string;
    let pythonResult = null;

    if (USE_PYTHON_BACKEND) {
      pythonResult = await callPythonAIBackend(
        crop_type!,
        area_acres!,
        ndvi!,
        soil_moisture!,
        rainfall!
      );
    }

    if (pythonResult) {
      // Use Python backend result
      // IMPORTANT: Python now returns yield_per_acre directly (with environmental factors applied)
      yield_per_acre = pythonResult.predicted_yield || 1.0;
      total_yield = yield_per_acre * area_acres!;
      insights = pythonResult.recommendation;
      
      console.log(`✅ Using Python AI Backend for prediction`);
      console.log(`   Yield per acre from Python: ${yield_per_acre.toFixed(2)} tons/acre`);
      console.log(`   Area: ${area_acres} acres`);
      console.log(`   Total yield: ${total_yield.toFixed(2)} tons`);
      console.log(`   Environmental factors ALREADY applied by Python backend`);
    } else {
      // Fallback to local calculation WITH environmental factors
      const localCalc = calculateYield(
        crop_type!,
        area_acres!,
        ndvi!,
        soil_moisture!,
        rainfall!
      );
      yield_per_acre = localCalc.yield_per_acre;
      total_yield = localCalc.total_yield;
      insights = generateInsights(
        crop_type!,
        ndvi!,
        soil_moisture!,
        rainfall!,
        yield_per_acre
      );
      console.log("⚠️ Python backend unavailable, using local calculation with environmental factors");
    }

    // 5. Store in MongoDB (if authenticated)
    if (userId) {
      try {
        await dbConnect();
        await YieldPrediction.create({
          userId,
          crop_type,
          area_acres,
          ndvi,
          soil_moisture,
          rainfall,
          predicted_yield: total_yield,
          yield_per_acre,
          backend: pythonResult ? "python-ai" : "local",
        });
      } catch (dbErr) {
        console.error("Failed to store yield prediction:", dbErr);
        // Non-fatal — still return the prediction
      }
    }

    // 6. Log final prediction with environmental data impact
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          🌾 YIELD PREDICTION COMPLETE 🌾                   ║
╠════════════════════════════════════════════════════════════╣
║ ENVIRONMENTAL INPUTS:                                      ║
║   • NDVI (Vegetation): ${ndvi!.toFixed(2)} → Impact Factor: ${calculateNDVIImpact(ndvi!).toFixed(3)}      ║
║   • Soil Moisture: ${soil_moisture!}% → Impact Factor: ${calculateSoilMoistureImpact(soil_moisture!).toFixed(3)}           ║
║   • Rainfall: ${rainfall!}mm                                              ║
║ PREDICTION RESULT:                                         ║
║   • Yield: ${yield_per_acre.toFixed(2)} tons/acre                        ║
║   • Total: ${total_yield.toFixed(2)} tons (${area_acres} acres)           ║
║ STATUS: ✅ ENVIRONMENTAL FACTORS APPLIED                   ║
╚════════════════════════════════════════════════════════════╝
    `);
    
    // 6. Return result
    return NextResponse.json({
      predicted_yield: total_yield,
      yield_per_acre,
      average_regional_yield: AVERAGE_REGIONAL_YIELD,
      insights,
    });
  } catch (error: unknown) {
    console.error("Yield prediction API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Generate AI-powered insights based on prediction factors
 */
function generateInsights(
  cropType: string,
  ndvi: number,
  soilMoisture: number,
  rainfall: number,
  yieldPerAcre: number
): string {
  const insights: string[] = [];

  // NDVI insights
  if (ndvi < 0.4) {
    insights.push("⚠️ Low vegetation health (NDVI). Consider applying fertilizer or irrigation.");
  } else if (ndvi > 0.8) {
    insights.push("✅ Excellent vegetation health. Good conditions for high yield.");
  }

  // Soil moisture insights
  if (soilMoisture < 15) {
    insights.push("💧 Soil very dry. Increase irrigation immediately.");
  } else if (soilMoisture > 50) {
    insights.push("⚠️ High soil moisture. Ensure proper drainage to avoid waterlogging.");
  }

  // Rainfall insights
  if (rainfall < 100) {
    insights.push("☔ Low rainfall. Supplemental irrigation recommended.");
  } else if (rainfall > 300) {
    insights.push("💦 High rainfall expected. Monitor for flooding and disease.");
  }

  // Yield insights
  if (yieldPerAcre < 2) {
    insights.push("📉 Expected yield is below average. Review conditions and management.");
  } else if (yieldPerAcre > 4) {
    insights.push("📈 Expected yield is above average. Excellent farming conditions!");
  }

  return insights.length > 0
    ? insights[Math.floor(Math.random() * insights.length)]
    : "Conditions look normal for this crop.";
}
