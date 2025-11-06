"use client";

import SupportForm from "@/components/forms/SupportForm";
import { LifeBuoy } from "lucide-react";
import { getThemeByForm } from "@/lib/theme/ThemeContext"; // ✅ hinzufügen

export default function SupportPage() {
  const theme = getThemeByForm("support"); // ✅ dynamische Farbe ziehen

  return (
    <div className="space-y-6 pb-20">
      <h1 className={`text-2xl font-bold flex items-center gap-2 ${theme.color}`}>
        <LifeBuoy className="w-7 h-7" />
        Support-Anfrage
      </h1>

      <SupportForm />
    </div>
  );
}
