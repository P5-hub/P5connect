"use client";

import { useState } from "react";
import { DealerProvider, Dealer } from "./DealerContext";

export default function DealerClientWrapper({
  dealer,
  children,
}: {
  dealer: Dealer | null;
  children: React.ReactNode;
}) {
  // setDealer entsteht IM CLIENT → Next.js erlaubt das
  const [currentDealer, setCurrentDealer] = useState<Dealer | null>(dealer);

  return (
    <DealerProvider dealer={currentDealer} setDealer={setCurrentDealer}>
      {children}
    </DealerProvider>
  );
}