"use server";

import dbConnect from "@/lib/mongodb";
import FarmCalculation from "@/models/FarmCalculation";
import User from "@/models/User";

export async function saveCalculation(data: {
  userId: string;
  crop: string;
  areaAcres: number;
  soilType: string;
  npkDosings: object;
  totalBags: number;
  costEstimate: number;
}) {
  await dbConnect();
  
  try {
    // Find mongo user by clerkId
    const user = await User.findOne({ clerkId: data.userId });
    if (!user) {
      throw new Error("User not found in DB");
    }

    const payload = { ...data, userId: user._id };
    await FarmCalculation.create(payload);
  } catch (error) {
    console.error("Error saving calculation data", error);
    throw new Error("Failed to save calculation");
  }
}
