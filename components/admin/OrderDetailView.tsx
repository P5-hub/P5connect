"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilLine, Save, XCircle } from "lucide-react";

import {
  parseNum,
  calcNettoUPE,
  calcPOI,
  calcInvestByRule,
} from "@/lib/helpers/calcHelpers";
import { useOptimisticSave } from "@/lib/hooks/useOptimisticSave";
import { useI18n } from "@/lib/i18n/I18nProvider";

/* Typen */
type Distributor = {
  id: string;
  code?: string | null;
  name?: string | null;
  email?: string | null;
  invest_rule?: string | null;
};

type ViewRow = {
  submission_id: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;

  dealer_name?: string | null;
  dealer_email?: string | null;

  item_id: number;
  product_id: number | null;
  menge: number | null;

  preis: number | null;
  calc_price_on_invoice: number | null;
  invest: number | null;

  lowest_price_brutto: number | null;
  lowest_price_netto: number | null;
  lowest_price_source: string | null;
  lowest_price_source_custom: string | null;
  margin_street: number | null;

  product_name: string | null;
  ean: string | null;
  sony_article?: string | null;
  retail_price: number | null;
  vrg: number | null;

  dealer_invoice_price: number | null;
  price_on_invoice: number | null;

  distributor_id?: string | null;

  order_mode?: string | null;
  submission_campaign_id?: number | null;
  campaign_name_snapshot?: string | null;

  pricing_mode?: string | null;
  item_campaign_id?: number | null;
  is_display_item?: boolean | null;
  bonus_relevant?: boolean | null;
  messe_price_netto?: number | null;
  display_price_netto?: number | null;
  pricing_snapshot?: any;

  item_ean?: string | null;
  item_product_name?: string | null;
  item_sony_article?: string | null;
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

const MARKET_SOURCE_OTHER = "Andere";

function getLocale(lang: string) {
  switch (lang) {
    case "de":
      return "de-CH";
    case "en":
      return "en-CH";
    case "fr":
      return "fr-CH";
    case "it":
      return "it-CH";
    case "rm":
      return "rm-CH";
    default:
      return "de-CH";
  }
}

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
  const { t, lang } = useI18n();
  const locale = useMemo(() => getLocale(lang), [lang]);

  const isLocked = submissionStatus !== "pending";
  const { optimisticUpdate } = useOptimisticSave(supabase, refresh);

  const retail = parseNum(row.retail_price);
  const vrg = parseNum(row.vrg);
  const ekAlt = parseNum(row.dealer_invoice_price);
  const poiAlt = parseNum(row.price_on_invoice ?? ekAlt);
  const nettoUpe = calcNettoUPE(retail, vrg) ?? 0;

  const [isEditing, setIsEditing] = useState(false);
  const [qty, setQty] = useState<number>(parseNum(row.menge) || 1);
  const [streetBrutto, setStreetBrutto] = useState<number>(
    parseNum(row.lowest_price_brutto)
  );
  const [streetNetto, setStreetNetto] = useState<number>(
    parseNum(row.lowest_price_netto)
  );
  const [priceNew, setPriceNew] = useState<number>(parseNum(row.preis));
  const [investVal, setInvestVal] = useState<number>(parseNum(row.invest));
  const [marginStreet, setMarginStreet] = useState<number | null>(
    row.margin_street == null ? null : Number(row.margin_street)
  );
  const [source, setSource] = useState<string>(row.lowest_price_source || "");
  const [sourceCustom, setSourceCustom] = useState<string>(
    row.lowest_price_source_custom || ""
  );
  const [distId, setDistId] = useState<string | null>(row.distributor_id ?? null);
  const [priceNewInput, setPriceNewInput] = useState(
    row.preis != null ? row.preis.toString() : ""
  );

  const marketSourceOptions = useMemo(
    () => [
      {
        value: "",
        label: t("adminOrderDetailView.marketSources.placeholder"),
      },
      { value: "Digitec", label: "Digitec" },
      { value: "Mediamarkt", label: "Mediamarkt" },
      { value: "Interdiscount", label: "Interdiscount" },
      { value: "Fnac", label: "Fnac" },
      { value: "Brack", label: "Brack" },
      { value: "Fust", label: "Fust" },
      {
        value: MARKET_SOURCE_OTHER,
        label: t("adminOrderDetailView.marketSources.other"),
      },
    ],
    [t]
  );

  const getPricingModeLabel = useCallback(
    (mode?: string | null) => {
      if (mode === "messe") return t("adminOrderDetailView.badges.messePrice");
      if (mode === "display") return t("adminOrderDetailView.badges.display");
      if (mode === "mixed") return t("adminOrderDetailView.badges.messeDisplay");
      return t("adminOrderDetailView.badges.standard");
    },
    [t]
  );

  const getOrderModeLabel = useCallback(
    (mode?: string | null) => {
      return mode === "messe"
        ? t("adminOrderDetailView.badges.tradeFairOrder")
        : t("adminOrderDetailView.badges.standardOrder");
    },
    [t]
  );

  const getOrderModeShortLabel = useCallback(
    (mode?: string | null) => {
      return mode === "messe"
        ? t("adminOrderDetailView.values.tradeFair")
        : t("adminOrderDetailView.values.standard");
    },
    [t]
  );

  useEffect(() => {
    if (isEditing) return;

    const brutto = parseNum(row.lowest_price_brutto);
    const netto =
      row.lowest_price_netto != null
        ? parseNum(row.lowest_price_netto)
        : brutto
        ? brutto / 1.081 - vrg
        : 0;
    const nettoRounded = Number(netto.toFixed(2));

    const ekNeu = parseNum(row.preis);
    const poiAltVal = parseNum(row.price_on_invoice ?? row.dealer_invoice_price);

    const mStreet =
      nettoRounded && ekNeu
        ? Number((((nettoRounded - ekNeu) / nettoRounded) * 100).toFixed(1))
        : null;

    const investNeu = Number((poiAltVal - calcPOI(ekNeu)).toFixed(2));

    setQty(parseNum(row.menge) || 1);
    setStreetBrutto(brutto);
    setStreetNetto(nettoRounded);
    setPriceNew(ekNeu);
    setPriceNewInput(ekNeu.toFixed(2));
    setMarginStreet(row.margin_street == null ? mStreet : Number(row.margin_street));
    setInvestVal(row.invest == null ? investNeu : parseNum(row.invest));
    setSource(row.lowest_price_source || "");
    setSourceCustom(row.lowest_price_source_custom || "");
    setDistId(row.distributor_id ?? null);
  }, [row, isEditing, vrg]);

  const savePatch = useCallback(
    async (patch: Partial<ViewRow> & { distributor_id?: string | null }) => {
      const payload: Record<string, any> = {};

      if (patch.menge !== undefined) payload.menge = patch.menge;
      if (patch.preis !== undefined) payload.preis = patch.preis;
      if (patch.invest !== undefined) payload.invest = patch.invest;
      if (patch.calc_price_on_invoice !== undefined) {
        payload.calc_price_on_invoice = patch.calc_price_on_invoice;
      }

      if (patch.lowest_price_brutto !== undefined) {
        payload.lowest_price_brutto = patch.lowest_price_brutto;
      }
      if (patch.lowest_price_netto !== undefined) {
        payload.lowest_price_netto = patch.lowest_price_netto;
      }
      if (patch.margin_street !== undefined) {
        payload.margin_street = patch.margin_street;
      }

      if (patch.lowest_price_source !== undefined) {
        payload.lowest_price_source = patch.lowest_price_source;
      }
      if (patch.lowest_price_source_custom !== undefined) {
        payload.lowest_price_source_custom = patch.lowest_price_source_custom;
      }

      if (patch.distributor_id !== undefined) payload.distributor_id = patch.distributor_id;

      optimisticUpdate(row.item_id, row as any, patch as any);

      await supabase.from("submission_items").update(payload).eq("item_id", row.item_id);

      await new Promise((r) => setTimeout(r, 200));
      await refresh();
    },
    [row, supabase, refresh, optimisticUpdate]
  );

  const onStreetBruttoChange = (val: string) => {
    const brutto = parseNum(val);
    setStreetBrutto(brutto);

    const netto = brutto ? brutto / 1.081 - vrg : 0;
    const nettoRounded = Number(netto.toFixed(2));
    setStreetNetto(nettoRounded);

    const m =
      nettoRounded && priceNew ? ((nettoRounded - priceNew) / nettoRounded) * 100 : null;
    setMarginStreet(m == null ? null : Number(m.toFixed(1)));
  };

  const blurSaveStreet = async () => {
    await savePatch({
      lowest_price_brutto: Number(streetBrutto.toFixed(2)),
      lowest_price_netto: Number(streetNetto.toFixed(2)),
      margin_street: marginStreet == null ? null : Number(marginStreet.toFixed(1)),
    });
  };

  const onMarginStreetChange = (val: string) => {
    const target = parseNum(val);
    setMarginStreet(target);

    if (!streetNetto || streetNetto <= 0) return;

    const ekNeu = Number((streetNetto * (1 - target / 100)).toFixed(2));
    setPriceNew(ekNeu);
    setPriceNewInput(ekNeu.toFixed(2));

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

  const onPriceChange = (p: number) => {
    if (p <= 0) return;
    setPriceNew(p);

    const mStreet = streetNetto ? ((streetNetto - p) / streetNetto) * 100 : null;
    setMarginStreet(mStreet == null ? null : Number(mStreet.toFixed(1)));

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

  const onInvestChange = (val: string) => {
    const inv = parseNum(val);
    setInvestVal(inv);

    const poiNeu = poiAlt - inv;
    const ekNeu = Number(((poiNeu / (0.865 * 0.97)) * 0.92).toFixed(2));
    setPriceNew(ekNeu);
    setPriceNewInput(ekNeu.toFixed(2));

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

  const blurSaveSource = async () => {
    await savePatch({
      lowest_price_source: source || null,
      lowest_price_source_custom:
        source === MARKET_SOURCE_OTHER && sourceCustom.trim() !== "" ? sourceCustom : null,
    });
  };

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

  const blurSaveQty = async () => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setQty(safeQty);
    await savePatch({
      menge: safeQty,
    });
  };

  const margeZumUpe = useMemo(() => {
    return nettoUpe ? ((nettoUpe - (priceNew || 0)) / nettoUpe) * 100 : null;
  }, [nettoUpe, priceNew]);

  const displayModeLabel = getPricingModeLabel(row.pricing_mode);
  const campaignLabel =
    row.campaign_name_snapshot ||
    (row.item_campaign_id
      ? t("adminOrderDetailView.values.campaignNumber", {
          id: String(row.item_campaign_id),
        })
      : null);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-xs text-gray-900">
            {row.item_product_name ||
              row.product_name ||
              t("adminOrderDetailView.fallbacks.product")}
          </p>

          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
              {getOrderModeLabel(row.order_mode)}
            </span>

            {row.pricing_mode === "messe" && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                {t("adminOrderDetailView.badges.messePrice")}
              </span>
            )}

            {row.pricing_mode === "display" && (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-100">
                {t("adminOrderDetailView.badges.display")}
              </span>
            )}

            {row.pricing_mode === "mixed" && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-100">
                {t("adminOrderDetailView.badges.messeDisplay")}
              </span>
            )}

            {(!row.pricing_mode || row.pricing_mode === "standard") && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                {t("adminOrderDetailView.badges.standard")}
              </span>
            )}

            {campaignLabel && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
                {campaignLabel}
              </span>
            )}

            {row.bonus_relevant === false && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-rose-100">
                {t("adminOrderDetailView.badges.notBonusRelevant")}
              </span>
            )}
          </div>

          <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-2 flex-wrap">
            <span>
              {t("adminOrderDetailView.fields.ean")}: {row.item_ean || row.ean || "–"}
            </span>
            <span>·</span>
            <span>
              {t("adminOrderDetailView.fields.mode")}: {displayModeLabel}
            </span>
            <span>·</span>
            <span>{t("adminOrderDetailView.fields.quantity")}:</span>

            {isEditing ? (
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(parseNum(e.target.value) || 1)}
                onBlur={blurSaveQty}
                className="w-14 h-6 border rounded text-xs text-right px-1"
              />
            ) : (
              <span className="font-medium">{row.menge ?? "–"}</span>
            )}
          </div>
        </div>

        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isLocked}
            className="h-7 px-2 text-[11px] rounded-full"
            onClick={() => !isLocked && setIsEditing(true)}
          >
            <PencilLine className="w-3.5 h-3.5 mr-1" />
            {t("adminOrderDetailView.actions.edit")}
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => setIsEditing(false)}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {t("adminOrderDetailView.actions.done")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => {
                setIsEditing(false);
                setQty(parseNum(row.menge) || 1);
                setStreetBrutto(parseNum(row.lowest_price_brutto));
                setStreetNetto(parseNum(row.lowest_price_netto));
                setPriceNew(parseNum(row.preis));
                setPriceNewInput(parseNum(row.preis).toFixed(2));
                setInvestVal(parseNum(row.invest));
                setMarginStreet(
                  row.margin_street == null ? null : Number(row.margin_street)
                );
                setSource(row.lowest_price_source || "");
                setSourceCustom(row.lowest_price_source_custom || "");
                setDistId(row.distributor_id ?? null);
              }}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              {t("adminOrderDetailView.actions.cancel")}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t pt-2 border-gray-200">
        <div className="col-span-2 font-medium text-gray-700 mb-1">
          {t("adminOrderDetailView.sections.campaignLogic")}
        </div>
        <div>
          <span className="text-gray-500">{t("adminOrderDetailView.fields.pricingMode")}:</span>{" "}
          <span className="font-medium text-gray-700">{displayModeLabel}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">{t("adminOrderDetailView.fields.orderMode")}:</span>{" "}
          <span className="font-medium text-gray-700">
            {getOrderModeShortLabel(row.order_mode)}
          </span>
        </div>

        <div>
          <span className="text-gray-500">{t("adminOrderDetailView.fields.messePriceNet")}:</span>{" "}
          {row.messe_price_netto != null
            ? Number(row.messe_price_netto).toLocaleString(locale, {
                style: "currency",
                currency: "CHF",
              })
            : "–"}
        </div>
        <div className="text-right">
          <span className="text-gray-500">{t("adminOrderDetailView.fields.displayPriceNet")}:</span>{" "}
          {row.display_price_netto != null
            ? Number(row.display_price_netto).toLocaleString(locale, {
                style: "currency",
                currency: "CHF",
              })
            : "–"}
        </div>

        <div className="col-span-2 border-b border-gray-200 my-1" />

        <div className="col-span-2 font-medium text-gray-700 mb-1">
          {t("adminOrderDetailView.sections.rrpSalesPrices")}
        </div>
        <div>
          <span className="text-gray-500">{t("adminOrderDetailView.fields.rrpGross")}:</span>{" "}
          {retail ? (
            <>
              {retail.toLocaleString(locale, {
                style: "currency",
                currency: "CHF",
              })}{" "}
              <span className="text-gray-400 text-[10px]">
                (
                {t("adminOrderDetailView.fields.vatShort", {
                  amount: (retail - retail / 1.081).toFixed(2),
                })}
                ,{" "}
                {t("adminOrderDetailView.fields.vrgShort", {
                  amount: vrg.toFixed(2),
                })}
                )
              </span>
            </>
          ) : (
            "–"
          )}
        </div>
        <div className="text-right">
          <span className="text-gray-500">{t("adminOrderDetailView.fields.rrpNet")}:</span>{" "}
          {nettoUpe ? (
            <span className="text-gray-700 font-medium">
              {nettoUpe.toLocaleString(locale, {
                style: "currency",
                currency: "CHF",
              })}
            </span>
          ) : (
            "–"
          )}
        </div>

        <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">
          {t("adminOrderDetailView.sections.oldDealerPrices")}
        </div>
        <div>
          <span className="text-gray-500">{t("adminOrderDetailView.fields.oldEk")}:</span>{" "}
          {ekAlt
            ? ekAlt.toLocaleString(locale, {
                style: "currency",
                currency: "CHF",
              })
            : "–"}
        </div>
        <div className="text-right">
          <span className="text-gray-500">{t("adminOrderDetailView.fields.oldDistiEkPoi")}:</span>{" "}
          {poiAlt
            ? poiAlt.toLocaleString(locale, {
                style: "currency",
                currency: "CHF",
              })
            : "–"}
        </div>

        <div className="col-span-2 border-b border-gray-200 my-1" />

        <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">
          {t("adminOrderDetailView.sections.streetPriceNewDealerPrice")}
        </div>

        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.streetPriceGross")}
          </label>
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
            ({t("adminOrderDetailView.fields.vatShort", {
              amount: (streetBrutto - streetBrutto / 1.081).toFixed(2),
            })}
            , {t("adminOrderDetailView.fields.vrgShort", { amount: vrg.toFixed(2) })})
          </div>
        </div>

        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.streetPriceNet")}
          </label>
          <div className="text-gray-700 font-medium">
            {streetNetto
              ? streetNetto.toLocaleString(locale, {
                  style: "currency",
                  currency: "CHF",
                })
              : "–"}
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.investChf")}
          </label>
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

        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.marginOnStreet")}
          </label>
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

        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.newDealerPrice")}
          </label>
          <input
            disabled={!isEditing}
            type="text"
            value={priceNewInput}
            onChange={(e) => {
              const val = e.target.value;
              setPriceNewInput(val);

              const num = parseNum(val);
              if (!isNaN(num)) onPriceChange(num);
            }}
            onBlur={() => {
              const num = parseNum(priceNewInput);
              const fixed = num.toFixed(2);
              setPriceNewInput(fixed);
              blurSavePrice();
            }}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
        </div>

        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.marginToRrpNet")}
          </label>
          <div className="text-gray-700 font-medium">
            {margeZumUpe == null ? "–" : `${margeZumUpe.toFixed(1)} %`}
          </div>
        </div>

        <div className="col-span-2 mt-3 font-medium text-gray-700 mb-1">
          {t("adminOrderDetailView.sections.lowestMarketProvider")}
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.providerSource")}
          </label>
          <select
            disabled={!isEditing}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onBlur={blurSaveSource}
            className="w-full h-7 border rounded text-xs px-2 bg-white"
          >
            {marketSourceOptions.map((option) => (
              <option key={option.value || "placeholder"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {source === MARKET_SOURCE_OTHER && (
            <div className="mt-1">
              <input
                disabled={!isEditing}
                type="text"
                placeholder={t("adminOrderDetailView.fields.customProviderPlaceholder")}
                value={sourceCustom}
                onChange={(e) => setSourceCustom(e.target.value)}
                onBlur={blurSaveSource}
                className="w-full h-7 border border-amber-400 rounded text-xs px-2"
              />
            </div>
          )}
        </div>

        <div className="col-span-2 mt-2">
          <label className="block text-[11px] text-gray-500 mb-1">
            {t("adminOrderDetailView.fields.distributor")}
          </label>
          <select
            disabled={!isEditing}
            value={distId || ""}
            onChange={(e) => onDistributorChange(e.target.value || null)}
            onBlur={(e) => onDistributorChange(e.target.value || null)}
            className="h-8 text-xs border border-gray-300 rounded-md px-2 w-full bg-white"
          >
            <option value="">{t("adminOrderDetailView.fields.distributorPlaceholder")}</option>
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

export default function OrderDetailView({
  submission,
  onStatusChange,
}: {
  submission: {
    submission_id: number;
    status: "pending" | "approved" | "rejected" | null;
  };
  onStatusChange?: () => void;
}) {
  const supabase = createClient();
  const { t, lang } = useI18n();
  const locale = useMemo(() => getLocale(lang), [lang]);

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

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    return (
      <div className="text-sm text-gray-500">
        {t("adminOrderDetailView.empty.noProducts")}
      </div>
    );
  }

  const { head, items } = bundle;

  return (
    <>
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {t("adminOrderDetailView.header.title", {
                  id: String(head.submission_id),
                  dealer: head.dealer_name ?? "–",
                })}
              </h3>
              <p className="text-xs text-gray-500">{head.dealer_email ?? "-"}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(head.created_at).toLocaleDateString(locale)}
              </p>
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

          <div className="mt-4 flex justify-end text-sm">
            <div className="rounded-lg border px-3 py-2 bg-gray-50">
              <span className="text-gray-600 mr-3">
                {t("adminOrderDetailView.footer.totalAmount")}
              </span>
              <span className="font-semibold">
                {total.toLocaleString(locale, {
                  style: "currency",
                  currency: "CHF",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("adminOrderDetailView.dialog.mailPreview")}</DialogTitle>
          </DialogHeader>
          <div
            className="prose max-w-none border rounded-md p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}