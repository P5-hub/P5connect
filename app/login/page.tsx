"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Lang } from "@/lib/i18n/translations";
import { Globe, Handshake } from "lucide-react";
import Link from "next/link";

// Themefarben für animiertes 5
const themeColors = {
  bestellung: "#2563eb",
  support: "#f97316",
  verkauf: "#16a34a",
  projekt: "#9333ea",
  sofortrabatt: "#ec4899",
};

type DealerLookup = {
  dealer_id: number;
  login_nr: string;
  role: "admin" | "dealer" | string | null;
  store_name: string | null;
  email: string | null;
};

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const [loginNr, setLoginNr] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchLang = (l: Lang) => setLang(l);

  // Animiertes Farblogo P5
  const colorKeys = Object.keys(themeColors) as (keyof typeof themeColors)[];
  const [currentColor, setCurrentColor] = useState(themeColors.bestellung);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextKey: keyof typeof themeColors;
      do {
        nextKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      } while (themeColors[nextKey] === currentColor);

      setScale(1.18);
      setCurrentColor(themeColors[nextKey]);
      setTimeout(() => setScale(1), 350);
    }, 2400);

    return () => clearInterval(interval);
  }, [currentColor, colorKeys]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // ✅ 0) Dealer Lookup serverseitig (Service Role) -> funktioniert auch wenn dealers RLS an ist
      const lookupRes = await fetch("/api/auth/lookup-dealer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loginNr }),
      });

      const lookupJson = await lookupRes.json().catch(() => ({}));
      console.log("lookupRes.ok:", lookupRes.ok);
      console.log("lookupJson:", lookupJson);

      if (!lookupRes.ok) {
        // möglichst generische Fehlermeldung
        throw new Error(
          lookupJson?.error === "Invalid credentials"
            ? t("login.error.unknownLogin")
            : (lookupJson?.error ?? t("login.error.failed"))
        );
      }

      const dealer: DealerLookup | undefined = lookupJson?.dealer;
      if (!dealer?.email) {
        throw new Error(t("login.error.noEmail"));
      }

      // ✅ 1) Auth Login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: dealer.email,
        password,
      });

      if (authError || !data.user) {
        throw new Error(t("login.error.failed"));
      }

      // ✅ 2) dealer_id sicher in app_metadata setzen (serverseitig)
      const res = await fetch("/api/auth/set-claims", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          dealerId: dealer.dealer_id,
          role: dealer.role ?? "dealer",
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error("❌ set-claims failed: " + msg);
      }

      // ✅ 3) neues JWT ziehen
      await supabase.auth.refreshSession();

      // ✅ 3b) Absicherung: falls Claims noch nicht sofort im Token sind, einmal retry
      {
        const { data: s1 } = await supabase.auth.getSession();
        const dealerIdClaim = (s1.session?.user.app_metadata as any)?.dealer_id;
        if (!dealerIdClaim) {
          await supabase.auth.refreshSession();
        }
      }

      // OPTIONAL (UI/Fallback): user_metadata setzen (nicht für Security)
      await supabase.auth.updateUser({
        data: {
          dealer_id: dealer.dealer_id,
          login_nr: dealer.login_nr,
          role: dealer.role ?? "dealer",
          store_name: dealer.store_name ?? "",
        },
      });

      // Redirect
      if (dealer.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/bestellung");
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-b from-gray-100 to-gray-200 
      dark:from-gray-900 dark:to-black 
      px-4 transition
    "
    >
      {/* 🌐 Sprachbuttons */}
      <div className="flex items-center gap-2 mb-6 select-none">
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        {(["de", "en", "fr", "it", "rm"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => switchLang(l)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition border
              ${
                lang === l
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50"
              }
            `}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LOGIN CARD */}
      <form
        onSubmit={handleLogin}
        className="
          relative w-full max-w-md rounded-2xl
          bg-white dark:bg-gray-900 
          p-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] 
          dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
          border border-gray-200 dark:border-gray-700
        "
      >
        {/* ⭐ Loading Bar */}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden rounded-t-2xl">
            <div className="h-full bg-indigo-500 animate-loading-bar shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
          </div>
        )}

        {/* Logo */}
        <h1
          className="
          text-4xl font-semibold text-center 
          text-gray-800 dark:text-gray-100
          mb-3 tracking-tight select-none font-[Inter,sans-serif]
        "
        >
          <span>P</span>
          <span
            style={{
              color: currentColor,
              transition: "color 0.6s ease, transform 0.4s ease",
              transform: `scale(${scale})`,
              display: "inline-block",
            }}
          >
            5
          </span>
          <span>connect</span>
        </h1>

        {/* Subtitle + Portalbeschreibung */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6 text-gray-600 dark:text-gray-300 text-center">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5" />
            <span className="text-sm font-semibold">{t("login.portalTitle")}</span>
          </div>

          <p className="text-xs max-w-xs leading-relaxed">{t("login.portalDesc")}</p>
        </div>

        {/* Login-Nr */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("login.loginNr")}
        </label>
        <input
          type="text"
          value={loginNr}
          onChange={(e) => setLoginNr(e.target.value)}
          className="
            w-full rounded-xl border border-gray-300 dark:border-gray-600 
            px-4 py-3 mb-4 shadow-sm 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:border-indigo-600 focus:ring-indigo-600
          "
          placeholder={t("login.loginNrPlaceholder")}
          required
        />

        {/* Passwort */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("login.password")}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full rounded-xl border border-gray-300 dark:border-gray-600 
            px-4 py-3 mb-4 shadow-sm
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            focus:border-indigo-600 focus:ring-indigo-600
          "
          placeholder={t("login.passwordPlaceholder")}
          required
        />

        {/* Fehler */}
        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md p-2 mb-2">
            {errorMsg}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            relative overflow-hidden
            w-full rounded-xl 
            bg-indigo-600 dark:bg-indigo-500 
            py-3 text-white font-medium text-lg 
            hover:bg-indigo-700 dark:hover:bg-indigo-400
            transition disabled:opacity-50 shadow-md
          "
        >
          {loading && <span className="absolute inset-0 bg-indigo-400/30 animate-button-fill"></span>}

          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {t("login.login")}
          </span>
        </button>

        <p className="mt-3 text-[11px] text-center text-gray-500 dark:text-gray-400">
          🔒 {t("login.securityNote")}
        </p>

        {/* Footer */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
          <p>{t("login.footerLine1", { year: new Date().getFullYear() })}</p>
          <p>{t("login.footerLine2")}</p>

          <Link href="/impressum" className="hover:underline text-indigo-600 dark:text-indigo-400">
            {t("login.legalImprint")}
          </Link>

          <span>•</span>
          <Link href="/datenschutz" className="hover:underline text-indigo-600 dark:text-indigo-400">
            {t("login.legalPrivacy")}
          </Link>
        </div>
      </form>

      {/* Passwort vergessen */}
      <div className="mt-3">
        <a
          onClick={() => router.push("/reset-password")}
          className="block mx-auto text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline cursor-pointer text-center"
        >
          {t("passwordForgot")}
        </a>
      </div>
    </div>
  );
}
