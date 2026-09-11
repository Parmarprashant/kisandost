"use client";

import { WeatherProvider } from "@/context/WeatherContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";

export function ClientProviders({ children }: { children: React.ReactNode }) {
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
