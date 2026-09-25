"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useSyncExternalStore } from "react";
import { Languages, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function LanguageSwitcher() {
  const hasMounted = useHasMounted();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string | null) => {
    if (newLocale) {
      if (typeof document !== "undefined") {
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        try {
          localStorage.setItem("kisan_locale", newLocale);
        } catch {}
      }
      router.replace(pathname, { locale: newLocale });
      router.refresh();
    }
  };

  if (!hasMounted) {
    return <div className="w-[100px] h-8 bg-background/50 border border-primary/20 rounded-lg animate-pulse" />;
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="flex items-center gap-2 w-auto h-10 px-4 text-sm font-bold border-[#2e6b3b]/20 bg-[#2e6b3b]/5 text-[#2e6b3b] rounded-full hover:bg-[#2e6b3b]/10 hover:border-[#2e6b3b]/40 transition-all focus:ring-0 focus:ring-offset-0 ring-0 shadow-sm">
        <Languages className="w-4 h-4 opacity-70" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent 
        alignItemWithTrigger={false}
        align="end"
        className="rounded-2xl border-border/50 shadow-2xl p-2 min-w-[160px] bg-white/95 backdrop-blur-md"
      >
        <SelectItem 
          value="en" 
          className="rounded-xl flex items-center gap-3 py-3 px-3 focus:bg-[#2e6b3b]/10 focus:text-[#2e6b3b] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">English</span>
          </div>
        </SelectItem>
        <SelectItem 
          value="hi" 
          className="rounded-xl flex items-center gap-3 py-3 px-3 focus:bg-[#2e6b3b]/10 focus:text-[#2e6b3b] cursor-pointer transition-colors pr-8"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">हिंदी</span>
            <span className="text-xs text-muted-foreground font-medium">(Hindi)</span>
          </div>
        </SelectItem>
        <SelectItem 
          value="gu" 
          className="rounded-xl flex items-center gap-3 py-3 px-3 focus:bg-[#2e6b3b]/10 focus:text-[#2e6b3b] cursor-pointer transition-colors pr-8"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">ગુજરાતી</span>
            <span className="text-xs text-muted-foreground font-medium">(Gujarati)</span>
          </div>
        </SelectItem>
        <SelectItem 
          value="mr" 
          className="rounded-xl flex items-center gap-3 py-3 px-3 focus:bg-[#2e6b3b]/10 focus:text-[#2e6b3b] cursor-pointer transition-colors pr-8"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">मराठी</span>
            <span className="text-xs text-muted-foreground font-medium">(Marathi)</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
