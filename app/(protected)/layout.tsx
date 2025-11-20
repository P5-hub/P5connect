"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

const SESSION_DURATION = 20 * 60 * 1000; // 20 Min
const WARNING_TIME = 18 * 60 * 1000;    // Warnung nach 18 Min
const AUTO_REFRESH_COOLDOWN = 30 * 1000; // alle 30 Sek max. erneuern

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRefreshRef = useRef(0);

  // ----------------------------------------------------
  // 🔵 Session erneuern (manuell oder automatisch)
  // ----------------------------------------------------
  const renewSession = () => {
    const newExpiry = Date.now() + SESSION_DURATION;
    setExpireAt(newExpiry);
    warningShownRef.current = false;

    toast.success("Sitzung verlängert");
  };

  // ----------------------------------------------------
  // 🟥 Harte Abmeldung
  // ----------------------------------------------------
  const forceLogout = async () => {
    await supabase.auth.signOut();
    toast.error("Sitzung abgelaufen");
    router.push("/login");
  };

  // ----------------------------------------------------
  // 🟧 Haupttimer (jede Sekunde prüfen)
  // ----------------------------------------------------
  useEffect(() => {
    // Sitzung starten
    renewSession();

    intervalRef.current = setInterval(() => {
      if (!expireAt) return;
      const now = Date.now();
      const remaining = expireAt - now;

      // ⚠️ Warnung bei 18 Min
      if (!warningShownRef.current && remaining <= SESSION_DURATION - WARNING_TIME) {
        warningShownRef.current = true;

        toast.warning("Ihre Sitzung läuft bald ab", {
          duration: 8000,
          description: "Klicken Sie, um die Sitzung zu verlängern.",
          action: {
            label: "Verlängern",
            onClick: () => renewSession(),
          },
        });
      }

      // ❌ Session abgelaufen
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        forceLogout();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expireAt]);

  // ----------------------------------------------------
  // 🌟 Auto-Extend bei User-Aktivität (Throttle 30s)
  // ----------------------------------------------------
  useEffect(() => {
    const refreshOnActivity = () => {
      const now = Date.now();
      if (now - lastActivityRefreshRef.current < AUTO_REFRESH_COOLDOWN) return; // Cooldown

      lastActivityRefreshRef.current = now;
      renewSession();
    };

    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
      "touchmove",
    ];

    events.forEach((ev) => window.addEventListener(ev, refreshOnActivity));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, refreshOnActivity));
    };
  }, []);

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <>
      <main>{children}</main>

      <Toaster
        position="top-right"
        richColors
        expand
        closeButton
        duration={2000}
      />

      {/* Optional: manuelle Verlängerung */}
      <button
        onClick={renewSession}
        className="
          fixed bottom-4 right-4 px-4 py-2 rounded-full
          bg-indigo-600 text-white shadow-lg shadow-indigo-500/30
          hover:bg-indigo-700 transition text-sm font-medium
        "
      >
        Sitzung verlängern
      </button>
    </>
  );
}
