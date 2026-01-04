"use client";

import { useEffect } from "react";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

type Props = {
  items: any[];
};

export default function ProjectToCartClient({ items }: Props) {
  const { clearCart, addItem, openCart, setProjectDetails } = useCart();

  useEffect(() => {
    if (!items || items.length === 0) return;

    // Cart leeren
    clearCart("bestellung");

    // Projekt-Metadaten (minimal)
    type ProjectDetails = {
      submission_id: number;   // 🔴 PFLICHTFELD
      project_id?: string;
      project_name?: string | null;
      customer?: string | null;
    };

    // Items ins Cart
    for (const item of items) {
      addItem("bestellung", {
        product_id: item.product_id,
        product_name: item.product_name,
        ean: item.ean,
        quantity: item.menge,
        price: item.preis,
        project_id: item.project_id,
        __origin: "project",
      });
    }

    // Cart öffnen
    openCart("bestellung");
  }, []);

  return null;
}
