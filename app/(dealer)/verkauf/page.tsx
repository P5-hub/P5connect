"use client";

import VerkaufForm from "@/components/forms/VerkaufForm";
import { BarChart3 } from "lucide-react";

export default function VerkaufPage() {
  return (
    <div className="space-y-6 pb-20">
      {/* 📊 Titel */}
      <h1 className="text-2xl font-bold flex items-center gap-2 text-green-600">
        <BarChart3 className="w-7 h-7" />
        Verkaufsdaten melden
      </h1>

      {/* Formular */}
      <VerkaufForm />
    </div>
  );
}
