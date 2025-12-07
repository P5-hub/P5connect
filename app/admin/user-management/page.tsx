"use client";

import { useState } from "react";

export default function UserManagementPage() {
  // Update-Form
  const [oldLogin, setOldLogin] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Create-Form
  const [cLoginNr, setCLoginNr] = useState("");
  const [cEmail, setCEmail] = useState("");        // ✅ NEU
  const [cPassword, setCPassword] = useState("");
  const [cName, setCName] = useState("");
  const [cRole, setCRole] = useState<"admin" | "dealer">("dealer");

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingUpdate(true);

    const res = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldLogin, newLogin, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error || "Fehler beim Aktualisieren.");
    else setMessage("Benutzer erfolgreich aktualisiert.");

    setLoadingUpdate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoadingCreate(true);

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loginNr: cLoginNr,
        email: cEmail,                     // ✅ WICHTIG!
        password: cPassword,
        name: cName,
        role: cRole,
      }),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error || "Fehler beim Erstellen.");
    else setMessage("Benutzer erfolgreich erstellt.");

    setLoadingCreate(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Benutzerverwaltung</h1>

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {/* Update-Bereich */}
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">Bestehenden Benutzer aktualisieren</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Alter Login (login_nr)</label>
            <input
              className="border p-2 w-full"
              value={oldLogin}
              onChange={(e) => setOldLogin(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Neuer Login (login_nr)</label>
            <input
              className="border p-2 w-full"
              value={newLogin}
              onChange={(e) => setNewLogin(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Neues Passwort (optional)</label>
            <input
              type="password"
              className="border p-2 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            disabled={loadingUpdate}
          >
            {loadingUpdate ? "Aktualisiere..." : "Benutzer aktualisieren"}
          </button>
        </form>
      </section>

      {/* Neuen Benutzer anlegen */}
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">Neuen Benutzer anlegen</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Login-Nr (login_nr)</label>
            <input
              className="border p-2 w-full"
              value={cLoginNr}
              onChange={(e) => setCLoginNr(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">E-Mail</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Passwort</label>
            <input
              type="password"
              className="border p-2 w-full"
              value={cPassword}
              onChange={(e) => setCPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              className="border p-2 w-full"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="optional"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Rolle</label>
            <select
              className="border p-2 w-full"
              value={cRole}
              onChange={(e) => setCRole(e.target.value as "admin" | "dealer")}
            >
              <option value="dealer">Händler</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loadingCreate}
          >
            {loadingCreate ? "Erstelle..." : "Benutzer erstellen"}
          </button>
        </form>
      </section>
    </div>
  );
}
