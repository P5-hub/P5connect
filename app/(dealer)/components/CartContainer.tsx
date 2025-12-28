"use client";

import { useCart } from "@/app/(dealer)/GlobalCartProvider";

// Warenkorb-Komponenten
import CartBestellung from "@/app/(dealer)/components/cart/CartBestellung";
import CartProjekt from "@/app/(dealer)/components/cart/CartProjekt";
import CartSupport from "@/app/(dealer)/components/cart/CartSupport";
import CartVerkauf from "@/app/(dealer)/components/cart/CartVerkauf";
import CartSofortrabatt from "@/app/(dealer)/components/cart/CartSofortrabatt";

export default function CartContainer() {
  const { state } = useCart();

  // Wenn kein Warenkorb geöffnet ist → nichts anzeigen
  if (!state.open) return null;

  // Richtigen Warenkorb je nach Formular rendern
  switch (state.currentForm) {
    case "bestellung":
      return <CartBestellung />;

    case "projekt":
      return <CartProjekt />;

    case "support":
      return <CartSupport />;

    case "verkauf":
      return <CartVerkauf />;

    case "sofortrabatt":
      return <CartSofortrabatt />;

    default:
      return null;
  }
}
