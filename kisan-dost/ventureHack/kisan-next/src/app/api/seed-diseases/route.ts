import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { CropDisease } from "@/models/CropDisease";
import { AgriProduct } from "@/models/AgriProduct";

export async function GET() {
  try {
    await connectDB();

    // 1. Seed Agri Products (Marketplace)
    const initialProducts = [
      {
        productId: "PST102",
        productName: "Chlorothalonil 75% WP",
        category: "pesticide",
        price: 450,
        brand: "Bayer",
        description: "A broad-spectrum organochlorine fungicide used to control foliar diseases on vegetables.",
        usage: "Mix 2g per liter of water. Spray evenly on affected foliage every 7-10 days."
      },
      {
        productId: "PST103",
        productName: "Mancozeb 75% WP",
        category: "pesticide",
        price: 320,
        brand: "Syngenta",
        description: "Excellent contact fungicide highly effective against Late Blight in potato and tomato.",
        usage: "2.5g per liter of water. Apply preventatively."
      },
      {
        productId: "PST104",
        productName: "Copper Oxychloride 50% WP",
        category: "pesticide",
        price: 380,
        brand: "Tata Rallis",
        description: "A powerful preventive copper bactericide and fungicide.",
        usage: "3g per liter of water. Best against bacterial leaf blight."
      },
      {
        productId: "PST105",
        productName: "Propiconazole 25% EC",
        category: "pesticide",
        price: 550,
        brand: "UPL",
        description: "Systemic fungicide with broad range activity, particularly effective on rusts.",
        usage: "1ml per liter of water. Spray at symptom onset."
      },
      {
        productId: "FRT210",
        productName: "Potassium Sulfate (SOP)",
        category: "fertilizer",
        price: 950,
        brand: "IFFCO",
        description: "Premium source of potassium and sulfur to boost disease resistance.",
        usage: "Apply 50kg per acre during flowering stage."
      },
      {
        productId: "FRT212",
        productName: "Zinc Sulfate Monohydrate",
        category: "fertilizer",
        price: 450,
        brand: "Coromandel",
        description: "Essential trace mineral to recover from bacterial stress.",
        usage: "Foliar spray: 5g per liter of water."
      },
      {
        productId: "FRT213",
        productName: "NPK 19-19-19 Balanced",
        category: "fertilizer",
        price: 1800,
        brand: "Mahadhan",
        description: "100% Water soluble balanced NPK for overall healthy crop recovery.",
        usage: "5g per liter of water for foliar application."
      }
    ];

    for (const p of initialProducts) {
      await AgriProduct.findOneAndUpdate({ productId: p.productId }, p, { upsert: true });
    }

    // 2. Seed Crop Diseases
    const initialDiseases = [
      {
        cropName: "tomato",
        diseaseName: "Tomato Early Blight",
        description: "A common fungal disease caused by Alternaria solani, producing dark concentric spots on older leaves.",
        symptoms: [
          "Dark brown to black spots with concentric rings on older leaves.",
          "Yellowing (chlorosis) around the spots.",
          "Defoliation starting from the bottom of the plant."
        ],
        precautions: [
          "Remove and destroy infected leaves immediately",
          "Avoid overhead watering; use drip irrigation",
          "Space plants properly to improve air circulation",
          "Rotate crops every season"
        ],
        recommendedPesticides: [{ name: "Chlorothalonil 75% WP", productId: "PST102" }],
        recommendedFertilizers: [{ name: "Potassium Sulfate", productId: "FRT210" }]
      },
      {
        cropName: "rice",
        diseaseName: "Rice Bacterial Leaf Blight",
        description: "Caused by Xanthomonas oryzae; causes water-soaked lesions that turn yellow then white along leaf margins.",
        symptoms: [
          "Water-soaked to yellowish stripes on leaf blades.",
          "Lesions start from the tip and extend downwards.",
          "Leaves wilt and roll up, turning grayish-white."
        ],
        precautions: [
          "Avoid excess nitrogen fertilizer application",
          "Drain fields periodically to reduce humidity",
          "Use certified disease-free seeds next season",
          "Keep fields free of weeds"
        ],
        recommendedPesticides: [{ name: "Copper Oxychloride 50% WP", productId: "PST104" }],
        recommendedFertilizers: [{ name: "Zinc Sulfate", productId: "FRT212" }]
      },
      {
        cropName: "wheat",
        diseaseName: "Wheat Stem Rust",
        description: "Puccinia graminis causes reddish-brown elongated pustules on leaves and stems, severely reducing grain yield.",
        symptoms: [
          "Brick-red elongated blister-like pustules on stems and leaf sheaths.",
          "Pustules rupture the epidermal tissue.",
          "Infected stems may lodge (fall over) easily."
        ],
        precautions: [
          "Grow verified rust-resistant wheat varieties",
          "Sow at recommended dates to avoid peak infection window",
          "Destroy volunteer wheat and alternate hosts in off-season"
        ],
        recommendedPesticides: [{ name: "Propiconazole 25% EC", productId: "PST105" }],
        recommendedFertilizers: [{ name: "NPK 19-19-19 Balanced", productId: "FRT213" }]
      }
    ];

    for (const d of initialDiseases) {
      await CropDisease.findOneAndUpdate({ diseaseName: d.diseaseName }, d, { upsert: true });
    }

    return NextResponse.json({
      message: "Successfully seeded diseases and marketplace products.",
      productsCount: initialProducts.length,
      diseaseCount: initialDiseases.length
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
