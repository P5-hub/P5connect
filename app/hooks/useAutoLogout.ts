"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function useAutoLogout(timeoutMinutes: number = 20) {
  const router = useRouter();
  const supabase = createClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Timer löschen
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = timeoutMs - 60 * 1000; // 1 Minute vorher

    // Warnung nach X Minuten
    warningRef.current = setTimeout(() => {
      console.warn("⚠️ Session läuft in 1 Minute ab (Inaktivität)");
    }, warningMs);

    // Logout nach Inaktivität
    timerRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, timeoutMs);
  };

  useEffect(() => {
    // Timer beim Start setzen
    resetTimer();

    // Jede Aktivität → Timer zurücksetzen
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, resetTimer)
      );
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, []);
}
