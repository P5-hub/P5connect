"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

export default function ResetPasswordChangePage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = getSupabaseBrowser();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ⭐ WICHTIG: Token aus URL einlösen → User automatisch einloggen
  useEffect(() => {
    async function exchange() {
      const hash = window.location.hash;

      if (hash.includes("access_token")) {
        const { error } = await supabase.auth.exchangeCodeForSession(hash);

        if (error) {
          console.error("Session-Exchange-Fehler:", error.message);
          setError("Der Link ist ungültig oder abgelaufen.");
        }
      }
    }

    exchange();
  }, []);

  // ⭐ Passwort setzen
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirm) {
      setError("❌ Die Passwörter stimmen nicht überein.");
      return;
    }

    if (newPassword.length < 8) {
      setError("❌ Passwort zu kurz (mind. 8 Zeichen).");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError("❌ Fehler: " + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess("✅ Dein Passwort wurde erfolgreich geändert!");

    setTimeout(() => router.push("/login"), 1800);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow border dark:border-gray-700"
      >
        <h1 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          Neues Passwort setzen
        </h1>

        <label className="block mb-1 text-sm font-medium">
          Neues Passwort
        </label>
        <input
          type="password"
          className="border p-3 w-full rounded mb-4 dark:bg-gray-800 dark:border-gray-600"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label className="block mb-1 text-sm font-medium">
          Passwort bestätigen
        </label>
        <input
          type="password"
          className="border p-3 w-full rounded mb-4 dark:bg-gray-800 dark:border-gray-600"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {error && <p className="text-red-600 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium"
        >
          {loading ? "⏳ Speichere..." : "Passwort ändern"}
        </button>
      </form>
    </div>
  );
}
