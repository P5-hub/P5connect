"use client";

import BestellungForm from "@/components/forms/BestellungForm";
import { ShoppingCart } from "lucide-react";

export default function BestellungPage() {
  return (
    <div className="space-y-6 pb-20">
      {/* 🛒 Titel */}
      <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
        <ShoppingCart className="w-7 h-7" />
        Bestellung zum Bestpreis
      </h1>

      {/* Formular */}
      <BestellungForm />
    </div>
  );
}
