"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ResetPasswordRequestPage() {
  const supabase = getSupabaseBrowser();

  const [loginNr, setLoginNr] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!loginNr.trim()) {
      setError("Bitte Login-Nr. eingeben.");
      return;
    }

    setLoading(true);

    // 1️⃣ Händler anhand login_nr finden
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

    // 2️⃣ Supabase Reset-Mail senden
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      dealer.email,
      {
        redirectTo: "https://p5connect.ch/reset-password/change",
      }
    );

    if (resetError) {
      setError("Fehler: " + resetError.message);
      setLoading(false);
      return;
    }

    setMessage("Wir haben eine E-Mail mit einem Passwort-Reset-Link gesendet.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSendLink}
        className="
          max-w-md w-full bg-white 
          p-8 rounded-2xl shadow-xl
          border border-gray-200 
        "
      >
        {/* Titel */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Passwort zurücksetzen
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Bitte geben Sie Ihre Login-Nr. ein.
        </p>

        {/* Login-Nr */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Login-Nr.
        </label>
        <input
          type="text"
          className="
            border border-gray-300 
            rounded-lg p-3 w-full mb-4 
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
          value={loginNr}
          onChange={(e) => setLoginNr(e.target.value)}
        />

        {/* Fehlermeldung */}
        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {/* Erfolgsmeldung */}
        {message && (
          <p className="text-green-600 text-sm mb-4">{message}</p>
        )}

        {/* Button */}
        <button
          className="
            bg-indigo-600 text-white w-full 
            py-3 rounded-lg text-sm font-medium 
            hover:bg-indigo-700 transition
            disabled:opacity-50
          "
          disabled={loading}
        >
          {loading ? "Sende Link..." : "Link anfordern"}
        </button>

        {/* Zurück zum Login */}
        <p className="text-center mt-6 text-sm">
          <Link
            href="/login"
            className="text-indigo-600 hover:underline"
          >
            Zurück zum Login
          </Link>
        </p>
      </form>
    </div>
  );
}
