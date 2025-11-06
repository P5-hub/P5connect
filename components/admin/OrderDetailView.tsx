"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PencilLine, Save, XCircle } from "lucide-react";

import {
  parseNum,
  calcNettoUPE,
  calcPOI,
  calcInvestByRule,
} from "@/lib/helpers/calcHelpers";
import { useOptimisticSave } from "@/lib/hooks/useOptimisticSave";

/* Typen */
type Distributor = {
  id: string;
  code?: string | null;
  name?: string | null;
  email?: string | null;
  invest_rule?: string | null;
};

type ViewRow = {
  // Submission / Kopf
  submission_id: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;

  dealer_name?: string | null;
  dealer_email?: string | null;

  // Item
  item_id: number;
  product_id: number | null;
  menge: number | null;

  preis: number | null;                  // EK neu (Händlerpreis)
  calc_price_on_invoice: number | null;  // POI neu (aus EK neu berechnet)
  invest: number | null;

  lowest_price_brutto: number | null;
  lowest_price_netto: number | null;
  lowest_price_source: string | null;
  lowest_price_source_custom: string | null;
  margin_street: number | null;

  product_name: string | null;
  ean: string | null;
  retail_price: number | null;
  vrg: number | null;

  dealer_invoice_price: number | null;   // EK alt (falls vorhanden)
  price_on_invoice: number | null;       // POI alt

  // wichtig fürs Patchen:
  distributor_id?: string | null;
};

type SubmissionBundle = {
  head: {
    submission_id: number;
    created_at: string;
    status: "pending" | "approved" | "rejected" | null;
    dealer_name?: string | null;
    dealer_email?: string | null;
  };
  items: ViewRow[];
};

/* ---------- ItemRow ---------- */
function ItemRow({
  row,
  supabase,
  distributors,
  refresh,
  submissionStatus,
}: {
  row: ViewRow;
  supabase: ReturnType<typeof createClient>;
  distributors: Distributor[];
  refresh: () => Promise<void>;
  submissionStatus: "pending" | "approved" | "rejected" | null;
}) {
  const isLocked = submissionStatus !== "pending";
  const { optimisticUpdate } = useOptimisticSave(supabase, refresh);

  // Basen
  const retail = parseNum(row.retail_price);
  const vrg = parseNum(row.vrg);
  const ekAlt = parseNum(row.dealer_invoice_price);
  const poiAlt = parseNum(row.price_on_invoice ?? ekAlt); // Fallback: wenn price_on_invoice leer, nimm dealer_invoice_price
  const nettoUpe = calcNettoUPE(retail, vrg) ?? 0;

  // lokale States
  const [isEditing, setIsEditing] = useState(false);
  const [streetBrutto, setStreetBrutto] = useState<number>(parseNum(row.lowest_price_brutto));
  const [streetNetto, setStreetNetto] = useState<number>(parseNum(row.lowest_price_netto));
  const [priceNew, setPriceNew] = useState<number>(parseNum(row.preis));
  const [investVal, setInvestVal] = useState<number>(parseNum(row.invest));
  const [marginStreet, setMarginStreet] = useState<number | null>(
    row.margin_street == null ? null : Number(row.margin_street)
  );
  const [source, setSource] = useState<string>(row.lowest_price_source || "");
  const [sourceCustom, setSourceCustom] = useState<string>(row.lowest_price_source_custom || "");
  const [distId, setDistId] = useState<string | null>(row.distributor_id ?? null);

  // Sync von Server
  useEffect(() => {
    if (isEditing) return;
    setStreetBrutto(parseNum(row.lowest_price_brutto));
    setStreetNetto(parseNum(row.lowest_price_netto));
    setPriceNew(parseNum(row.preis));
    setInvestVal(parseNum(row.invest));
    setMarginStreet(row.margin_street == null ? null : Number(row.margin_street));
    setSource(row.lowest_price_source || "");
    setSourceCustom(row.lowest_price_source_custom || "");
    setDistId(row.distributor_id ?? null);
  }, [row, isEditing]);

  const savePatch = useCallback(
    async (patch: Partial<ViewRow> & { distributor_id?: string | null }) => {
      const payload: Record<string, any> = {};

      if (patch.preis !== undefined) payload.preis = patch.preis;
      if (patch.invest !== undefined) payload.invest = patch.invest;
      if (patch.calc_price_on_invoice !== undefined) payload.calc_price_on_invoice = patch.calc_price_on_invoice;

      if (patch.lowest_price_brutto !== undefined) payload.lowest_price_brutto = patch.lowest_price_brutto;
      if (patch.lowest_price_netto !== undefined) payload.lowest_price_netto = patch.lowest_price_netto;
      if (patch.margin_street !== undefined) payload.margin_street = patch.margin_street;

      if (patch.lowest_price_source !== undefined) payload.lowest_price_source = patch.lowest_price_source;
      if (patch.lowest_price_source_custom !== undefined) payload.lowest_price_source_custom = patch.lowest_price_source_custom;

      if (patch.distributor_id !== undefined) payload.distributor_id = patch.distributor_id;

      // Optimistic UI
      optimisticUpdate(row.item_id, row as any, patch as any);

      // DB-Update
      await supabase.from("submission_items").update(payload).eq("item_id", row.item_id);

      // leichter Delay, dann Reload
      await new Promise((r) => setTimeout(r, 200));
      await refresh();
    },
    [row, supabase, refresh, optimisticUpdate]
  );

  /* ---- Change-Handler ---- */

  // 1) Streetprice brutto -> netto, MarginStreet neu berechnen
  const onStreetBruttoChange = (val: string) => {
    const brutto = parseNum(val);
    setStreetBrutto(brutto);

    const netto = brutto ? brutto / 1.081 - vrg : 0;
    const nettoRounded = Number(netto.toFixed(2));
    setStreetNetto(nettoRounded);

    const m = nettoRounded && priceNew ? ((nettoRounded - priceNew) / nettoRounded) * 100 : null;
    setMarginStreet(m == null ? null : Number(m.toFixed(1)));
  };
  const blurSaveStreet = async () => {
    await savePatch({
      lowest_price_brutto: Number(streetBrutto.toFixed(2)),
      lowest_price_netto: Number(streetNetto.toFixed(2)),
      margin_street: marginStreet == null ? null : Number(marginStreet.toFixed(1)),
    });
  };

  // 2) Marge auf Street (%) -> EK neu + Invest
  const onMarginStreetChange = (val: string) => {
    const target = parseNum(val);
    setMarginStreet(target);

    if (!streetNetto || streetNetto <= 0) return;

    // EK neu aus StreetNetto & Zielmarge
    const ekNeu = Number((streetNetto * (1 - target / 100)).toFixed(2));
    setPriceNew(ekNeu);

    // Invest = POI alt - POI neu (POI neu aus EK neu)
    const investNeu = Number((poiAlt - calcPOI(ekNeu)).toFixed(2));
    setInvestVal(investNeu);
  };
  const blurSaveMarginStreet = async () => {
    const poiNeu = calcPOI(priceNew);
    await savePatch({
      preis: Number(priceNew.toFixed(2)),
      invest: Number(investVal.toFixed(2)),
      calc_price_on_invoice: Number(poiNeu.toFixed(2)),
      margin_street: marginStreet == null ? null : Number(marginStreet.toFixed(1)),
      lowest_price_brutto: Number(streetBrutto.toFixed(2)),
      lowest_price_netto: Number(streetNetto.toFixed(2)),
    });
  };

  // 3) EK neu -> Invest + MargeStreet (auch wenn kein Streetprice vorhanden)
  const onPriceChange = (val: string) => {
    const p = parseNum(val);
    if (p <= 0) return;
    setPriceNew(p);

    // Marge Street nur, wenn StreetNetto vorhanden
    const mStreet = streetNetto ? ((streetNetto - p) / streetNetto) * 100 : null;
    setMarginStreet(mStreet == null ? null : Number(mStreet.toFixed(1)));

    // Invest immer berechnen: poiAlt - calcPOI(preisNeu)
    const poiNeu = calcPOI(p);
    const investNeu = Number((poiAlt - poiNeu).toFixed(2));
    setInvestVal(investNeu);
  };
  const blurSavePrice = async () => {
    const poiNeu = calcPOI(priceNew);
    const investNeu = Number((poiAlt - poiNeu).toFixed(2));
    await savePatch({
      preis: Number(priceNew.toFixed(2)),
      invest: investNeu,
      calc_price_on_invoice: Number(poiNeu.toFixed(2)),
      margin_street: marginStreet == null ? null : Number(marginStreet.toFixed(1)),
      lowest_price_brutto: Number(streetBrutto.toFixed(2)),
      lowest_price_netto: Number(streetNetto.toFixed(2)),
    });
  };

  // 4) Invest -> EK neu + MargeStreet
  const onInvestChange = (val: string) => {
    const inv = parseNum(val);
    setInvestVal(inv);

    // invest = poiAlt - poiNeu  => poiNeu = poiAlt - invest
    const poiNeu = poiAlt - inv;

    // EK neu aus POI neu: price = poi / (0.865*0.97) * 0.92
    const ekNeu = Number(((poiNeu / (0.865 * 0.97)) * 0.92).toFixed(2));
    setPriceNew(ekNeu);

    const mStreet = streetNetto && ekNeu ? ((streetNetto - ekNeu) / streetNetto) * 100 : null;
    setMarginStreet(mStreet == null ? null : Number(mStreet.toFixed(1)));
  };
  const blurSaveInvest = async () => {
    await savePatch({
      invest: Number(investVal.toFixed(2)),
      preis: Number(priceNew.toFixed(2)),
      calc_price_on_invoice: Number(calcPOI(priceNew).toFixed(2)),
      margin_street: marginStreet == null ? null : Number(marginStreet.toFixed(1)),
    });
  };

  // 5) Quelle
  const blurSaveSource = async () => {
    await savePatch({
      lowest_price_source: source || null,
      lowest_price_source_custom:
        source === "Andere" && sourceCustom.trim() !== "" ? sourceCustom : null,
    });
  };

  // 6) Distributor (berechnet Invest gemäss Regel)
  const onDistributorChange = async (newId: string | null) => {
    setDistId(newId);
    const rule = distributors.find((d) => d.id === newId)?.invest_rule || "default";
    const investNew = Number(calcInvestByRule(rule, priceNew, poiAlt).toFixed(2));
    setInvestVal(investNew);

    await savePatch({
      distributor_id: newId,
      invest: investNew,
      preis: Number(priceNew.toFixed(2)),
      calc_price_on_invoice: Number(calcPOI(priceNew).toFixed(2)),
      margin_street: marginStreet == null ? null : Number(marginStreet.toFixed(1)),
    });
  };

  const margeZumUpe = useMemo(() => {
    return nettoUpe ? (((nettoUpe - (priceNew || 0)) / nettoUpe) * 100) : null;
  }, [nettoUpe, priceNew]);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
      {/* Kopf */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-xs text-gray-900">{row.product_name}</p>
          <p className="text-[11px] text-gray-500">EAN: {row.ean ?? "–"} · Menge: {row.menge ?? "–"}</p>
        </div>

        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isLocked}
            className="h-7 px-2 text-[11px] rounded-full"
            onClick={() => !isLocked && setIsEditing(true)}
          >
            <PencilLine className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => setIsEditing(false)}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => {
                setIsEditing(false);
                // Reset auf Serverwerte
                setStreetBrutto(parseNum(row.lowest_price_brutto));
                setStreetNetto(parseNum(row.lowest_price_netto));
                setPriceNew(parseNum(row.preis));
                setInvestVal(parseNum(row.invest));
                setMarginStreet(row.margin_street == null ? null : Number(row.margin_street));
                setSource(row.lowest_price_source || "");
                setSourceCustom(row.lowest_price_source_custom || "");
                setDistId(row.distributor_id ?? null);
              }}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Werte */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t pt-2 border-gray-200">
        {/* UPE */}
        <div className="col-span-2 font-medium text-gray-700 mb-1">UPE / Verkaufspreise</div>
        <div>
          <span className="text-gray-500">UPE brutto:</span>{" "}
          {retail ? (
            <>
              {retail.toFixed(2)} CHF{" "}
              <span className="text-gray-400 text-[10px]">
                (−{(retail - retail / 1.081).toFixed(2)} MwSt, −{vrg.toFixed(2)} VRG)
              </span>
            </>
          ) : "–"}
        </div>
        <div className="text-right">
          <span className="text-gray-500">UPE netto:</span>{" "}
          {nettoUpe ? <span className="text-gray-700 font-medium">{nettoUpe.toFixed(2)} CHF</span> : "–"}
        </div>

        {/* Altpreise */}
        <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">Händlerpreise (alt)</div>
        <div><span className="text-gray-500">EK alt:</span> {ekAlt ? `${ekAlt.toFixed(2)} CHF` : "–"}</div>
        <div className="text-right"><span className="text-gray-500">EK Disti alt (POI alt):</span> {poiAlt ? `${poiAlt.toFixed(2)} CHF` : "–"}</div>

        <div className="col-span-2 border-b border-gray-200 my-1" />

        {/* Street / Neu */}
        <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">Streetprice / Händlerpreis (neu)</div>

        {/* Street brutto */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Streetprice brutto</label>
          <input
            disabled={!isEditing}
            type="number"
            step="0.01"
            value={Number.isFinite(streetBrutto) ? streetBrutto : 0}
            onChange={(e) => onStreetBruttoChange(e.target.value)}
            onBlur={blurSaveStreet}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
          <div className="text-[10px] text-gray-400 mt-1">
            (−{(streetBrutto - streetBrutto / 1.081).toFixed(2)} MwSt, −{vrg.toFixed(2)} VRG)
          </div>
        </div>

        {/* Street netto */}
        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">Streetprice netto</label>
          <div className="text-gray-700 font-medium">
            {streetNetto ? `${streetNetto.toFixed(2)} CHF` : "–"}
          </div>
        </div>

        {/* Invest */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Invest (CHF)</label>
          <input
            disabled={!isEditing}
            type="number"
            step="0.01"
            value={Number.isFinite(investVal) ? investVal : 0}
            onChange={(e) => onInvestChange(e.target.value)}
            onBlur={blurSaveInvest}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
        </div>

        {/* Marge auf Street */}
        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">Marge auf Street (%)</label>
          <input
            disabled={!isEditing}
            type="number"
            step="0.1"
            value={marginStreet ?? ""}
            onChange={(e) => onMarginStreetChange(e.target.value)}
            onBlur={blurSaveMarginStreet}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
        </div>

        {/* EK neu */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Händlerpreis / EK neu (CHF)</label>
          <input
            disabled={!isEditing}
            type="number"
            step="0.01"
            value={Number.isFinite(priceNew) ? priceNew.toFixed(2) : ""}
            onChange={(e) => onPriceChange(e.target.value)}
            onBlur={blurSavePrice}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
        </div>

        {/* Marge zum UPE netto */}
        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">Marge zum UPE netto</label>
          <div className="text-gray-700 font-medium">
            {margeZumUpe == null ? "–" : `${margeZumUpe.toFixed(1)} %`}
          </div>
        </div>

        {/* Quelle */}
        <div className="col-span-2 mt-3 font-medium text-gray-700 mb-1">Günstigster Anbieter (Markt)</div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Anbieter / Quelle</label>
          <select
            disabled={!isEditing}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onBlur={blurSaveSource}
            className="w-full h-7 border rounded text-xs px-2 bg-white"
          >
            <option value="">Bitte auswählen</option>
            <option value="Digitec">Digitec</option>
            <option value="Mediamarkt">Mediamarkt</option>
            <option value="Interdiscount">Interdiscount</option>
            <option value="Fnac">Fnac</option>
            <option value="Brack">Brack</option>
            <option value="Fust">Fust</option>
            <option value="Andere">Andere</option>
          </select>

          {source === "Andere" && (
            <div className="mt-1">
              <input
                disabled={!isEditing}
                type="text"
                placeholder="Name des Händlers (Pflichtfeld)"
                value={sourceCustom}
                onChange={(e) => setSourceCustom(e.target.value)}
                onBlur={blurSaveSource}
                className="w-full h-7 border border-amber-400 rounded text-xs px-2"
              />
            </div>
          )}
        </div>

        {/* Distributor */}
        <div className="col-span-2 mt-2">
          <label className="block text-[11px] text-gray-500 mb-1">Distributor</label>
          <select
            disabled={!isEditing}
            value={distId || ""}
            onChange={(e) => onDistributorChange(e.target.value || null)}
            onBlur={(e) => onDistributorChange(e.target.value || null)}
            className="h-8 text-xs border border-gray-300 rounded-md px-2 w-full bg-white"
          >
            <option value="">– auswählen –</option>
            {distributors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.code ? `(${d.code})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hauptkomponente ---------- */
export default function OrderDetailView({
  submission,
  onStatusChange,
}: {
  submission: { submission_id: number; status: "pending" | "approved" | "rejected" | null };
  onStatusChange?: () => void;
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<ViewRow[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sendingMail, setSendingMail] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("bestellung_dashboard")
      .select("*")
      .eq("submission_id", submission.submission_id)
      .order("item_id", { ascending: true });

    if (!error && data) setRows(data as unknown as ViewRow[]);
  }, [supabase, submission.submission_id]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("distributors")
        .select("id, code, name, email, invest_rule")
        .eq("active", true)
        .order("name", { ascending: true });
      setDistributors((data as Distributor[]) || []);
    })();
  }, [supabase]);

  const bundle: SubmissionBundle | null = useMemo(() => {
    if (rows.length === 0) return null;
    const head = {
      submission_id: rows[0].submission_id,
      created_at: rows[0].created_at,
      status: rows[0].status,
      dealer_name: rows[0].dealer_name,
      dealer_email: rows[0].dealer_email,
    };
    return { head, items: rows };
  }, [rows]);

  const total = useMemo(
    () => rows.reduce((s, r) => s + parseNum(r.preis) * (parseNum(r.menge) || 1), 0),
    [rows]
  );

  if (!bundle) {
    return <div className="text-sm text-gray-500">Keine Produkte gefunden.</div>;
  }

  const { head, items } = bundle;

  return (
    <>
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Bestellung #{head.submission_id} – {head.dealer_name ?? "–"}
              </h3>
              <p className="text-xs text-gray-500">{head.dealer_email ?? "-"}</p>
              <p className="text-[11px] text-gray-400">{new Date(head.created_at).toLocaleDateString("de-CH")}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((it) => (
              <ItemRow
                key={it.item_id}
                row={it}
                supabase={supabase}
                distributors={distributors}
                refresh={refresh}
                submissionStatus={head.status}
              />
            ))}
          </div>

          {/* Summe */}
          <div className="mt-4 flex justify-end text-sm">
            <div className="rounded-lg border px-3 py-2 bg-gray-50">
              <span className="text-gray-600 mr-3">Gesamtbetrag:</span>
              <span className="font-semibold">{total.toFixed(2)} CHF</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* (Optional) E-Mail-Vorschau kann hier geöffnet werden, falls du den Button im Header ergänzen willst */}
      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>E-Mail-Vorschau</DialogTitle></DialogHeader>
          <div
            className="prose max-w-none border rounded-md p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
