"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { _ } from "@/utils/translations";

// ðŸ”¹ Themefarben (können aus ThemeContext importiert werden)
const themeColors = {
  bestellung: "#2563eb",   // blau
  support: "#f97316",      // orange
  verkauf: "#16a34a",      // grün
  projekt: "#9333ea",      // lila
  sofortrabatt: "#ec4899", // pink
};

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loginNr, setLoginNr] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ðŸ”¹ Farbwechsel (zufällige Rotation)
  const colorKeys = Object.keys(themeColors) as (keyof typeof themeColors)[];
  const [currentColor, setCurrentColor] = useState(themeColors.bestellung);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      // zufällige Farbe, die nicht die gleiche wie vorher ist
      let nextKey;
      do {
        nextKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      } while (themeColors[nextKey] === currentColor);

      setScale(1.2);
      setCurrentColor(themeColors[nextKey]);
      setTimeout(() => setScale(1), 400);
    }, 2500);
    return () => clearInterval(interval);
  }, [currentColor]);

  // ðŸ”¹ Login-Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      console.log("ðŸ” Login Versuch:", loginNr);

      const email = `${loginNr}@p5.local`;
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        throw new Error("Login fehlgeschlagen. Bitte Login-Nr. und Passwort prüfen.");
      }

      const { data: dealer } = await supabase
        .from("dealers")
        .select("dealer_id, login_nr, role, store_name")
        .eq("login_nr", loginNr)
        .maybeSingle();

      await supabase.auth.updateUser({
        data: {
          dealer_id: dealer?.dealer_id,
          login_nr: loginNr,
          role: dealer?.role ?? "haendler",
          store_name: dealer?.store_name ?? "",
        },
      });

      if (dealer?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/bestellung");
      }
    } catch (err: any) {
      console.error("❌ Fehler im Login:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg border border-gray-200 transition"
      >
        {/* ðŸ”¹ Neues, elegantes P5connect-Logo */}
        <h1 className="text-4xl font-semibold text-center text-gray-800 mb-3 tracking-tight select-none font-[Inter,sans-serif]">
          <span className="text-gray-700">P</span>
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
          <span className="text-gray-700">connect</span>
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Willkommen beim P5 Partner Login
        </p>

        {/* ðŸ”¹ Login-Nr */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {_("loginNr")}
          </label>
          <input
            type="text"
            value={loginNr}
            onChange={(e) => setLoginNr(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* ðŸ”¹ Passwort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {_("password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* ðŸ”¹ Fehlermeldung */}
        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {errorMsg}
          </p>
        )}

        {/* ðŸ”¹ Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "…" : _("login")}
        </button>
      </form>
    </div>
  );
}

