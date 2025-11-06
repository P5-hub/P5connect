"use client";

import ChangePasswordForm from "@/components/forms/ChangePasswordForm";

export default function PasswordPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">🔒 Passwort ändern</h1>
      <ChangePasswordForm />
    </div>
  );
}
