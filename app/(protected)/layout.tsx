"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

const SESSION_DURATION = 20 * 60 * 1000; // 20 Minuten Inaktivität
const WARNING_BEFORE_EXPIRY = 2 * 60 * 1000; // 2 Minuten vor Ablauf warnen
const AUTO_REFRESH_COOLDOWN = 30 * 1000; // max. alle 30s verlängern

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const warningShownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRefreshRef = useRef(0);

  const isLoginPage = pathname === "/login";

  const renewSession = async () => {
    // Optional: echte Session nochmals prüfen
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      await forceLogout(false);
      return;
    }

    setExpireAt(Date.now() + SESSION_DURATION);
    warningShownRef.current = false;
  };

  const forceLogout = async (showToast = true) => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorieren, Redirect soll trotzdem erfolgen
    }

    if (showToast) {
      toast.error("Sitzung abgelaufen");
    }

    router.replace("/login");
  };

  // Login-Seite nicht schützen
  useEffect(() => {
    if (isLoginPage) return;

    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      setExpireAt(Date.now() + SESSION_DURATION);
      warningShownRef.current = false;
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [isLoginPage, router, supabase]);

  // Timer verwalten
  useEffect(() => {
    if (isLoginPage || !expireAt) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const remaining = expireAt - Date.now();

      if (
        !warningShownRef.current &&
        remaining > 0 &&
        remaining <= WARNING_BEFORE_EXPIRY
      ) {
        warningShownRef.current = true;

        toast.warning("Ihre Sitzung läuft bald ab", {
          action: {
            label: "Verlängern",
            onClick: () => {
              renewSession();
            },
          },
        });
      }

      if (remaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        forceLogout();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expireAt, isLoginPage]);

  // Benutzeraktivität => lokalen Inaktivitäts-Timer verlängern
  useEffect(() => {
    if (isLoginPage) return;

    const refresh = () => {
      const now = Date.now();

      if (now - lastActivityRefreshRef.current < AUTO_REFRESH_COOLDOWN) return;

      lastActivityRefreshRef.current = now;
      renewSession();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) =>
      window.addEventListener(event, refresh, { passive: true })
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, refresh)
      );
    };
  }, [isLoginPage]);

  // Reaktion auf Auth-Änderungen
  useEffect(() => {
    if (isLoginPage) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setExpireAt(Date.now() + SESSION_DURATION);
        warningShownRef.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoginPage, router, supabase]);

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <>
      <main>{children}</main>
      <Toaster position="top-right" richColors />
    </>
  );
}