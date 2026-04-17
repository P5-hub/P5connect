import { SupportCartProvider } from "@/app/(dealer)/components/SupportCartContext";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SupportPage() {
  return (
    <SupportCartProvider>
      <SupportClient />
    </SupportCartProvider>
  );
}