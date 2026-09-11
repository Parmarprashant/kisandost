import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CropAdvisory } from '@/models/CropAdvisory';

export async function GET() {
  try {
    await connectDB();

    const advisories = [
      // COTTON
      {
        cropType: "cotton",
        stageName: "Seedling Stage",
        daysAfterSowingStart: 0,
        daysAfterSowingEnd: 15,
        pesticideName: "Thiamethoxam 25% WG",
        dosagePerAcre: 40,
        purpose: "To control early sucking pests like Jassids and Aphids.",
        messageTemplate: "KisanDost Alert: Your cotton is in the Seedling phase. Spray {{dosage}}g of {{pesticide}} to protect against Jassids."
      },
      {
        cropType: "cotton",
        stageName: "Vegetative Stage",
        daysAfterSowingStart: 16,
        daysAfterSowingEnd: 45,
        pesticideName: "Imidacloprid 17.8% SL",
        dosagePerAcre: 80,
        purpose: "Dose to control Whiteflies and Thrips.",
        messageTemplate: "KisanDost Alert: Protect your vegetative cotton! Spray {{dosage}}ml of {{pesticide}} today."
      },
      {
        cropType: "cotton",
        stageName: "Square Formation",
        daysAfterSowingStart: 46,
        daysAfterSowingEnd: 75,
        pesticideName: "Spinosad 45% SC",
        dosagePerAcre: 75,
        purpose: "To control Bollworms.",
        messageTemplate: "KisanDost Alert: Cotton is entering square formation. Spray {{dosage}}ml {{pesticide}} to prevent Bollworm damage."
      },
      // WHEAT
      {
        cropType: "wheat",
        stageName: "Crown Root Initiation",
        daysAfterSowingStart: 21,
        daysAfterSowingEnd: 25,
        pesticideName: "Pendimethalin 30% EC",
        dosagePerAcre: 400,
        purpose: "Pre-emergence weed control. 1st Irrigation.",
        messageTemplate: "KisanDost Alert: Wheat CRI stage. Apply {{dosage}}ml {{pesticide}} to control weeds and start irrigation."
      },
      {
        cropType: "wheat",
        stageName: "Tillering Stage",
        daysAfterSowingStart: 40,
        daysAfterSowingEnd: 55,
        pesticideName: "Tebuconazole 25.9% EC",
        dosagePerAcre: 250,
        purpose: "Preventative action against Yellow Rust.",
        messageTemplate: "KisanDost Alert: Wheat tillering has begun. Prevent rust with {{dosage}}ml {{pesticide}}."
      },
      // RICE
      {
        cropType: "rice",
        stageName: "Nursery Stage",
        daysAfterSowingStart: 0,
        daysAfterSowingEnd: 20,
        pesticideName: "Pretilachlor 50% EC",
        dosagePerAcre: 600,
        purpose: "Control of annual grasses and sedges in rice nursery.",
        messageTemplate: "KisanDost Alert: Your rice nursery needs protection. Spray {{dosage}}ml {{pesticide}} for weed control."
      },
      {
        cropType: "rice",
        stageName: "Tillering Phase",
        daysAfterSowingStart: 41,
        daysAfterSowingEnd: 60,
        pesticideName: "Cartap Hydrochloride 4G",
        dosagePerAcre: 750,
        purpose: "To control Stem Borer and Leaf Folder.",
        messageTemplate: "KisanDost Alert: Rice is in active tillering. Use {{dosage}}g {{pesticide}} to prevent Stem Borer damage."
      },
      // TOMATO
      {
        cropType: "tomato",
        stageName: "Vegetative Growth",
        daysAfterSowingStart: 0,
        daysAfterSowingEnd: 25,
        pesticideName: "Dimethoate 30% EC",
        dosagePerAcre: 200,
        purpose: "To control Aphids and Thrips.",
        messageTemplate: "KisanDost Alert: Early growth in Tomato. Spray {{dosage}}ml {{pesticide}} to keep your plants pest-free."
      },
      {
        cropType: "tomato",
        stageName: "Flowering & Fruit Set",
        daysAfterSowingStart: 30,
        daysAfterSowingEnd: 60,
        pesticideName: "Lambda-cyhalothrin 5% EC",
        dosagePerAcre: 150,
        purpose: "To control Fruit Borer.",
        messageTemplate: "KisanDost Alert: Tomato flowering stage. Protect fruit with {{dosage}}ml {{pesticide}}."
      },
      // MAIZE
      {
        cropType: "maize",
        stageName: "Knee-High Stage",
        daysAfterSowingStart: 15,
        daysAfterSowingEnd: 35,
        pesticideName: "Atrazine 50% WP",
        dosagePerAcre: 500,
        purpose: "Broadleaf weed control.",
        messageTemplate: "KisanDost Alert: Maize is knee-high. Apply {{dosage}}g {{pesticide}} for effective weed management."
      },
      // POTATO
      {
        cropType: "potato",
        stageName: "Tuber Initiation",
        daysAfterSowingStart: 25,
        daysAfterSowingEnd: 45,
        pesticideName: "Mancozeb 75% WP",
        dosagePerAcre: 800,
        purpose: "Preventative control for Early and Late Blight.",
        messageTemplate: "KisanDost Alert: Potato tuber initiation. Spray {{dosage}}g {{pesticide}} to prevent Blight diseases."
      }
    ];

    // Clear existing to avoid overlap
    const cropTypes = [...new Set(advisories.map(a => a.cropType))];
    await CropAdvisory.deleteMany({ cropType: { $in: cropTypes } });

    // Seed the DB
    await CropAdvisory.insertMany(advisories);

    return NextResponse.json({ 
      success: true,
      message: `Database seeded successfully with ${advisories.length} advisories for ${cropTypes.join(", ")}.` 
    });
  } catch (error: any) {
    console.error("Failed to seed DB:", error);
    return NextResponse.json({ error: "DB Seeding failed" }, { status: 500 });
  }
}
