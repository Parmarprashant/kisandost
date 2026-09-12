import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { AgriProduct } from "@/models/AgriProduct";
import { analyzeWithAgriVision } from "@/lib/agriVisionService";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** Try to match products from DB; on any timeout/error return empty array silently */
async function matchProducts(
  genericNames: string[],
  category: "pesticide" | "fertilizer"
): Promise<{ name: string; productId: string; price: number; brand: string }[]> {
  if (!genericNames || genericNames.length === 0) return [];

  try {
    // Wrap DB ops in a race vs 8-second timeout so slow Atlas doesn't block results
    const dbTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), 8000)
    );

    const dbWork = (async () => {
      await connectDB();
      const searchTerms = genericNames.map((name) => name.split(" ")[0]);
      const regexPattern = new RegExp(searchTerms.join("|"), "i");

      const matched = await AgriProduct.find({
        category,
        $or: [
          { productName: { $regex: regexPattern } },
          { description: { $regex: regexPattern } },
          { usage: { $regex: regexPattern } },
        ],
      })
        .limit(2)
        .lean();

      if (matched.length === 0) {
        return AgriProduct.find({ category }).limit(2).lean();
      }
      return matched;
    })();

    const products = await Promise.race([dbWork, dbTimeout]) as any[];
    return products.map((p: any) => ({
      name: p.productName,
      productId: p.productId,
      price: p.price,
      brand: p.brand,
    }));
  } catch (err: any) {
    console.warn(`[detect-disease] Product matching skipped (${err.message})`);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    // 1. Send image to AgriVision AI pipeline (primary operation)
    const agriResult = await analyzeWithAgriVision(file);

    // 2. Optionally match marketplace products (non-blocking - fails gracefully)
    const [actualPesticides, actualFertilizers] = await Promise.all([
      matchProducts(agriResult.recommendedPesticides, "pesticide"),
      matchProducts(agriResult.recommendedFertilizers, "fertilizer"),
    ]);

    // 3. Build final response
    const responseData = {
      ...agriResult,
      recommendedPesticides: actualPesticides.length > 0
        ? actualPesticides
        : agriResult.recommendedPesticides.map((name) => ({ name, productId: null, price: null, brand: null })),
      recommendedFertilizers: actualFertilizers.length > 0
        ? actualFertilizers
        : agriResult.recommendedFertilizers.map((name) => ({ name, productId: null, price: null, brand: null })),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("AgriVision Disease Detection Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze crop image." },
      { status: 500 }
    );
  }
}
