import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { AgriProduct } from "@/models/AgriProduct";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    await connectDB();
    const product = await AgriProduct.findOne({ productId });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Marketplace fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
