"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";

const SESSION_DURATION = 20 * 60 * 1000; // 20 Minuten Inaktivität
const WARNING_BEFORE_EXPIRY = 2 * 60 * 1000; // 2 Minuten vorher warnen
const AUTO_REFRESH_COOLDOWN = 30 * 1000; // max. alle 30s verlängern



const PUBLIC_ROUTES = [
  "/login",
  "/reset-password",
  "/reset-password/change",
  "/impressum",
  "/datenschutz",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function SessionTimeoutManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [expireAt, setExpireAt] = useState<number | null>(null);
  const warningShownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRefreshRef = useRef(0);

  const isPublic = isPublicRoute(pathname);

  const renewSession = async () => {
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
      // Redirect trotzdem ausführen
    }

    if (showToast) {
      toast.error(t("session.expired"), {
        duration: 5000,
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1200);

      return;
    }

    router.replace("/login");
  };

  useEffect(() => {
    if (isPublic) {
      setExpireAt(null);
      return;
    }

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
  }, [isPublic, pathname, router, supabase]);

  useEffect(() => {
    if (isPublic || !expireAt) return;

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

        toast.warning(t("session.expiringSoon"), {
          duration: 5000,
          action: {
            label: t("session.extend"),
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
  }, [expireAt, isPublic, t]);

  useEffect(() => {
    if (isPublic) return;

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
      events.forEach((event) => {
        window.removeEventListener(event, refresh);
      });
    };
  }, [isPublic]);

  useEffect(() => {
    if (isPublic) return;

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
  }, [isPublic, router, supabase]);

  return null;
}