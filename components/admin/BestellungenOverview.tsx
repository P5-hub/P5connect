"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Check,
  X,
  Mail,
  RotateCcw,
  Clock,
  ListFilter,
  Search,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useTheme } from "@/lib/theme/ThemeContext";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";

export default function BestellungenOverview() {
  const supabase = createClient();
  const theme = useTheme();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "alle">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // ---------------------------------------------------------
  // Load rows from view
  // ---------------------------------------------------------
  const fetchRows = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("bestellung_dashboard")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Fehler beim Laden:", error);

    setRows(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // ---------------------------------------------------------
  // GROUP BY submission_id  → eine Bestellung pro Karte!
  // ---------------------------------------------------------
  const groupedOrders = useMemo(() => {
    const grouped: Record<number, any> = {};

    for (const row of rows) {
      const sid = row.submission_id;
      if (!grouped[sid]) {
        grouped[sid] = {
          submission_id: sid,
          created_at: row.created_at,
          dealer_name: row.dealer_name,
          dealer_email: row.dealer_email,
          dealer_login_nr: row.dealer_login_nr,
          status: row.status,
          items: [],
          total_sum: 0,
        };
      }

      grouped[sid].items.push(row);

      const preis = row.preis ?? row.calc_price_on_invoice ?? 0;
      grouped[sid].total_sum += preis;
    }

    return Object.values(grouped);
  }, [rows]);

  // ---------------------------------------------------------
  // Filter + Suche
  // ---------------------------------------------------------
  const filteredOrders = useMemo(() => {
    let list = groupedOrders;

    if (statusFilter !== "alle") {
      list = list.filter((o) =>
        statusFilter === "pending"
          ? !o.status || o.status === "pending"
          : o.status === statusFilter
      );
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      list = list.filter((o) =>
        [
          o.dealer_name,
          o.dealer_email,
          o.dealer_login_nr,
          o.items.map((i: any) => i.product_name).join(" "),
          o.items.map((i: any) => i.ean).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    return list;
  }, [groupedOrders, searchQuery, statusFilter]);

  // ---------------------------------------------------------
  // Status Update
  // ---------------------------------------------------------
  async function updateStatus(submissionId: number, status: "pending" | "approved" | "rejected") {
    await supabase.from("submissions").update({ status }).eq("submission_id", submissionId);
    await fetchRows();
  }
// ---------------------------------------------------------
// E-Mail Vorschau – typ-sicher für neues Notification-System
// ---------------------------------------------------------
async function openPreview(submissionId: number) {
  try {
    const res = await sendOrderNotification({
      submissionId,
      stage: "confirmed",
      preview: true,
    });

    // ❗ Fehlerfall
    if (!res.ok) {
      console.error("Preview-Fehler:", res);
      setPreviewHtml("<p>Keine Vorschau verfügbar.</p>");
      return;
    }

    // ❗ Preview-Mode → dealer & disti sind garantiert vorhanden
    if (res.preview === true) {
      const dealerHtml =
        res.dealer?.html ?? "<p>Keine Händler-Mail gefunden.</p>";
      const distiHtml = res.disti?.html ?? null;

      const combined = `
        <h3 style="margin-bottom:8px;">Händler-Mail</h3>
        ${dealerHtml}

        ${
          distiHtml
            ? `
              <hr style="margin:20px 0; opacity:0.4;" />
              <h3 style="margin-bottom:8px;">Distributor/KAM-Mail</h3>
              ${distiHtml}
            `
            : ""
        }
      `;

      setPreviewHtml(combined);
      return;
    }

    // ❗ Falls response preview=false zurückkam (darf normal nicht passieren)
    setPreviewHtml("<p>Keine Vorschau verfügbar.</p>");

  } catch (err) {
    console.error("❌ Fehler bei Vorschau:", err);
    setPreviewHtml("<p>Fehler beim Laden der Vorschau.</p>");
  }
}


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <>
      {/* MAIL PREVIEW */}
      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>E-Mail-Vorschau</DialogTitle>
          </DialogHeader>
          <div
            className="prose max-w-none border rounded-md p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
          />
        </DialogContent>
      </Dialog>

      <div className="p-6 space-y-6">
        <Card className={`border rounded-2xl shadow-sm ${theme.border}`}>
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 flex-wrap">
              {/* SEARCH + FILTER */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Suche Händler, Produkt, EAN oder Kd.-Nr."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm w-72"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {["pending", "approved", "rejected", "alle"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={statusFilter === status ? "default" : "outline"}
                      onClick={() => setStatusFilter(status as any)}
                      className="rounded-full text-xs font-medium"
                    >
                      {status === "pending" && <Clock className="w-3.5 h-3.5 mr-1" />}
                      {status === "approved" && <Check className="w-3.5 h-3.5 mr-1" />}
                      {status === "rejected" && <X className="w-3.5 h-3.5 mr-1" />}
                      {status === "alle" && <ListFilter className="w-3.5 h-3.5 mr-1" />}

                      {status === "pending"
                        ? "Offen"
                        : status === "approved"
                        ? "Bestätigt"
                        : status === "rejected"
                        ? "Abgelehnt"
                        : "Alle"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* REFRESH */}
              <Button
                size="sm"
                variant="outline"
                onClick={fetchRows}
                className="rounded-full text-xs px-3"
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Neu laden
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Lade Bestellungen...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Einträge gefunden.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filteredOrders.map((r) => (
                    <motion.div
                      key={r.submission_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="relative flex flex-col p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900">
                            #{r.submission_id} – {r.dealer_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {r.dealer_email ?? "-"}
                            <br />
                            {new Date(r.created_at).toLocaleDateString("de-CH")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-blue-600">
                            {r.total_sum.toFixed(2)} CHF
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {r.status === "approved"
                              ? "✅ Bestätigt"
                              : r.status === "rejected"
                              ? "❌ Abgelehnt"
                              : "⏳ Offen"}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPreview(r.submission_id)}
                          className="text-xs rounded-full border-blue-500 text-blue-600 hover:bg-blue-100/40 bg-white px-3 py-1.5 min-w-[120px]"
                        >
                          <Mail className="w-4 h-4 mr-1 text-blue-600" /> Vorschau
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(r.submission_id, "approved")}
                          className="text-xs rounded-full border-green-600 text-green-700 hover:bg-green-100/40 bg-white px-3 py-1.5"
                        >
                          <Check className="w-4 h-4 mr-1 text-green-600" /> Bestätigen
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(r.submission_id, "rejected")}
                          className="text-xs rounded-full border-red-600 text-red-700 hover:bg-red-100/40 bg-white px-3 py-1.5"
                        >
                          <X className="w-4 h-4 mr-1 text-red-600" /> Ablehnen
                        </Button>

                        <Link href={`/admin/bestellungen/${r.submission_id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs flex items-center gap-1 border-gray-400 text-gray-700 hover:bg-gray-100 bg-white px-3 py-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Im Admin öffnen
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
