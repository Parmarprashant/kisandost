import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
// import { ClerkProvider } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ClientProviders } from "@/components/layout/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KisanDost - Digital Companion for Farmers",
  description: "Crop health, fertilizer calculator, and NDVI tracking for farmers in India.",
  manifest: "/manifest.json",
  icons: {
    icon: "/kisanDost-logo.png",
    apple: "/kisanDost-logo.png"
  }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  const messages = await getMessages();

  return (
    <AuthProvider>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ClientProviders>
              <main>{children}</main>
            </ClientProviders>
          </NextIntlClientProvider>
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
