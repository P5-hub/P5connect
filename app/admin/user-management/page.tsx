"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type UpdateUserResponse = {
  success?: boolean;
  error?: string;
  oldLogin?: string;
  updatedLoginNr?: string;
  updatedUserId?: string;
  updatedDealerId?: number;
  updatedLoginEmail?: string;
  role?: "admin" | "dealer" | string;
  changedOwnAccount?: boolean;
  passwordChanged?: boolean;
};

type CreateUserResponse = {
  success?: boolean;
  error?: string;
  dealerId?: number;
  userId?: string;
};

export default function UserManagementPage() {
  const router = useRouter();
  const supabase = createClient();

  const [oldLogin, setOldLogin] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [cLoginNr, setCLoginNr] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cName, setCName] = useState("");
  const [cRole, setCRole] = useState<"admin" | "dealer">("dealer");

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [redirectingAfterOwnChange, setRedirectingAfterOwnChange] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const uiLocked = loadingUpdate || loadingCreate || redirectingAfterOwnChange;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingUpdate(true);

    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldLogin: oldLogin.trim(),
          newLogin: newLogin.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      let data: UpdateUserResponse | null = null;
      try {
        data = (await res.json()) as UpdateUserResponse;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Fehler beim Aktualisieren.");
      }

      const changedOwnAccount = Boolean(data?.changedOwnAccount);

      setOldLogin("");
      setNewLogin("");
      setNewPassword("");

      if (changedOwnAccount) {
        setRedirectingAfterOwnChange(true);
        setMessage(
          "Dein eigener Zugang wurde geändert. Du wirst jetzt abgemeldet..."
        );

        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          console.error(
            "❌ Logout-Fehler nach Benutzeränderung:",
            signOutError.message
          );
        }

        router.replace("/login");
        router.refresh();
        return;
      }

      if (data?.passwordChanged && data?.updatedLoginNr && data.oldLogin !== data.updatedLoginNr) {
        setMessage("Login und Passwort wurden erfolgreich aktualisiert.");
      } else if (data?.passwordChanged) {
        setMessage("Passwort wurde erfolgreich aktualisiert.");
      } else if (data?.updatedLoginNr && data.oldLogin !== data.updatedLoginNr) {
        setMessage("Login wurde erfolgreich aktualisiert.");
      } else {
        setMessage("Benutzer erfolgreich aktualisiert.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Fehler beim Aktualisieren.";
      console.error("❌ Fehler beim Aktualisieren:", msg);
      setError(msg);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingCreate(true);

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginNr: cLoginNr.trim(),
          email: cEmail.trim(),
          password: cPassword,
          name: cName.trim(),
          role: cRole,
        }),
      });

      let data: CreateUserResponse | null = null;
      try {
        data = (await res.json()) as CreateUserResponse;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Fehler beim Erstellen.");
      }

      setMessage("Benutzer erfolgreich erstellt.");

      setCLoginNr("");
      setCEmail("");
      setCPassword("");
      setCName("");
      setCRole("dealer");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Fehler beim Erstellen.";
      console.error("❌ Fehler beim Erstellen:", msg);
      setError(msg);
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 relative">
      {redirectingAfterOwnChange && (
        <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="bg-white border shadow-lg rounded-xl px-6 py-4 text-center">
            <div className="mx-auto mb-3 h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-gray-800">
              Abmeldung läuft...
            </p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Benutzerverwaltung</h1>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      {message && (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
          {message}
        </p>
      )}

      <section className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="text-lg font-semibold">Bestehenden Benutzer aktualisieren</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Alter Login (login_nr)</label>
            <input
              className="border p-2 w-full rounded"
              value={oldLogin}
              onChange={(e) => setOldLogin(e.target.value)}
              required
              disabled={uiLocked}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Neuer Login (login_nr)</label>
            <input
              className="border p-2 w-full rounded"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
              required
              disabled={uiLocked}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Neues Passwort (optional)</label>
            <input
              type="password"
              className="border p-2 w-full rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={uiLocked}
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={uiLocked}
          >
            {loadingUpdate
              ? "Aktualisiere..."
              : redirectingAfterOwnChange
              ? "Melde ab..."
              : "Benutzer aktualisieren"}
          </button>
        </form>
      </section>

      <section className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="text-lg font-semibold">Neuen Benutzer anlegen</h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Login-Nr (login_nr)</label>
            <input
              className="border p-2 w-full rounded"
              value={cLoginNr}
              onChange={(e) => setCLoginNr(e.target.value)}
              required
              disabled={uiLocked}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">E-Mail</label>
            <input
              type="email"
              className="border p-2 w-full rounded"
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              required
              disabled={uiLocked}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Passwort</label>
            <input
              type="password"
              className="border p-2 w-full rounded"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              required
              disabled={uiLocked}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              className="border p-2 w-full rounded"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="optional"
              disabled={uiLocked}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Rolle</label>
            <select
              className="border p-2 w-full rounded"
              value={cRole}
              onChange={(e) => setCRole(e.target.value as "admin" | "dealer")}
              disabled={uiLocked}
            >
              <option value="dealer">Händler</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={uiLocked}
          >
            {loadingCreate ? "Erstelle..." : "Benutzer erstellen"}
          </button>
        </form>
      </section>
    </div>
  );
}