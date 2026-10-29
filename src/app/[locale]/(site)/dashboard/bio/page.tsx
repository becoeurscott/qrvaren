import type { Metadata } from "next";
import { PageDashboard, type DashboardQuery } from "@/modules/cards/interface/PageDashboard";

export const metadata: Metadata = { robots: { index: false } };

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<DashboardQuery> };

export default async function BioDashboardPage({ params, searchParams }: Props) {
  return <PageDashboard kind="bio" locale={(await params).locale} q={await searchParams} />;
}
