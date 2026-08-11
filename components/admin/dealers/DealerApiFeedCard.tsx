"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Clipboard,
  KeyRound,
  Loader2,
  Power,
  RefreshCcw,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FeedTokenRow = {
  id: number;
  dealer_id: number;
  name: string | null;
  active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
};

type FeedTokenResponse = {
  dealerId: number;
  activeToken: FeedTokenRow | null;
  tokens: FeedTokenRow[];
  feedUrl: string;
};

type CreateTokenResponse = {
  message: string;
  token: string;
  tokenInfo: FeedTokenRow;
  feedUrl: string;
  warning: string;
};

type Props = {
  dealerId: number;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "–";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "–";
  }

  return date.toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DealerApiFeedCard({ dealerId }: Props) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [feedData, setFeedData] = useState<FeedTokenResponse | null>(null);

  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    if (!dealerId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/dealers/${dealerId}/feed-token`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "API-Zugang konnte nicht geladen werden."
        );
      }

      setFeedData(data as FeedTokenResponse);
    } catch (error) {
      console.error("Dealer API feed load error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "API-Zugang konnte nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const createToken = async () => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch(
        `/api/admin/dealers/${dealerId}/feed-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "API-Zugang konnte nicht erstellt werden."
        );
      }

      const result = data as CreateTokenResponse;

      setNewToken(result.token);

      setMessage({
        type: "success",
        text: "API-Zugang wurde erfolgreich erstellt.",
      });

      await loadStatus();
    } catch (error) {
      console.error("Dealer API feed create error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "API-Zugang konnte nicht erstellt werden.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const setTokenActive = async (active: boolean) => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch(
        `/api/admin/dealers/${dealerId}/feed-token`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "API-Zugang konnte nicht geändert werden."
        );
      }

      setMessage({
        type: "success",
        text:
          data?.message ||
          (active
            ? "API-Zugang wurde aktiviert."
            : "API-Zugang wurde deaktiviert."),
      });

      await loadStatus();
    } catch (error) {
      console.error("Dealer API feed active error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "API-Zugang konnte nicht geändert werden.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const revokeToken = async () => {
    const confirmed = window.confirm(
      "API-Zugang wirklich widerrufen?\n\nDer aktuelle Händler-Token funktioniert danach sofort nicht mehr."
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch(
        `/api/admin/dealers/${dealerId}/feed-token`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "API-Zugang konnte nicht widerrufen werden."
        );
      }

      setNewToken(null);

      setMessage({
        type: "success",
        text: data?.message || "API-Zugang wurde widerrufen.",
      });

      await loadStatus();
    } catch (error) {
      console.error("Dealer API feed revoke error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "API-Zugang konnte nicht widerrufen werden.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Clipboard error:", error);

      setMessage({
        type: "error",
        text: "Kopieren in die Zwischenablage ist fehlgeschlagen.",
      });
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          API-Zugang wird geladen …
        </div>
      </Card>
    );
  }

  const activeToken = feedData?.activeToken ?? null;

  const latestToken = feedData?.tokens?.[0] ?? null;

  const feedUrl =
    feedData?.feedUrl ||
    "https://www.p5connect.ch/api/dealer-feed/pricelist";

  const isRevoked = Boolean(latestToken?.revoked_at);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-indigo-600" />

              <h2 className="text-lg font-semibold text-gray-900">
                Automatischer Preislisten-Feed
              </h2>
            </div>

            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              Sicherer API-Zugang für den automatisierten Abruf der aktuellen
              Händlerpreise.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={loadStatus}
            disabled={actionLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>

        {message ? (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </div>

            <div className="mt-3 flex items-center gap-2">
              {activeToken ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-600" />

                  <span className="font-semibold text-green-700">
                    API-Zugang aktiv
                  </span>
                </>
              ) : latestToken && !isRevoked ? (
                <>
                  <ShieldOff className="h-5 w-5 text-amber-600" />

                  <span className="font-semibold text-amber-700">
                    API-Zugang deaktiviert
                  </span>
                </>
              ) : latestToken && isRevoked ? (
                <>
                  <ShieldOff className="h-5 w-5 text-red-600" />

                  <span className="font-semibold text-red-700">
                    API-Zugang widerrufen
                  </span>
                </>
              ) : (
                <>
                  <ShieldOff className="h-5 w-5 text-gray-400" />

                  <span className="font-semibold text-gray-700">
                    Noch kein API-Zugang
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Dealer ID
            </div>

            <div className="mt-3 text-lg font-semibold text-gray-900">
              {dealerId}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Erstellt
            </div>

            <div className="mt-2 text-sm font-medium text-gray-900">
              {formatDateTime(latestToken?.created_at)}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Letzter Abruf
            </div>

            <div className="mt-2 text-sm font-medium text-gray-900">
              {formatDateTime(activeToken?.last_used_at ?? latestToken?.last_used_at)}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="text-sm font-semibold text-blue-900">Feed URL</div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <div className="flex-1 break-all rounded-xl border border-blue-200 bg-white px-4 py-3 font-mono text-sm text-gray-800">
              {feedUrl}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => copyText(feedUrl)}
            >
              <Clipboard className="mr-2 h-4 w-4" />
              URL kopieren
            </Button>
          </div>

          <p className="mt-3 text-xs text-blue-800">
            Der Händler verwendet immer dieselbe URL. Die Zuordnung zum Händler
            erfolgt ausschließlich über seinen persönlichen Bearer-Token.
          </p>
        </div>

        {latestToken ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Bezeichnung
                </div>

                <div className="mt-2 text-sm font-medium text-gray-900">
                  {latestToken.name || "Price Feed"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Token ID
                </div>

                <div className="mt-2 text-sm font-medium text-gray-900">
                  #{latestToken.id}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Ablaufdatum
                </div>

                <div className="mt-2 text-sm font-medium text-gray-900">
                  {formatDateTime(latestToken.expires_at)}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Widerrufen
                </div>

                <div className="mt-2 text-sm font-medium text-gray-900">
                  {formatDateTime(latestToken.revoked_at)}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {!latestToken ? (
            <Button
              type="button"
              onClick={createToken}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}

              API-Zugang erstellen
            </Button>
          ) : null}

          {latestToken && !isRevoked && latestToken.active ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setTokenActive(false)}
              disabled={actionLoading}
            >
              <Power className="mr-2 h-4 w-4" />
              Deaktivieren
            </Button>
          ) : null}

          {latestToken && !isRevoked && !latestToken.active ? (
            <Button
              type="button"
              onClick={() => setTokenActive(true)}
              disabled={actionLoading}
            >
              <Power className="mr-2 h-4 w-4" />
              Aktivieren
            </Button>
          ) : null}

          {latestToken && !isRevoked ? (
            <Button
              type="button"
              variant="destructive"
              onClick={revokeToken}
              disabled={actionLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Zugang widerrufen
            </Button>
          ) : null}

          {latestToken && isRevoked ? (
            <Button
              type="button"
              onClick={createToken}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}

              Neuen API-Zugang erstellen
            </Button>
          ) : null}
        </div>
      </Card>

      {newToken ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-green-100 p-2">
                <ShieldCheck className="h-6 w-6 text-green-700" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Neuer API-Token
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Dieser Token wird nur dieses eine Mal im Klartext angezeigt.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-semibold text-amber-900">
                Wichtig
              </div>

              <p className="mt-1 text-sm text-amber-800">
                Kopiere den Token jetzt und übermittle ihn sicher an den
                Händler. Nach dem Schließen kann der Token nicht erneut
                angezeigt werden.
              </p>
            </div>

            <div className="mt-5 break-all rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm text-gray-900">
              {newToken}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => copyText(newToken)}
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                ) : (
                  <Clipboard className="mr-2 h-4 w-4" />
                )}

                {copied ? "Kopiert" : "Token kopieren"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setNewToken(null);
                  setCopied(false);
                }}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}