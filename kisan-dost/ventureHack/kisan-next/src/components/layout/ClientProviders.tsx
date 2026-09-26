"use client";

import { WeatherProvider } from "@/context/WeatherContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { usePathname } from "@/i18n/routing";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth" || pathname?.startsWith("/auth");

  if (isAuthPage) {
    return (
      <WeatherProvider>
        <div className="min-h-screen">
          {children}
        </div>
      </WeatherProvider>
    );
  }

  return (
    <WeatherProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <ChatWidget />
      </div>
    </WeatherProvider>
  );
}
