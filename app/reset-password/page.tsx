"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [loginNr, setLoginNr] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginNr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Senden der Reset-Mail.");
        setLoading(false);
        return;
      }

      setSuccess(t("auth.reset.mailSent"));
      setLoginNr("");
    } catch (err: any) {
      setError(err?.message || "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow border dark:border-gray-700"
      >
        <h1 className="text-xl font-semibold mb-6">
          {t("auth.reset.requestTitle")}
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {t("auth.reset.requestDesc")}
        </p>

        <label className="block mb-1 text-sm font-medium">
          {t("auth.login.loginNr")}
        </label>

        <input
          type="text"
          required
          value={loginNr}
          onChange={(e) => setLoginNr(e.target.value)}
          className="
            border p-3 w-full rounded mb-4
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
          "
          placeholder={t("auth.login.loginNrPlaceholder")}
        />

        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

        {success && <p className="text-green-600 mb-3 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full bg-indigo-600 hover:bg-indigo-700
            text-white py-3 rounded-lg
            disabled:opacity-50
          "
        >
          {loading ? "⏳" : t("auth.reset.send")}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full mt-3 text-sm text-gray-600 hover:underline"
        >
          {t("auth.reset.backToLogin")}
        </button>
      </form>
    </div>
  );
}