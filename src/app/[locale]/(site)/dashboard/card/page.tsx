import type { Metadata } from "next";
import { PageDashboard, type DashboardQuery } from "@/modules/cards/interface/PageDashboard";

export const metadata: Metadata = { robots: { index: false } };

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<DashboardQuery> };

export default async function CardDashboardPage({ params, searchParams }: Props) {
  return <PageDashboard kind="card" locale={(await params).locale} q={await searchParams} />;
}
