"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UnifiedDashboard from "@/components/admin/UnifiedDashboard";
import { Loader2 } from "lucide-react";

export default function AdminTestPage() {
  const supabase = createClient();

  const [type, setType] = useState<
    "bestellung" | "projekt" | "support" | "cashback" | "aktion" | "sofortrabatt" | ""
  >("");
  const [id, setId] = useState<string>("");
  const [available, setAvailable] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 🔹 IDs aus Supabase laden, wenn Typ gewählt wird
  useEffect(() => {
    if (!type) {
      setAvailable([]);
      return;
    }

    (async () => {
      setLoadingList(true);

      let data: any[] = [];
      let error: any = null;

      try {
        if (["bestellung", "projekt", "support"].includes(type)) {
          const { data: d, error: e } = await supabase
            .from("submissions")
            .select(`
              submission_id,
              dealer_id,
              typ,
              datum,
              status,
              sony_share,
              dealers ( name, email )
            `)
            .eq("typ", type)
            .order("created_at", { ascending: false })
            .limit(50);

          if (e && Object.keys(e).length > 0)
            console.error("❌ Supabase-Fehler:", e.message || e);
          else console.log("✅ Gefundene Datensätze:", d?.length);

          data = d || [];
          error = e;
        }
      } catch (err) {
        console.error("❌ Fehler beim Laden:", err);
      }

      if (error && Object.keys(error).length > 0)
        console.error("❌ Supabase-Fehler:", error);
      setAvailable(data);
      setLoadingList(false);
    })();
  }, [type, supabase]);

  function handleSubmit() {
    if (!type || !id) return alert("Bitte Typ und ID auswählen.");
    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);
    setType("");
    setId("");
    setAvailable([]);
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="border rounded-2xl shadow-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold">🧪 UnifiedDashboard Testseite</h2>
          <p className="text-sm text-gray-500">
            Wähle einen Datentyp und eine ID aus, um das Dashboard zu testen.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {!submitted ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 items-center flex-wrap">
                {/* Typ-Auswahl */}
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as any);
                    setId("");
                    setAvailable([]);
                  }}
                  className="border rounded-md px-3 py-2 text-sm w-52"
                >
                  <option value="">-- Typ wählen --</option>
                  <option value="bestellung">Bestellung</option>
                  <option value="projekt">Projekt</option>
                  <option value="support">Support</option>
                  <option value="cashback">Cashback</option>
                  <option value="aktion">Aktion</option>
                  <option value="sofortrabatt">Sofortrabatt</option>
                </select>

                {/* ID-Auswahl */}
                {loadingList ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Lade Datensätze...
                  </div>
                ) : available.length > 0 ? (
                  <select
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm w-64"
                  >
                    <option value="">-- ID auswählen --</option>
                    {available.map((r) => (
                      <option
                        key={r.submission_id || r.claim_id || r.id}
                        value={r.submission_id || r.claim_id || r.id}
                      >
                        {(() => {
                          const base = r.submission_id || r.claim_id || r.id || "–";
                          const name =
                            r.dealer_name ||
                            r.title ||
                            r.dealers?.name ||
                            "";
                          const date = r.datum
                            ? new Date(r.datum).toLocaleDateString("de-CH")
                            : "";
                          return `#${base} ${name ? `– ${name}` : ""} (${date})`;
                        })()}
                      </option>
                    ))}
                  </select>
                ) : type ? (
                  <p className="text-xs text-gray-400">
                    Keine Datensätze gefunden.
                  </p>
                ) : null}

                {/* Manuelle ID-Eingabe (optional) */}
                {!loadingList && (
                  <Input
                    placeholder="Oder ID manuell eingeben"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-52"
                  />
                )}

                <Button onClick={handleSubmit} disabled={!type || !id}>
                  Laden
                </Button>
              </div>

              <p className="text-xs text-gray-400">
                Tipp: Wähle zuerst den Typ, dann erscheint automatisch eine Liste der letzten 50 Datensätze.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Zeige <strong>{type}</strong> mit ID <strong>{id}</strong>
                </p>
                <Button variant="outline" onClick={resetForm}>
                  Zurück zur Auswahl
                </Button>
              </div>

              {/* 🔹 UnifiedDashboard */}
              <UnifiedDashboard
                submissionType={type as any}
                key={`${type}-${id}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
