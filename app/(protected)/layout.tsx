"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

const SESSION_DURATION = 20 * 60 * 1000;
const WARNING_TIME = 18 * 60 * 1000;
const AUTO_REFRESH_COOLDOWN = 30 * 1000;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRefreshRef = useRef(0);

  // ❗ WICHTIG: Login-Seite nicht schützen
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname === "/login") {
      return <main>{children}</main>;
    }
  }

  // 🔥 Session prüfen
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      renewSession();
    }

    checkSession();
  }, []);

  const renewSession = () => {
    setExpireAt(Date.now() + SESSION_DURATION);
    warningShownRef.current = false;
  };

  const forceLogout = async () => {
    await supabase.auth.signOut();
    toast.error("Sitzung abgelaufen");
    router.replace("/login");
  };

  // Timer
  useEffect(() => {
    if (!expireAt) return;

    intervalRef.current = setInterval(() => {
      const remaining = expireAt - Date.now();

      if (!warningShownRef.current && remaining <= WARNING_TIME) {
        warningShownRef.current = true;
        toast.warning("Ihre Sitzung läuft bald ab", {
          action: {
            label: "Verlängern",
            onClick: () => renewSession(),
          },
        });
      }

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        forceLogout();
      }
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [expireAt]);

  // Aktivität → verlängern
  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastActivityRefreshRef.current < AUTO_REFRESH_COOLDOWN) return;
      lastActivityRefreshRef.current = now;
      renewSession();
    };

    window.addEventListener("mousemove", refresh);
    window.addEventListener("keydown", refresh);

    return () => {
      window.removeEventListener("mousemove", refresh);
      window.removeEventListener("keydown", refresh);
    };
  }, []);

  return (
    <>
      <main>{children}</main>
      <Toaster position="top-right" richColors />
    </>
  );
}
