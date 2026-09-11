"use client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-24 min-h-screen bg-[#F7FDF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>
    </main>
  );
}
