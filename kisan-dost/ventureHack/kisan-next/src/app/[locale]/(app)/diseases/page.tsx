import { redirect } from "@/i18n/routing";

export default async function DiseasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/dashboard/disease-detector", locale: locale as any });
}
