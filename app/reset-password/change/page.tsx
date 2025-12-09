"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
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

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const codeParam = params.get("code");
    const emailParam = params.get("email");

    if (!codeParam || !emailParam) {
      setError(t("auth.reset.invalidLink"));
      return;
    }

    const code: string = codeParam;
    const email: string = emailParam;

    async function exchange() {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        type: "recovery",
        email,
        token_hash: code,
      });

      if (verifyErr) {
        setError(t("auth.reset.expired"));
        return;
      }

      setTimeout(async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          setError(t("auth.reset.noSession"));
        }
      }, 300);
    }

    exchange();
  }, [params, supabase, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirm) {
      setError(t("auth.reset.mismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("auth.reset.short"));
      return;
    }

    setLoading(true);

    const { error: updErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updErr) {
      setError("❌ " + updErr.message);
      setLoading(false);
      return;
    }

    setSuccess(t("auth.reset.success"));
    setTimeout(() => router.push("/login"), 1800);
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

        <label className="block mb-1 text-sm font-medium">
          {t("auth.reset.newPassword")}
        </label>
        <input
          type="password"
          className="border p-3 w-full rounded mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label className="block mb-1 text-sm font-medium">
          {t("auth.reset.confirm")}
        </label>
        <input
          type="password"
          className="border p-3 w-full rounded mb-4"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {error && <p className="text-red-600 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        <button
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "⏳" : t("auth.reset.submit")}
        </button>
      </form>
    </div>
  );
}
