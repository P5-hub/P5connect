"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const supabase = getSupabaseBrowser();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("❌ Fehler beim Abrufen des Benutzers:", userError);
        router.push("/login");
        return;
      }

      if (!user?.email) {
        console.warn("⚠️ Noch kein Benutzer eingeloggt – leite zur Login-Seite um.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("dealers")
        .select("role")
        .eq("login_email", user.email)
        .maybeSingle();

      if (error) {
        console.error("❌ Supabase-Fehler beim Händler-Check:", error);
        router.push("/login");
        return;
      }

      if (!data) {
        console.warn("⚠️ Kein Händler/Admin gefunden – eventuell neuer Benutzer.");
        router.push("/login");
        return;
      }

      const role = (data as any).role ?? null;

      if (role === "admin") {
        router.push("/admin/bestellungen");
      } else {
        router.push("/bestellung");
      }
    };

    checkRole();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50 text-gray-700">
      {/* 🌀 Spinner */}
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Lade Benutzerrolle...</p>
    </div>
  );
}
