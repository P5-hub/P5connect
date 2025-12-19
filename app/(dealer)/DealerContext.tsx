  "use client";

  import { createContext, useContext } from "react";

  type DealerContextType = {
    dealer: any | null;
    isAdmin: boolean;
    impersonating: boolean;
  };

  /* ✅ Default Context (wichtig!) */
  const DealerContext = createContext<DealerContextType>({
    dealer: null,
    isAdmin: false,
    impersonating: false,
  });

  /** ✅ Provider mit OPTIONALEN Props */
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

  /** Hooks */
  export function useDealer() {
    return useContext(DealerContext).dealer;
  }

  export function useActiveDealer() {
    return useContext(DealerContext).dealer;
  }

  export function useDealerMeta() {
    const ctx = useContext(DealerContext);
    return {
      isAdmin: ctx.isAdmin,
      impersonating: ctx.impersonating,
    };
  }
