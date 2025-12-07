"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { _, setCurrentLang, getInitialLang, type Lang } from "@/utils/translations";
import { Globe, Handshake } from "lucide-react";

// Themefarben für animiertes 5
const themeColors = {
  bestellung: "#2563eb",
  support: "#f97316",
  verkauf: "#16a34a",
  projekt: "#9333ea",
  sofortrabatt: "#ec4899",
};

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  // States
  const [loginNr, setLoginNr] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sprache
  const [lang, setLang] = useState<Lang>(getInitialLang());
  const switchLang = (l: Lang) => {
    setCurrentLang(l);
    setLang(l);
  };

  // Animiertes Farblogo P5
  const colorKeys = Object.keys(themeColors) as (keyof typeof themeColors)[];
  const [currentColor, setCurrentColor] = useState(themeColors.bestellung);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextKey;
      do {
        nextKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      } while (themeColors[nextKey] === currentColor);

      setScale(1.18);
      setCurrentColor(themeColors[nextKey]);
      setTimeout(() => setScale(1), 350);
    }, 2400);

    return () => clearInterval(interval);
  }, [currentColor]);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1) Dealer anhand login_nr holen
      const { data: dealer, error: dealerError } = await supabase
        .from("dealers")
        .select("dealer_id, login_nr, role, store_name, email")
        .eq("login_nr", loginNr)
        .maybeSingle();

      if (dealerError || !dealer) {
        throw new Error("Unbekannte Login-Nummer.");
      }

      if (!dealer.email) {
        throw new Error("Für diesen Händler ist keine E-Mail hinterlegt.");
      }

      // 2) Login über echte E-Mail
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: dealer.email,
        password,
      });

      if (authError || !data.user) {
        throw new Error("Login fehlgeschlagen. Bitte Login-Nr. und Passwort prüfen.");
      }

      // 3) User-Metadaten aktualisieren (für Middleware & Dashboard)
      await supabase.auth.updateUser({
        data: {
          dealer_id: dealer.dealer_id,
          login_nr: dealer.login_nr,
          role: dealer.role ?? "dealer",
          store_name: dealer.store_name ?? "",
        },
      });

      // 4) Routing anhand Rolle (nur aus dealers.role, NICHT aus JWT)
      if (dealer.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/bestellung");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-b from-gray-100 to-gray-200 
      dark:from-gray-900 dark:to-black 
      px-4 transition
    ">

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

        {/* ⭐ Premium Loading Bar oben */}
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden rounded-t-2xl">
            <div className="h-full bg-indigo-500 animate-loading-bar shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
          </div>
        )}

        {/* Logo */}
        <h1 className="
          text-4xl font-semibold text-center 
          text-gray-800 dark:text-gray-100
          mb-3 tracking-tight select-none font-[Inter,sans-serif]
        ">
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

        {/* Subtitle */}
        <div className="flex items-center justify-center gap-2 mb-6 text-gray-600 dark:text-gray-300">
          <Handshake className="w-5 h-5" />
          <span className="text-sm font-medium">{_("welcomeLogin")}</span>
        </div>

        {/* Login-Nr */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {_("loginNr")}
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
          placeholder={_("loginNrPlaceholder")}
          required
        />

        {/* Passwort */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {_("password")}
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
          placeholder={_("passwordPlaceholder")}
          required
        />

        {/* Fehler */}
        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md p-2 mb-2">
            {errorMsg}
          </p>
        )}

        {/* ⭐ Premium-Login-Button */}
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
          {/* Progress-Fill im Button */}
          {loading && (
            <span className="absolute inset-0 bg-indigo-400/30 animate-button-fill"></span>
          )}

          {/* Kreis-Loader + Text */}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {_("login")}
          </span>
        </button>

        {/* ⭐ Footer */}
        {/* ⭐ Footer + Passwort vergessen */}
        <div className="mt-4 space-y-1">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {_("loginFooter")}
          </p>

          
        </div>

        </form>

        {/* Passwort vergessen – Textlink */}
        <div className="mt-3">
          <a
            onClick={() => router.push("/reset-password")}
            className="block mx-auto text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline cursor-pointer text-center"
          >
            Passwort vergessen?
          </a>
        </div>


    </div>
  );
}
