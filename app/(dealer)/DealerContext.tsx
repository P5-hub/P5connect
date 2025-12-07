"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

export type Dealer = {
  dealer_id: number;
  login_nr: string;
  store_name?: string | null;
  company_name?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
};

type DealerContextState = {
  dealer: Dealer | null;
  setDealer: (d: Dealer | null) => void;
};

const DealerContext = createContext<DealerContextState | null>(null);

export function DealerProvider({
  children,
  dealer,
  setDealer,
}: {
  children: ReactNode;
  dealer: Dealer | null;
  setDealer: (d: Dealer | null) => void;
}) {
  return (
    <DealerContext.Provider
      value={{
        dealer,
        setDealer,
      }}
    >
      {children}
    </DealerContext.Provider>
  );
}

export function useDealer() {
  const ctx = useContext(DealerContext);
  if (!ctx) throw new Error("useDealer must be used inside DealerProvider");
  return ctx.dealer;
}

export function useDealerSetter() {
  const ctx = useContext(DealerContext);
  if (!ctx) throw new Error("useDealerSetter must be used inside DealerProvider");
  return ctx.setDealer;
}
