"use client";

import { createContext, useContext } from "react";

type DealerContextType = {
  dealer: any | null;
  isAdmin: boolean;
  impersonating: boolean;
};

const DealerContext = createContext<DealerContextType | undefined>(undefined);

export function DealerProvider({
  dealer,
  isAdmin = false,
  impersonating = false,
  children,
}: {
  dealer: any | null;
  isAdmin?: boolean;
  impersonating?: boolean;
  children: React.ReactNode;
}) {
  return (
    <DealerContext.Provider value={{ dealer, isAdmin, impersonating }}>
      {children}
    </DealerContext.Provider>
  );
}

export function useDealer() {
  const ctx = useContext(DealerContext);

  if (!ctx) {
    throw new Error("useDealer must be used within DealerProvider");
  }

  return ctx.dealer;
}

export function useActiveDealer() {
  const ctx = useContext(DealerContext);

  if (!ctx) {
    throw new Error("useActiveDealer must be used within DealerProvider");
  }

  return ctx.dealer;
}

export function useDealerMeta() {
  const ctx = useContext(DealerContext);

  if (!ctx) {
    throw new Error("useDealerMeta must be used within DealerProvider");
  }

  return {
    isAdmin: ctx.isAdmin,
    impersonating: ctx.impersonating,
  };
}