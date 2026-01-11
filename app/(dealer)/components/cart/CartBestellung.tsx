"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calcInvestByRule } from "@/lib/helpers/calcHelpers";
import Link from "next/link";
import { Copy } from "lucide-react";
import ProjectFileUpload from "@/app/(dealer)/components/project/ProjectFileUpload";
import { useTheme } from "@/lib/theme/ThemeContext";





import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ShoppingCart,
  Trash2,
  Star,
  Tag,
  Hash,
  User,
  Phone,
  BadgeInfo,
} from "lucide-react";

import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

import type { Database } from "@/types/supabase";
import type { CartItem } from "@/app/(dealer)/types/CartItem";

type Disti = { id: string; code: string; name: string; invest_rule: string | null };

type SubmissionInsert =
  Database["public"]["Tables"]["submissions"]["Insert"];
type SubmissionItemInsert =
  Database["public"]["Tables"]["submission_items"]["Insert"];

/* ------------------------------------------------------------------
   💡 Hilfsfunktionen
------------------------------------------------------------------- */





const toInt = (v: any) => (Number.isFinite(+v) ? Math.round(+v) : 0);
const norm = (v: any) => (typeof v === "string" ? v.trim() : v ?? "");
const safeNum = (v: any) =>
  isFinite(v) && !isNaN(v) ? parseFloat(Number(v).toFixed(2)) : 0;

const mapRequestedDelivery = (m: "sofort" | "termin") =>
  m === "termin" ? "scheduled" : "immediately";

const normalizeRequestedDate = (
  mode: "sofort" | "termin",
  dateStr: string
) => {
  if (mode !== "termin") return null;
  const s = (dateStr || "").trim();
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

const getEkNormal = (item: CartItem) =>
  toInt(
    (item as any).dealer_invoice_price ??
      (item as any).product_price ??
      (item as any).ek_normal ??
      (item as any).ek ??
      0
  );

const pickPreferred = (item: CartItem, allowed: string[]) => {
  if (!allowed || allowed.length === 0) return "";
  const ph2 = ((item as any).ph2 ?? "").toLowerCase();

  if (ph2.includes("tv") || ph2.includes("tme"))
    return allowed.find((a) => a.toLowerCase().includes("ep")) || allowed[0];

  if (ph2.includes("ht") || ph2.includes("soundbar"))
    return allowed.find((a) => a.toLowerCase().includes("ep")) || allowed[0];

  if (ph2.includes("dim"))
    return allowed.find((a) => a.toLowerCase().includes("engel")) || allowed[0];

  if (ph2.includes("pds") || ph2.includes("pa"))
    return allowed.find((a) => a.toLowerCase().includes("semi")) || allowed[0];

  return allowed[0];
};




/* ------------------------------------------------------------------
   🧱 PRODUKTKARTE
------------------------------------------------------------------- */

function ProductCard({
  item,
  index,
  distis,
  updateItem,
  removeFromCart,
}: {
  item: CartItem;
  index: number;
  distis: Disti[];
  updateItem: (
    form: "verkauf" | "bestellung" | "projekt" | "support" | "sofortrabatt" | "cashback",
    index: number,
    updates: Partial<any>
  ) => void;
  removeFromCart: (index: number) => void;
}) {
  const allowed = Array.isArray((item as any).allowedDistis)
    ? (item as any).allowedDistis
    : [];

  const ek = getEkNormal(item);
  const price = toInt((item as any).price ?? 0);
  const quantity = toInt((item as any).quantity ?? 1);

  const showSavings = ek > 0 && price > 0 && price < ek;
  const savedCHF = showSavings ? (ek - price) : 0;
  const savedPercent = showSavings
    ? Math.round(((ek - price) / ek) * 100)
    : 0;

  return (
    <div
      className={`
        bg-white
        border
        ${allowed.length ? "border-amber-200 border-l-amber-400" : "border-blue-200 border-l-blue-600"}
        border-l-[6px]
        rounded-r-xl
        p-3 sm:p-4
        space-y-2 sm:space-y-3
        mb-3 sm:mb-4
        shadow-sm
      `}
    >

      {/* linker Akzentstreifen */}
      <div
        className={`
          absolute left-0 top-0 h-full w-[3px] rounded-l-xl
          ${allowed.length ? "bg-amber-400" : "bg-blue-600"}
        `}
      />


      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate flex items-center gap-2">
            {item.product_name || (item as any).sony_article || "Unbekannt"}

            {allowed.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600 text-[11px] font-semibold border border-amber-300 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3" />
                Spezialvertrieb
              </span>
            )}
          </p>

          <p className="text-[11px] text-gray-500">EAN: {item.ean || "-"}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(index)}
          className="h-7 w-7"
          title="Entfernen"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      {/* Menge + Preis */}
      <div className="grid grid-cols-2 gap-2 text-center">
        {/* Menge */}
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">
            Anzahl
          </label>

          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              updateItem("bestellung", index, {
                quantity: Math.max(1, toInt(e.target.value)),
              })
            }
            className="text-center h-8 text-xs"
          />
        </div>

        {/* Preis */}
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">
            Preis (CHF)
          </label>

          <Input
            type="number"
            value={price}
            onChange={(e) =>
              updateItem("bestellung", index, {
                price: toInt(e.target.value),
              })
            }
            className="text-center h-8 text-xs"
          />

          <p className="text-[11px] text-gray-500 mt-1">
            EK normal:&nbsp;
            <span className="font-medium text-blue-600">
              {ek ? `${ek} CHF` : "-"}
            </span>
          </p>

          {showSavings && (
            <div className="flex items-center justify-center gap-1 mt-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-lg py-1">
              <Tag className="w-3.5 h-3.5" />
              {savedCHF} CHF gespart ({savedPercent}%)
            </div>
          )}
        </div>
      </div>

      {/* Streetprice */}
      <div className="mt-4 border-t pt-2 text-xs text-gray-700">
        <label className="block text-gray-500 mb-1">
          Günstigster Anbieter
        </label>

        <Select
          value={(item as any).lowest_price_source ?? ""}
          onValueChange={(val) => {
            updateItem("bestellung", index, {
              lowest_price_source: val,
              lowest_price_source_custom:
                val === "Andere"
                  ? (item as any).lowest_price_source_custom ?? ""
                  : null,
            });
          }}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Bitte auswählen" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="Digitec">Digitec</SelectItem>
            <SelectItem value="Mediamarkt">Mediamarkt</SelectItem>
            <SelectItem value="Interdiscount">Interdiscount</SelectItem>
            <SelectItem value="Fnac">Fnac</SelectItem>
            <SelectItem value="Brack">Brack</SelectItem>
            <SelectItem value="Fust">Fust</SelectItem>
            <SelectItem value="Andere">Andere</SelectItem>
          </SelectContent>
        </Select>

        {/* Händlername bei "Andere" */}
        {(item as any).lowest_price_source === "Andere" && (
          <div className="mt-2">
            <label className="block text-gray-500 mb-1">
              Bitte Namen des Anbieters angeben *
            </label>

            <Input
              placeholder="Name des Händlers"
              value={(item as any).lowest_price_source_custom ?? ""}
              onChange={(e) =>
                updateItem("bestellung", index, {
                  lowest_price_source_custom: e.target.value,
                })
              }
              className="text-sm border-amber-400 focus:border-amber-500"
            />

            <p className="text-[11px] text-amber-600 mt-1">
              Pflichtfeld bei Auswahl von „Andere“ — bitte genaue Angabe.
            </p>
          </div>
        )}

        {/* Streetprice CHF */}
        <label className="block text-gray-500 mb-1 mt-3">
          Günstigster Preis (inkl. MwSt.)
        </label>

        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={(item as any).lowest_price_brutto ?? ""}
          onChange={(e) =>
            updateItem("bestellung", index, {
              lowest_price_brutto:
                e.target.value === ""
                  ? null
                  : parseFloat(e.target.value) || null,
            })
          }
          className="text-sm"
        />
      </div>

      {/* Spezial-Distributor */}
      {allowed.length > 0 && (
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">
            Distributor (Pflichtfeld)
          </label>

          <Select
            value={(item as any).overrideDistributor ?? ""}
            onValueChange={(val) =>
              updateItem("bestellung", index, { overrideDistributor: val })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Bitte auswählen" />
            </SelectTrigger>

            <SelectContent>
              {distis
                .filter((d) =>
                  allowed.some(
                    (code: string) =>
                      code.toLowerCase() === d.code.toLowerCase()
                  )
                )
                .map((d) => (
                  <SelectItem key={d.code} value={d.code} className="text-sm">
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   🧱 PRODUKTLISTE
------------------------------------------------------------------- */

function ProductList({
  cart,
  distis,
  updateItem,
  removeFromCart,
}: {
  cart: CartItem[];
  distis: Disti[];
  updateItem: (
    form: "verkauf" | "bestellung" | "projekt" | "support" | "sofortrabatt" | "cashback",
    index: number,
    updates: Partial<any>
  ) => void;
  removeFromCart: (index: number) => void;
}) {
  if (cart.length === 0) {
    return <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>;
  }

  return (
    <>
      {cart.map((item, index) => (
        <ProductCard
          key={index}
          item={item}
          index={index}
          distis={distis}
          updateItem={updateItem}
          removeFromCart={removeFromCart}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   🟦 HAUPTKOMPONENTE
------------------------------------------------------------------- */

export default function CartBestellung() {
  const dealer = useDealer();
  const supabase = getSupabaseBrowser();
  const theme = useTheme();


  // GLOBAL CART
  const {
    state,
    getItems,
    removeItem,
    clearCart,
    closeCart,
    updateItem,
    projectDetails,
    setProjectDetails,
    orderDetails,
    setOrderDetails,
  } = useCart();

  const cart = (
      (getItems("bestellung") as (CartItem | undefined)[]) || []
    ).filter((item): item is CartItem => Boolean(item));

  const open = state.open && state.currentForm === "bestellung";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [distis, setDistis] = useState<Disti[]>([]);
  const [distributor, setDistributor] = useState<string>("ep");

  // Lieferadresse
  const [hasAltDelivery, setHasAltDelivery] = useState(false);
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("Schweiz");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");

  // Zusatzfelder
  const [deliveryMode, setDeliveryMode] =
    useState<"sofort" | "termin">("sofort");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderComment, setOrderComment] = useState("");
  const [dealerReference, setDealerReference] = useState("");

  /* ------------------------------------------------------------------
     👤 DEALER DATA MEMO
  ------------------------------------------------------------------- */

  const {
    dealerDisplayName,
    dealerLoginNr,
    dealerContact,
    dealerPhone,
    dealerKam,
    dealerEmail,
    dealerCityZip,
  } = useMemo(() => {
    const d = dealer as any;

    const displayName = norm(
      d?.store_name ?? d?.company_name ?? d?.name ?? ""
    );

    const loginNr = norm(d?.login_nr ?? d?.dealer_login_nr ?? "");
    const contact = norm(d?.contact_person ?? d?.dealer_contact_person ?? "");
    const phone = norm(d?.phone ?? d?.dealer_phone ?? "");
    const kam = norm(d?.kam_name ?? d?.kam ?? "");
    const email = norm(d?.mail_dealer ?? d?.email ?? "");
    const zip = norm(d?.zip ?? d?.plz ?? "");
    const city = norm(d?.city ?? "");

    return {
      dealerDisplayName: displayName,
      dealerLoginNr: loginNr,
      dealerContact: contact,
      dealerPhone: phone,
      dealerKam: kam,
      dealerEmail: email,
      dealerCityZip: zip || city ? [zip, city].filter(Boolean).join(" ") : "",
    };
  }, [dealer]);

  /* ------------------------------------------------------------------
     🧮 CART CALCULATED VALUES
  ------------------------------------------------------------------- */

  const totalQuantity = useMemo(
    () => cart.reduce((s, i) => s + toInt((i as any).quantity || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (s, i) =>
          s +
          toInt((i as any).quantity || 0) * toInt((i as any).price || 0),
        0
      ),
    [cart]
  );

  const totalSaved = useMemo(
    () =>
      cart.reduce((s, i) => {
        const ek = getEkNormal(i);
        const p = toInt((i as any).price ?? 0);
        if (ek > 0 && p > 0 && p < ek) {
          return s + (ek - p) * toInt((i as any).quantity || 1);
        }
        return s;
      }, 0),
    [cart]
  );

  const hasNormalProducts = useMemo(
    () =>
      cart.some(
        (item: any) => !item.allowedDistis || item.allowedDistis.length === 0
      ),
    [cart]
  );

  const codeToId = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of distis) if (d.code) m.set(d.code.toLowerCase(), d.id);
    return m;
  }, [distis]);

  /* ------------------------------------------------------------------
     🔄 EFFECTS
  ------------------------------------------------------------------- */
  useEffect(() => {
    // Wenn Bestellformular geöffnet wird, aber project_id fehlt → Projekt-Mode entfernen
    if (open && (!projectDetails || !projectDetails.project_id)) {
      setProjectDetails(null);
    }
  }, [open, projectDetails, setProjectDetails]);

  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart.length]);

  useEffect(() => {
    const loadDistis = async () => {
      const { data } = await supabase
        .from("distributors")
        .select("id, code, name, invest_rule")
        .eq("active", true)
        .order("name");

      if (data) setDistis(data as Disti[]);
    };

    loadDistis();
  }, [supabase]);

  useEffect(() => {
    const loadAllowedDistis = async () => {
      for (const [index, item] of cart.entries()) {
        // ⛔️ Wenn allowedDistis schon vorhanden → nichts tun
        if (Array.isArray((item as any).allowedDistis)) continue;

        const { data } = await supabase
          .from("product_distributors")
          .select("distributors(code)")
          .eq("product_id", Number((item as any).product_id));

        if (!data || data.length === 0) continue;

        const allowed = data
          .map((d: any) => d.distributors?.code)
          .filter(Boolean) as string[];

        updateItem("bestellung", index, {
          allowedDistis: allowed,
          overrideDistributor:
            (item as any).overrideDistributor ||
            pickPreferred(item as CartItem, allowed),
        });
      }
    };

    if (cart.length > 0) loadAllowedDistis();
  }, [cart.length, supabase, updateItem]);


  /* ------------------------------------------------------------------
     🧹 REMOVE ITEM WRAPPER
  ------------------------------------------------------------------- */

  const removeFromCart = useCallback(
    (index: number) => removeItem("bestellung", index),
    [removeItem]
  );

  /* ------------------------------------------------------------------
     SUBMISSION LOGIC
  ------------------------------------------------------------------- */

  const tryInsertSubmission = async (
    basePayload: Record<string, any>,
    requestedDate: string | null
  ): Promise<number> => {
    const payload: SubmissionInsert = {
      ...basePayload,
      typ: "bestellung",
      requested_delivery: mapRequestedDelivery(deliveryMode),
      requested_delivery_date:
        deliveryMode === "termin" ? (requestedDate as any) : null,
    };

    const { data, error } = await supabase
      .from("submissions")
      .insert(payload)
      .select("submission_id")
      .single();

    if (error || !data?.submission_id) {
      throw error ?? new Error("Unknown insert error");
    }

    return data.submission_id;
  };

  const handleSubmit = async () => {
    if (!(dealer as any)?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }

    const hasNormal = cart.some(
      (item: any) => !item.allowedDistis || item.allowedDistis.length === 0
    );
    if (hasNormal && !distributor) {
      toast.error("❌ Bitte Haupt-Distributor auswählen.");
      return;
    }

    const requestedDate = normalizeRequestedDate(deliveryMode, deliveryDate);

    if (deliveryMode === "termin" && !requestedDate) {
      toast.error("Bitte gültiges Lieferdatum (YYYY-MM-DD) wählen.");
      return;
    }

    if (deliveryMode === "sofort" && deliveryDate) {
      setDeliveryDate("");
    }

    // Item-Validierung
    for (const item of cart as any[]) {
      if (!item.quantity || item.quantity <= 0) {
        toast.error("Ungültige Eingabe", {
          description: `Bitte gültige Menge für ${
            item.product_name ?? item.sony_article ?? "Produkt"
          } eingeben!`,
        });
        return;
      }

      if (item.allowedDistis?.length && !item.overrideDistributor) {
        toast.error("❌ Distributor fehlt", {
          description: `Bitte Distributor für ${
            item.product_name ?? item.sony_article ?? "Produkt"
          } auswählen.`,
        });
        return;
      }

      if (
        item.lowest_price_source === "Andere" &&
        !item.lowest_price_source_custom?.trim()
      ) {
        toast.error("❌ Anbieter fehlt", {
          description: `Bitte Händlernamen für „Andere“ bei ${
            item.product_name ?? "Produkt"
          } angeben.`,
        });
        return;
      }
    }

    // Distributor-Check
    const allCodes = new Set<string>();
    for (const item of cart as any[]) {
      const code = item.allowedDistis?.length
        ? (item.overrideDistributor as string)
        : distributor;
      if (code) allCodes.add(code.toLowerCase());
    }
    for (const code of allCodes) {
      if (!codeToId.get(code)) {
        toast.error("❌ Unbekannter Distributor-Code", {
          description: `Distributor "${code}" konnte nicht gefunden werden.`,
        });
        return;
      }
    }

    setLoading(true);

    try {
      const itemsByCode: Record<string, CartItem[]> = {};

      for (const item of cart as any[]) {
        const code = item.allowedDistis?.length
          ? (item.overrideDistributor as string)
          : distributor;
        const key = (code || "").toLowerCase();
        if (!itemsByCode[key]) itemsByCode[key] = [];
        itemsByCode[key].push(item as CartItem);
      }

      for (const [codeLower, items] of Object.entries(itemsByCode)) {
        const distiUuid = codeToId.get(codeLower);
        if (!distiUuid)
          throw new Error(`Distributor-Code "${codeLower}" nicht gefunden.`);

        // ----------------------------------------------------
        // 1) SUBMISSION SPEICHERN (vollständig)
        // ----------------------------------------------------
        const submissionPayload: SubmissionInsert = {
          dealer_id: (dealer as any).dealer_id,
          typ: "bestellung",
          distributor: codeLower,

          // 🔥 HIER DER ENTSCHEIDENDE LINK
          project_id: projectDetails?.project_id ?? null,

          requested_delivery: mapRequestedDelivery(deliveryMode),
          requested_delivery_date:
            deliveryMode === "termin" ? requestedDate : null,

          order_comment: orderComment || null,
          dealer_reference: dealerReference || null,

          customer_number: dealerLoginNr || null,
          customer_contact: dealerContact || null,
          customer_phone: dealerPhone || null,
          customer_name: dealerDisplayName || null,

          status: "pending",
        };


        const { data: subData, error: subErr } = await supabase
          .from("submissions")
          .insert(submissionPayload)
          .select("submission_id")
          .single();

        if (subErr || !subData) throw subErr;
        const submissionId = subData.submission_id;
        // ----------------------------------------------------
        // 📎 DATEIEN HOCHLADEN (BESTELLUNG)
        // ----------------------------------------------------
        if (orderDetails?.files?.length) {
          const formData = new FormData();
          formData.append("submissionId", String(submissionId));

          orderDetails.files.forEach((file: File) => {
            formData.append("files", file);
          });

          const res = await fetch("/api/orders/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Datei-Upload fehlgeschlagen");
          }
        }


        // ----------------------------------------------------
        // 2) ITEMS SPEICHERN (inkl. korrektem INVEST + POI_alt)
        // ----------------------------------------------------

        // 1) Produktdetails laden (WICHTIG! sonst falscher Invest)
        const { data: fullProducts, error: prodErr } = await supabase
          .from("products")
          .select("product_id, price_on_invoice, dealer_invoice_price")
          .in("product_id", items.map((i: any) => Number(i.product_id)));

        if (prodErr) {
          console.error("❌ Fehler beim Laden der Produktdaten", prodErr);
          throw prodErr;
        }

        // Map für schnellen Zugriff
        const productMap = new Map(
          (fullProducts || []).map((p: any) => [p.product_id, p])
        );


        const itemPayloads: SubmissionItemInsert[] = items.map((i: any) => {
          const productId = Number(i.product_id);

          // --- Produkt auflösen ---
          const prod = productMap.get(productId);

          // --- street price brutto ---
          const brutto =
            typeof i.lowest_price_brutto === "number"
              ? safeNum(i.lowest_price_brutto)
              : null;

          const vrg = typeof i.vrg === "number" ? i.vrg : 0;

          const netto =
            brutto !== null && brutto > 0 ? safeNum(brutto / 1.081 - vrg) : null;

          // --------------------------------------------------------------
          // 🔥 POI ALT – wie im Dashboard
          // --------------------------------------------------------------
          const poiAlt = safeNum(
            prod?.price_on_invoice ??
            prod?.dealer_invoice_price ??
            0
          );

          // --------------------------------------------------------------
          // 🔥 Händler-EK neu (Preis) – identisch zum Dashboard
          // --------------------------------------------------------------
          const dealerPrice = safeNum(
            i.price != null && i.price > 0
              ? i.price
              : poiAlt    // <— jetzt korrekt
          );


          // --------------------------------------------------------------
          // 🔥 Distributor-Regel bestimmen
          // --------------------------------------------------------------
          const distiRow = distis.find(
            (d) => d.code.toLowerCase() === codeLower.toLowerCase()
          );

          const rule = (distiRow as any)?.invest_rule ?? "default";

          // --------------------------------------------------------------
          // 🔥 KORREKTE INVEST-BERECHNUNG (jetzt identisch zum Dashboard!)
          // --------------------------------------------------------------
          let investVal = 0;
          try {
            investVal = safeNum(calcInvestByRule(rule, dealerPrice, poiAlt));
          } catch (err) {
            console.warn("⚠️ Invest-Berechnung fehlgeschlagen:", err);
            investVal = 0;
          }

          // --------------------------------------------------------------
          // FINALE ITEM PAYLOAD
          // --------------------------------------------------------------
          return {
            submission_id: submissionId,

            // Produktdaten
            product_id: productId,
            ean: i.ean || null,
            product_name: i.product_name || i.sony_article || null,
            sony_article: i.sony_article || null,

            // Preise / Menge
            menge: toInt(i.quantity),
            preis: dealerPrice,

            // Streetprice
            lowest_price_brutto: brutto,
            lowest_price_netto: netto,
            lowest_price_source: i.lowest_price_source?.trim() || null,
            lowest_price_source_custom:
              i.lowest_price_source === "Andere"
                ? i.lowest_price_source_custom?.trim() || null
                : null,

            margin_street:
              netto !== null && dealerPrice > 0
                ? safeNum(((netto - dealerPrice) / netto) * 100)
                : null,

            // 🔥 KORREKTES INVEST
            invest: investVal,

            // Distributor-Zuordnung
            distributor_id: distiUuid,

            // Weitere Felder
            calc_price_on_invoice:
              i.calc_price_on_invoice != null ? safeNum(i.calc_price_on_invoice) : null,
            netto_retail: i.netto_retail != null ? safeNum(i.netto_retail) : null,
            marge_alt: i.marge_alt != null ? safeNum(i.marge_alt) : null,
            marge_neu: i.marge_neu != null ? safeNum(i.marge_neu) : null,

            serial: i.serial || null,
            comment: i.comment || null,
            project_id: i.project_id || null,
          };
        });


        // ----------------------------------------------------
        // 2b) ITEMS IN DB SPEICHERN
        // ----------------------------------------------------
        const { error: itemsErr } = await supabase
          .from("submission_items")
          .insert(itemPayloads);

        if (itemsErr) {
          console.error("❌ Fehler beim Speichern der Items", itemsErr);
          throw itemsErr;
        }


        // ----------------------------------------------------
        // 3) OPTIONAL: Notification
        // ----------------------------------------------------
        try {
          await fetch("/api/orders/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submissionId,
              stage: "placed",
            }),
          });
        } catch (err) {
          console.error("Notification fehler:", err);
        }
      }

      // Cleanup
      clearCart("bestellung");
      setSuccess(true);
      setDistributor("ep");
      setDeliveryMode("sofort");
      setDeliveryDate("");
      setOrderComment("");
      setDealerReference("");
      setHasAltDelivery(false);
      setDeliveryName("");
      setDeliveryStreet("");
      setDeliveryZip("");
      setDeliveryCity("");
      setDeliveryCountry("Schweiz");
      setDeliveryEmail("");
      setDeliveryPhone("");
      setOrderDetails({ files: [] });

      toast.success("✅ Bestellung gespeichert", {
        description: "Die Bestellung wurde erfolgreich übermittelt.",
      });
    } catch (err: any) {
      console.error("Order API Error:", err);
      toast.error("❌ Fehler beim Speichern", {
        description: err?.message ?? "Unbekannter Fehler",
      });
    } finally {
      setLoading(false);
    }
  };


  /* ------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeCart();
        }
      }}
    >

      <SheetContent
        side="right"
        className="
          pt-20
          w-full
          sm:max-w-none
          sm:w-[780px]
          lg:w-[980px]
          xl:w-[1120px]
          2xl:w-[1280px]
          flex flex-col
        "
      >
        <SheetHeader className="p-3 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Bestellung zum Bestpreis
          </SheetTitle>
        </SheetHeader>

        {/* 🔥 PROJEKT-BANNER */}
        {/* 🔥 PROJEKT-BANNER */}
        {projectDetails?.project_id && (
          <div className="mx-3 mt-2 mb-2 rounded-xl border border-purple-300 bg-purple-50 p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-purple-700 flex items-center gap-2">
                  📁 Projekt
                </p>

                <p className="mt-1 text-gray-800">
                  {projectDetails.project_name || "–"}
                </p>

                {projectDetails.customer && (
                  <p className="text-xs text-gray-600">
                    Kunde: {projectDetails.customer}
                  </p>
                )}

                {/* ✅ Projekt-ID = Submission-ID mit Prefix */}
                {projectDetails.submission_id && (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                    <span>Projekt:</span>

                    {/* 🔗 Klick auf Projekt */}
                    {projectDetails.project_id ? (
                      <Link
                        href={`/projekt-bestellung/${projectDetails.project_id}`}
                        className="font-mono font-semibold text-purple-700 hover:underline"
                        title="Projekt öffnen"
                      >
                        P-{projectDetails.submission_id}
                      </Link>
                    ) : (
                      <span className="font-mono font-semibold text-purple-700">
                        P-{projectDetails.submission_id}
                      </span>
                    )}

                    {/* 📋 Copy-Button */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `P-${projectDetails.submission_id}`
                        );
                        toast.success("Projekt-ID kopiert");
                      }}
                      className="rounded p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                      title="Projekt-ID kopieren"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={() => {
                  setProjectDetails(null);
                  clearCart("bestellung");
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Projekt entfernen
              </button>
            </div>
          </div>
        )}



        {/* Dealer-Infos */}
        <div className="mt-2 mb-2 text-xs">
          <div className="font-semibold text-gray-800">
            {dealerDisplayName || "–"}
          </div>

          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
            <div className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Kd-Nr.:{" "}
                <span className="font-medium">{dealerLoginNr || "–"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>
                AP:{" "}
                <span className="font-medium">{dealerContact || "–"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Tel.:{" "}
                <span className="font-medium">{dealerPhone || "–"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <BadgeInfo className="w-3.5 h-3.5 text-gray-400" />
              <span>
                E-Mail:{" "}
                <span className="font-medium">{dealerEmail || "–"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <BadgeInfo className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Ort:{" "}
                <span className="font-medium">{dealerCityZip || "–"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <BadgeInfo className="w-3.5 h-3.5 text-gray-400" />
              <span>
                KAM:{" "}
                <span className="font-medium">{dealerKam || "–"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* SUCCESS VIEW */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-green-600 font-semibold text-lg">
              ✅ Bestellung gespeichert!
            </p>
            <SheetClose asChild>
              <Button variant="default">Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* 2-Spalten Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 min-h-0">
              {/* Linke Spalte */}
              <div className="
                space-y-4
                order-2 lg:order-1
                min-h-0
                overflow-y-auto
                pr-1
              ">

                
                {/* Haupt-Distributor */}
                {/* Haupt-Distributor */}
                {hasNormalProducts && (
                  <div className="bg-white border border-blue-200 border-l-[6px] border-l-blue-600 rounded-r-xl p-4 space-y-2 shadow-sm">
                    <label className="block text-xs font-semibold text-gray-800">
                      Haupt-Distributor
                    </label>

                    <Select
                      onValueChange={(v) => setDistributor(v)}
                      value={distributor}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Bitte auswählen" />
                      </SelectTrigger>

                      <SelectContent>
                        {distis.map((d) => (
                          <SelectItem key={d.code} value={d.code} className="text-sm">
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <p className="text-[11px] text-gray-400 italic">
                      Standardmäßig über ElectronicPartner Schweiz AG.
                    </p>
                  </div>

                )}



                {/* Bestellangaben – Premium Focus Card */}
                <div className="bg-white border border-blue-200 border-l-[6px] border-l-blue-600 rounded-r-xl p-4 space-y-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">
                    Bestellangaben
                  </p>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">
                        Lieferung
                      </label>

                      <Select
                        value={deliveryMode}
                        onValueChange={(v) =>
                          setDeliveryMode(v as "sofort" | "termin")
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Bitte wählen" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="sofort">Sofort</SelectItem>
                          <SelectItem value="termin">Zum Termin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">
                        Lieferdatum (optional)
                      </label>

                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        disabled={deliveryMode !== "termin"}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Wichtige Infos zur Bestellung (Kommentar)
                    </label>

                    <textarea
                      value={orderComment}
                      onChange={(e) => setOrderComment(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-xs"
                      rows={4}
                      placeholder="z. B. 'Muss zwingend bis 15.10. geliefert werden'…"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">
                        Ihre Bestell-/Referenz-Nr.
                      </label>

                      <Input
                        value={dealerReference}
                        onChange={(e) => setDealerReference(e.target.value)}
                        placeholder="z. B. 45001234"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Abweichende Lieferadresse */}
                {/* Abweichende Lieferadresse / Direktlieferung */}
                <div className="relative bg-white border border-blue-200 p-4 rounded-r-xl">
                  
                  {/* linker Akzentstreifen – gleich wie Bestellangaben */}
                  <div className="absolute left-0 top-0 h-full w-[5.5px] bg-blue-600" />

                  <div className="flex items-center gap-2 pl-2">
                    <input
                      id="altDelivery"
                      type="checkbox"
                      checked={hasAltDelivery}
                      onChange={(e) => setHasAltDelivery(e.target.checked)}
                      className="w-4 h-4"
                    />

                    <label
                      htmlFor="altDelivery"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Abweichende Lieferadresse / Direktlieferung
                    </label>
                  </div>

                  {hasAltDelivery && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          Name / Firma
                        </label>

                        <Input
                          value={deliveryName}
                          onChange={(e) => setDeliveryName(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          Straße / Nr.
                        </label>

                        <Input
                          value={deliveryStreet}
                          onChange={(e) => setDeliveryStreet(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          PLZ
                        </label>

                        <Input
                          value={deliveryZip}
                          onChange={(e) => setDeliveryZip(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          Ort
                        </label>

                        <Input
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          Land
                        </label>

                        <Input
                          value={deliveryCountry}
                          onChange={(e) => setDeliveryCountry(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          Telefon (optional)
                        </label>

                        <Input
                          value={deliveryPhone}
                          onChange={(e) => setDeliveryPhone(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">
                          E-Mail (optional)
                        </label>

                        <Input
                          value={deliveryEmail}
                          onChange={(e) => setDeliveryEmail(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* 📎 DATEIEN ZUR BESTELLUNG – OPTIONAL */}
                <details className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-blue-700">
                    📎 Dateien zur Bestellung (optional)
                  </summary>

                  <div className="mt-3">
                    <ProjectFileUpload
                      files={orderDetails.files}
                      onChange={(files) =>
                        setOrderDetails((prev: { files: File[] }) => ({ ...prev, files }))
                      }
                    />

                    {orderDetails.files.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        📎 {orderDetails.files.length} Datei(en) angehängt
                      </p>
                    )}
                  </div>
                </details>

              </div>

              {/* Rechte Spalte – PRODUKTLISTE */}
              <div className="flex flex-col min-h-0 order-1 lg:order-2">
                <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
                  <ProductList
                    cart={cart}
                    distis={distis}
                    updateItem={updateItem}
                    removeFromCart={removeFromCart}
                  />
                  
                  {/* Sticky Footer */}
                  {/* Sticky Footer – Checkout */}
                  {cart.length > 0 && (
                    <div
                      className="
                        sticky bottom-0
                        bg-white/95 backdrop-blur
                        py-2
                        -mx-2 sm:mx-0
                        px-2 sm:px-0
                      "
                    >
                      <div
                        className="
                          w-full
                          bg-white
                          border
                          border-green-300
                          border-l-[6px]
                          border-l-green-400
                          rounded-r-xl
                          p-3 sm:p-4
                          space-y-2 sm:space-y-3
                          shadow-sm
                        "
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Gesamt:</span>
                          <span className="font-semibold">{totalQuantity} Stück</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Gesamtpreis:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {totalPrice.toFixed(0)} CHF
                          </span>
                        </div>

                        {totalSaved > 0 && (
                          <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg py-1.5">
                            Gesamtersparnis: {totalSaved.toFixed(0)} CHF
                          </div>
                        )}

                        <Button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="w-full h-11 mt-2 text-base"
                        >
                          {loading ? "⏳ Sende…" : "✅ Bestellung absenden"}
                        </Button>

                        <Button variant="outline" className="w-full" onClick={closeCart}>
                          Weiter einkaufen
                        </Button>
                      </div>
                    </div>
                  )}



                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
