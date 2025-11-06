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

  // --- Daten laden ---
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

  // --- Filter / Suche ---
  const filteredRows = useMemo(() => {
    let data = rows;
    if (statusFilter !== "alle") {
      data = data.filter((r) =>
        statusFilter === "pending"
          ? !r.status || r.status === "pending"
          : r.status === statusFilter
      );
    }
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      data = data.filter((r) =>
        [r.dealer_name, r.product_name, r.ean, r.dealer_login_nr]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return data;
  }, [rows, statusFilter, searchQuery]);

  // --- Status-Update ---
  async function updateStatus(submissionId: number, status: "pending" | "approved" | "rejected") {
    await supabase.from("submissions").update({ status }).eq("submission_id", submissionId);
    await fetchRows();
  }

  // --- Mail-Vorschau ---
  async function openPreview(submissionId: number) {
    const { html } = await sendOrderNotification({ submissionId, stage: "confirmed", preview: true });
    setPreviewHtml(html ?? "<p>Keine Vorschau verfügbar.</p>");
  }

  return (
    <>
      {/* Vorschau-Dialog */}
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
              {/* Filterleiste */}
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

              {/* Aktionen */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchRows}
                  className="rounded-full text-xs px-3"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Neu laden
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Lade Bestellungen...</p>
            ) : filteredRows.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Einträge gefunden.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filteredRows.map((r) => (
                    <motion.div
                      key={r.submission_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="relative flex flex-col p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
                    >
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
                            {(r.total_sum || 0).toFixed(2)} CHF
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

                      {/* 🔹 Aktionsbuttons */}
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

                        {/* 🟢 Neuer Button */}
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
