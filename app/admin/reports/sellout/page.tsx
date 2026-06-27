import SelloutDashboardClient from "./SelloutDashboardClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function SelloutDashboardPage() {
  return <SelloutDashboardClient />;
}