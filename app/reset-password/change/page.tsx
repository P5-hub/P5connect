"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ResetPasswordChangePage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = getSupabaseBrowser();
  const { t } = useI18n();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [canSubmit, setCanSubmit] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initRecovery() {
      setError(null);
      setSuccess(null);
      setInitializing(true);
      setCanSubmit(false);

      try {
        const tokenHash = params.get("token_hash");
        const type = params.get("type");

        if (!tokenHash || type !== "recovery") {
          if (!mounted) return;
          setError(t("auth.reset.invalidLink"));
          setInitializing(false);
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (!mounted) return;

        if (verifyError) {
          setError(t("auth.reset.expired"));
          setInitializing(false);
          return;
        }

        setCanSubmit(true);
        setInitializing(false);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          err instanceof Error ? err.message : t("auth.reset.invalidLink");
        setError(msg);
        setInitializing(false);
      }
    }

    initRecovery();

    return () => {
      mounted = false;
    };
  }, [params, supabase, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError(t("auth.reset.invalidLink"));
      return;
    }

    if (newPassword !== confirm) {
      setError(t("auth.reset.mismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("auth.reset.short"));
      return;
    }

    setLoading(true);

    try {
      const { error: updErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updErr) {
        setError("❌ " + updErr.message);
        return;
      }

      setSuccess(t("auth.reset.success"));

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("auth.reset.invalidLink");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow border dark:border-gray-700"
      >
        <h1 className="text-xl font-semibold mb-6">
          {t("auth.reset.title")}
        </h1>

        {initializing ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("auth.reset.loading")}
          </p>
        ) : (
          <>
            <label className="block mb-1 text-sm font-medium">
              {t("auth.reset.newPassword")}
            </label>
            <input
              type="password"
              className="border p-3 w-full rounded mb-4 bg-white dark:bg-gray-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading || !!success || !canSubmit}
            />

            <label className="block mb-1 text-sm font-medium">
              {t("auth.reset.confirm")}
            </label>
            <input
              type="password"
              className="border p-3 w-full rounded mb-4 bg-white dark:bg-gray-800"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading || !!success || !canSubmit}
            />

            {error && <p className="text-red-600 mb-3">{error}</p>}
            {success && <p className="text-green-600 mb-3">{success}</p>}

            <button
              type="submit"
              disabled={loading || !!success || !canSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "⏳" : t("auth.reset.submit")}
            </button>

            {!canSubmit && !success && (
              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="w-full mt-3 text-sm text-gray-600 hover:underline"
              >
                {t("auth.reset.requestNew")}
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}