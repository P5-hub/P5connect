"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ResetPasswordRequestPage() {
  const supabase = getSupabaseBrowser();
  const { t } = useI18n();

  const [loginNr, setLoginNr] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dynamische Redirect-URL
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://www.p5connect.ch";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!loginNr.trim()) {
      setError("Bitte Login-Nr. eingeben.");
      return;
    }

    setLoading(true);

    // Händler suchen
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("email")
      .eq("login_nr", loginNr)
      .maybeSingle();

    if (dealerError || !dealer?.email) {
      setError("Diese Login-Nr. ist nicht bekannt.");
      setLoading(false);
      return;
    }

    // Reset-Link mailen
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      dealer.email,
      {
        redirectTo: `${baseUrl}/reset-password/change`,
      }
    );

    if (resetError) {
      setError("Fehler: " + resetError.message);
      setLoading(false);
      return;
    }

    setMessage("Wir haben dir eine E-Mail zum Passwort-Reset gesendet.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSend}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Passwort zurücksetzen
        </h1>

        <p className="text-sm text-gray-500 mb-6 text-center">
          Bitte Login-Nr. eingeben.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Login-Nr.
        </label>

        <input
          type="text"
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={loginNr}
          onChange={(e) => setLoginNr(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        <button
          disabled={loading}
          className="bg-indigo-600 text-white w-full py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Sende Link..." : "Link anfordern"}
        </button>
      </form>
    </div>
  );
}
