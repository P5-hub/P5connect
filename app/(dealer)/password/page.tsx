"use client";

import ChangePasswordForm from "@/app/(dealer)/components/forms/ChangePasswordForm";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function PasswordPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("auth.password.pageTitle")}
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
            {t("auth.password.pageDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4 md:px-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t("auth.password.securityTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("auth.password.securityDescription")}
              </p>
            </div>

            <div className="p-5 md:p-6">
              <ChangePasswordForm />
            </div>
          </section>

          <aside className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 shadow-sm">
            <div className="px-5 py-4 md:px-6">
              <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200">
                {t("auth.password.notesTitle")}
              </h3>

              <div className="mt-3 space-y-3 text-sm text-blue-900/90 dark:text-blue-100/90">
                <div className="rounded-xl bg-white/70 dark:bg-blue-900/20 px-4 py-3 border border-blue-100 dark:border-blue-900/30">
                  {t("auth.password.noteMinLength")}
                </div>

                <div className="rounded-xl bg-white/70 dark:bg-blue-900/20 px-4 py-3 border border-blue-100 dark:border-blue-900/30">
                  {t("auth.password.noteLoggedInOnly")}
                </div>

                <div className="rounded-xl bg-white/70 dark:bg-blue-900/20 px-4 py-3 border border-blue-100 dark:border-blue-900/30">
                  {t("auth.password.noteForgotPassword")}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}