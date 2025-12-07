"use client";

import { useCart } from "@/app/(dealer)/GlobalCartProvider";

// Die 4 Warenkorb-Komponenten:
import CartBestellung from "@/app/(dealer)/components/cart/CartBestellung";
import CartProjekt from "@/app/(dealer)/components/cart/CartProjekt";
import CartSupport from "@/app/(dealer)/components/cart/CartSupport";
import CartVerkauf from "@/app/(dealer)/components/cart/CartVerkauf";

export default function CartContainer() {
  const { state } = useCart();

  // Wenn kein Warenkorb geöffnet ist → nichts anzeigen
  if (!state.open) return null;

  // Rendert den richtigen Warenkorb je nach Formular
  switch (state.currentForm) {
    case "bestellung":
      return <CartBestellung />;

    case "projekt":
      return <CartProjekt />;

    case "support":
      return <CartSupport />;

    case "verkauf":
      return <CartVerkauf />;

    default:
      return null;
  }
}
