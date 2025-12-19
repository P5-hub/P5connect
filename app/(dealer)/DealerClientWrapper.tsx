"use client";

import { useState } from "react";
import { DealerProvider } from "./DealerContext";
import type { Dealer } from "@/types/Dealer";

export default function DealerClientWrapper({
  dealer,
  children,
}: {
  dealer: Dealer | null;
  children: React.ReactNode;
}) {
  const [currentDealer] = useState<Dealer | null>(dealer);

  return (
    <DealerProvider dealer={currentDealer}>
      {children}
    </DealerProvider>
  );
}
