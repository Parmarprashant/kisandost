"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, ShieldCheck, Tag, Box, Info, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Product {
  productId: string;
  productName: string;
  category: "pesticide" | "fertilizer";
  price: number;
  brand: string;
  description: string;
  usage: string;
  stock: number;
}

export default function MarketplaceProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/marketplace/${productId}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse p-4">
        <Skeleton className="h-10 text-xl w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found.</h2>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FDF9] dark:bg-background pb-20">
      <div className="bg-emerald-900 border-b border-emerald-800 text-white pt-8 pb-32 px-4 shadow-lg shadow-emerald-900/10 dark:shadow-none">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-emerald-100 hover:text-white hover:bg-emerald-800/50 mb-6 -ml-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2 mb-4">
            <Badge className="bg-emerald-700 hover:bg-emerald-600 text-white border-0">
              {product.category === "pesticide" ? "Pesticide" : "Fertilizer"}
            </Badge>
            <Badge variant="outline" className="text-emerald-100 border-emerald-700 bg-emerald-800/50">
              <ShieldCheck className="w-3 h-3 mr-1" /> Original Product
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">{product.productName}</h1>
          <p className="text-xl text-emerald-200 font-medium tracking-wide">by {product.brand}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24">
        <div className="bg-white dark:bg-card rounded-3xl shadow-2xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden lg:flex divide-y lg:divide-y-0 lg:divide-x divide-emerald-50">
          
          <div className="p-8 lg:p-12 lg:w-2/3 space-y-10">
            <div>
              <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-emerald-600" /> Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" /> Usage Instructions
              </h3>
              <div className="bg-emerald-50 text-emerald-900 p-5 rounded-xl border border-emerald-100 font-medium">
                {product.usage}
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 lg:w-1/3 bg-gray-50/50 dark:bg-muted/10 space-y-8 flex flex-col justify-center">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Tag className="w-4 h-4" /> Price
              </p>
              <p className="text-5xl font-black text-emerald-700">₹{product.price}</p>
              <p className="text-xs text-muted-foreground mt-2">Inclusive of all taxes</p>
            </div>

            <div className="pt-4 border-t border-emerald-100">
              <p className="flex items-center gap-2 text-sm font-medium mb-4">
                <Box className="w-4 h-4 text-emerald-600" />
                {product.stock > 0 
                  ? <span className="text-emerald-700">In Stock ({product.stock} units)</span> 
                  : <span className="text-red-500">Out of Stock</span>}
              </p>
              <Button 
                className="w-full h-14 text-lg font-bold shadow-xl shadow-emerald-200/50" 
                size="lg"
                disabled={product.stock === 0}
                onClick={() => toast.success("Added to cart! (Demo)")}
              >
                <ShoppingCart className="w-5 h-5 mr-3" /> Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
