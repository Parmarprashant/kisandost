import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { AgriProduct } from "@/models/AgriProduct";
import { analyzeCropDisease } from "@/lib/geminiService";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB limit. Please upload a smaller image." }, { status: 400 });
    }

    // 1. Send image to Google Gemini Vision API
    const geminiResult = await analyzeCropDisease(file);

    // 2. Connect to database to match recommended generic products to our actual marketplace DB
    await connectDB();
    
    // Helper function to search for products containing ANY of the generic keywords
    const matchProducts = async (genericNames: string[], category: "pesticide" | "fertilizer") => {
      if (!genericNames || genericNames.length === 0) return [];
      
      // Build a regex pattern from all recommended names
      const searchTerms = genericNames.map(name => name.split(' ')[0]); // Take first word for broader matching
      const regexPattern = new RegExp(searchTerms.join("|"), "i");
      
      const matchedProducts = await AgriProduct.find({
        category,
        $or: [
          { productName: { $regex: regexPattern } },
          { description: { $regex: regexPattern } },
          { usage: { $regex: regexPattern } }
        ]
      }).limit(2).lean();

      // If no exact matches found with regex, try returning top 2 default products for the category
      // This ensures the UI always has a "Buy Now" option even if Gemini recommends something obscure
      if (matchedProducts.length === 0) {
        return AgriProduct.find({ category }).limit(2).lean();
      }

      return matchedProducts;
    };

    const actualPesticides = await matchProducts(geminiResult.recommendedPesticides, "pesticide");
    const actualFertilizers = await matchProducts(geminiResult.recommendedFertilizers, "fertilizer");

    // Format for frontend
    const responseData = {
      ...geminiResult,
      recommendedPesticides: actualPesticides.map(p => ({
        name: p.productName,
        productId: p.productId,
        price: p.price,
        brand: p.brand
      })),
      recommendedFertilizers: actualFertilizers.map(f => ({
        name: f.productName,
        productId: f.productId,
        price: f.price,
        brand: f.brand
      })),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Gemini Disease Detection Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze crop image." }, 
      { status: 500 }
    );
  }
}

