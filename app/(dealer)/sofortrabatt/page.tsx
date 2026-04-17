import SofortrabattClient from "./SofortrabattClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SofortrabattPage() {
  return <SofortrabattClient />;
}