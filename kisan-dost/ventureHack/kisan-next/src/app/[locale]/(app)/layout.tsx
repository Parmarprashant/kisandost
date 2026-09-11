import AppLayout from "@/components/layout/AppLayout";

export default function RootAppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
