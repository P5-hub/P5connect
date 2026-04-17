import VerkaufClient from "./VerkaufClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function VerkaufPage() {
  return <VerkaufClient />;
}