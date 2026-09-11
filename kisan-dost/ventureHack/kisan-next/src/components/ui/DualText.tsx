"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface DualTextProps {
  native: string;
  english: string;
  className?: string;
  smallClassName?: string;
  forceDual?: boolean;
}

/**
 * DualText Component
 * Displays the native language text prominently.
 * If the current locale is not English, it displays the English translation in smaller text underneath.
 */
export function DualText({ 
  native, 
  english, 
  className, 
  smallClassName,
  forceDual = false 
}: DualTextProps) {
  const locale = useLocale();
  const isEnglish = locale === "en";

  if (isEnglish && !forceDual) {
    return <span className={className}>{native}</span>;
  }

  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span className="leading-tight">{native}</span>
      <span className={cn(
        "text-[0.6em] font-normal opacity-60 uppercase tracking-widest mt-0.5", 
        smallClassName
      )}>
        {english}
      </span>
    </span>
  );
}
