"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, ShieldPlus } from "lucide-react";

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  dealer_id?: number;
  email?: string;
  auth_user_id?: string;
};

export default function CreateAdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const trimmedEmail = email.trim().toLowerCase();
    const parsedDealerId = Number(dealerId);

    if (!trimmedEmail) {
      setResult({
        type: "error",
        message: "Bitte eine E-Mail eingeben.",
      });
      return;
    }

    if (!dealerId || Number.isNaN(parsedDealerId)) {
      setResult({
        type: "error",
        message: "Bitte eine gültige Dealer ID eingeben.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          dealer_id: parsedDealerId,
          password: password.trim() || undefined,
        }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok) {
        setResult({
          type: "error",
          message: data.error || "Admin konnte nicht angelegt werden.",
        });
        return;
      }

      setResult({
        type: "success",
        message:
          data.message ||
          "Admin wurde erfolgreich angelegt oder aktualisiert.",
      });

      setEmail("");
      setDealerId("");
      setPassword("");
    } catch (error) {
      console.error("Fehler beim Erstellen Admin:", error);
      setResult({
        type: "error",
        message: "Serverfehler beim Erstellen des Admins.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-gray-900">
                <ShieldPlus className="h-5 w-5 text-indigo-600" />
                <h1 className="text-xl font-semibold">Neuen Admin anlegen</h1>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Lege einen neuen Admin an oder verknüpfe einen bestehenden
                Auth-User sauber mit einem Dealer.
              </p>
            </div>

            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-200 p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                E-Mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="z. B. admin@firma.ch"
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-gray-500">
                Die E-Mail des Admin-Logins in Supabase Auth.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Dealer ID
              </label>
              <Input
                type="number"
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                placeholder="z. B. 565"
                inputMode="numeric"
              />
              <p className="mt-1 text-xs text-gray-500">
                Die Dealer ID des Händlers, der mit dem Admin verknüpft werden
                soll.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nur nötig, wenn der Auth-User noch nicht existiert. Bei einem
                bestehenden User kann das Feld leer bleiben.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldPlus className="mr-2 h-4 w-4" />
                )}
                Admin anlegen
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail("");
                  setDealerId("");
                  setPassword("");
                  setResult(null);
                }}
                disabled={submitting}
              >
                Zurücksetzen
              </Button>
            </div>
          </form>
        </Card>

        {result && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              result.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}