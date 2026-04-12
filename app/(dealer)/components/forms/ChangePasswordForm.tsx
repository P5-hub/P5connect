"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ChangePasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useI18n();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(t("auth.password.errorMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("auth.password.errorMinLength"));
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t("auth.password.notLoggedIn"));
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(t("auth.password.successChanged"));

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
            {t("auth.password.newPassword")}
          </label>
          <input
            type="password"
            className="
              w-full rounded-xl border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800
              px-4 py-3 text-sm text-gray-900 dark:text-gray-100
              shadow-sm outline-none
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
            "
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading || !!success}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
            {t("auth.password.confirmPassword")}
          </label>
          <input
            type="password"
            className="
              w-full rounded-xl border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800
              px-4 py-3 text-sm text-gray-900 dark:text-gray-100
              shadow-sm outline-none
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
            "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || !!success}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading || !!success}
            className="
              inline-flex items-center justify-center rounded-xl
              bg-indigo-600 px-5 py-3 text-sm font-medium text-white
              shadow-sm transition hover:bg-indigo-700
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {loading
              ? t("auth.password.submitting")
              : t("auth.password.submit")}
          </button>
        </div>
      </div>
    </form>
  );
}