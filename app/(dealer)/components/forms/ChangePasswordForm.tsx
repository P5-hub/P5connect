"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ChangePasswordForm() {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("❌ Die Passwörter stimmen nicht überein.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("❌ Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    // 1️⃣ Passwort in Supabase Auth ändern
    const { data: user, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMsg("❌ Fehler: " + error.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Auch dealers.password_plain aktualisieren
    const res = await fetch("/api/user/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    const json = await res.json();
    if (!res.ok) {
      setErrorMsg("Datenbank-Update fehlgeschlagen: " + json.error);
      setLoading(false);
      return;
    }

    setSuccessMsg("✅ Passwort erfolgreich geändert!");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow-md"
    >
      <h2 className="text-lg font-semibold mb-2">Passwort ändern</h2>

      <div>
        <label>Neues Passwort</label>
        <input
          type="password"
          className="border p-2 w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Passwort bestätigen</label>
        <input
          type="password"
          className="border p-2 w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {errorMsg && <p className="text-red-600">{errorMsg}</p>}
      {successMsg && <p className="text-green-600">{successMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "⏳ Speichern ..." : "Passwort ändern"}
      </button>
    </form>
  );
}
