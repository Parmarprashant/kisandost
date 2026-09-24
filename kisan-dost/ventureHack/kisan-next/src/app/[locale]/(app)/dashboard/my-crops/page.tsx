"use client";

import { useTranslations } from "next-intl";
import { Sprout } from "lucide-react";

export default function MyCropsPage() {
  const t = useTranslations("Dashboard");

  return (
    <div className="container mx-auto py-12 px-4 mt-20 min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 mb-4">
        <Sprout className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
        {t("myCrops") || "My Crops"}
      </h1>
      <p className="text-muted-foreground max-w-md">
        This section is currently under maintenance.
      </p>
    </div>
  );
  
}
