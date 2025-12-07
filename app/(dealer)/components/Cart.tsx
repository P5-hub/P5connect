"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

type Disti = { id: string; code: string; name: string };

type SubmissionInsert =
  Database["public"]["Tables"]["submissions"]["Insert"];

type SubmissionItemInsert =
  Database["public"]["Tables"]["submission_items"]["Insert"];

// =====================================================================================
//   BESTELL-WARENKORB (NEUE VERSION) → nutze den GlobalCartProvider
// =====================================================================================

export default function CartBestellung() {
  const dealer = useDealer();
  const supabase = getSupabaseBrowser();

  // GLOBAL CART
  const {
    state,
    getItems,
    removeItem,
    clearCart,
    closeCart,
  } = useCart();

  // Nur den Slot "bestellung" lesen
  const cart = getItems("bestellung");

  // Sheet ist offen wenn global.open && currentForm = "bestellung"
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
  const [deliveryMode, setDeliveryMode] = useState<"sofort" | "termin">("sofort");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderComment, setOrderComment] = useState("");
  const [dealerReference, setDealerReference] = useState("");

  // =====================================================================================
  //   HELPER (original)
  // =====================================================================================

  const toInt = (v: any) => (Number.isFinite(+v) ? Math.round(+v) : 0);
  const norm = (v: any) => (typeof v === "string" ? v.trim() : v ?? "");

  const mapUpper = (m: "sofort" | "termin") =>
    m === "termin" ? "TERMIN" : "SOFORT";

  const mapLower = (m: "sofort" | "termin") =>
    m === "termin" ? "termin" : "sofort";

  const normalizeRequestedDate = (
    mode: "sofort" | "termin",
    dateStr: string
  ) => {
    if (mode !== "termin") return null;
    const s = (dateStr || "").trim();
    if (!s) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };

  const safeNum = (v: any) =>
    isFinite(v) && !isNaN(v) ? parseFloat(Number(v).toFixed(2)) : 0;

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

  const updateItem = (
    index: number,
    field: keyof CartItem | "overrideDistributor" | "allowedDistis" |
      "lowest_price_brutto" | "lowest_price_source" | "lowest_price_source_custom",
    value: any
  ) => {
    // GlobalCartProvider intern arbeitet immutable
    cart[index][field] = value;
  };

  // =====================================================================================
  //   DEALERDATA (original)
  // =====================================================================================

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
    const cityZip = zip || city ? [zip, city].filter(Boolean).join(" ") : "";

    return {
      dealerDisplayName: displayName,
      dealerLoginNr: loginNr,
      dealerContact: contact,
      dealerPhone: phone,
      dealerKam: kam,
      dealerEmail: email,
      dealerCityZip: cityZip,
    };
  }, [dealer]);

  // =====================================================================================
  //   CART CALCULATED VALUES
  // =====================================================================================

  const totalQuantity = useMemo(
    () => cart.reduce((s, i) => s + toInt(i.quantity || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (s, i) => s + toInt(i.quantity || 0) * toInt(i.price || 0),
        0
      ),
    [cart]
  );

  const totalSaved = useMemo(
    () =>
      cart.reduce((s, i) => {
        const ek = getEkNormal(i);
        const p = toInt(i.price ?? 0);
        if (ek > 0 && p > 0 && p < ek)
          return s + (ek - p) * toInt(i.quantity || 1);
        return s;
      }, 0),
    [cart]
  );

  const hasNormalProducts = useMemo(
    () => cart.some((item) => !item.allowedDistis || item.allowedDistis.length === 0),
    [cart]
  );

  // =====================================================================================
  //   LOAD DISTIS + ALLOWED DISTIS
  // =====================================================================================

  useEffect(() => {
    const loadDistis = async () => {
      const { data } = await supabase
        .from("distributors")
        .select("id, code, name")
        .eq("active", true)
        .order("name");

      if (data) setDistis(data as Disti[]);
    };

    loadDistis();
  }, [supabase]);

  useEffect(() => {
    const loadAllowed = async () => {
      for (const [index, item] of cart.entries()) {
        const { data } = await supabase
          .from("product_distributors")
          .select("distributor_id, distributors(code)")
          .eq("product_id", Number(item.product_id));

        if (data && data.length > 0) {
          const allowed = data
            .map((d: any) => d.distributors?.code)
            .filter(Boolean) as string[];

          item.allowedDistis = allowed;

          if (!item.overrideDistributor) {
            item.overrideDistributor = pickPreferred(item, allowed);
          }
        }
      }
    };

    if (cart.length > 0) loadAllowed();
  }, [cart.length, supabase]);

  // =====================================================================================
  //   SUBMISSION (original)
  // =====================================================================================

  const tryInsertSubmission = async (
    basePayload: Record<string, any>,
    candidates: Array<"omit" | "upper" | "lower">,
    requestedDate: string | null
  ): Promise<number> => {
    for (const variant of candidates) {
      const payload = { ...basePayload };

      if (variant === "upper") payload.requested_delivery = mapUpper(deliveryMode);
      else if (variant === "lower") payload.requested_delivery = mapLower(deliveryMode);
      else delete payload.requested_delivery;

      const mode = (payload.requested_delivery ?? "").toString().toLowerCase();

      payload.requested_delivery_date =
        mode === "termin" ? requestedDate : null;

      const { data, error } = await supabase
        .from("submissions")
        .insert(payload as SubmissionInsert)
        .select("submission_id")
        .single();

      if (!error && data?.submission_id) return data.submission_id;

      const isCheckFail =
        (error as any)?.code === "23514" ||
        ((error as any)?.message ?? "")
          .includes("violates check constraint") &&
        ((error as any)?.message ?? "").includes(
          "submissions_requested_delivery_check"
        );

      if (!isCheckFail) throw error;
    }
    throw new Error("Delivery constraint konnte nicht erfüllt werden.");
  };

  const handleSubmit = async () => {
    if (!(dealer as any)?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }

    if (deliveryMode === "termin" && !normalizeRequestedDate(deliveryMode, deliveryDate)) {
      toast.error("Bitte gültiges Lieferdatum (YYYY-MM-DD) wählen.");
      return;
    }

    setLoading(true);

    try {
      const requestedDate = normalizeRequestedDate(deliveryMode, deliveryDate);

      const itemsByCode: Record<string, CartItem[]> = {};

      for (const item of cart) {
        const code = item.allowedDistis?.length
          ? (item.overrideDistributor as string)
          : distributor;
        const key = (code || "").toLowerCase();

        if (!itemsByCode[key]) itemsByCode[key] = [];
        itemsByCode[key].push(item);
      }

      for (const [codeLower, items] of Object.entries(itemsByCode)) {
        const disti = distis.find((d) => d.code.toLowerCase() === codeLower);
        if (!disti) throw new Error(`Distributor "${codeLower}" nicht gefunden.`);

        const basePayload: SubmissionInsert = {
          dealer_id: (dealer as any).dealer_id,
          typ: "bestellung",
          distributor: codeLower,
          status: "pending",
          order_comment: orderComment || null,
          dealer_reference: dealerReference || null,
          customer_number: dealerLoginNr || null,
          customer_contact: dealerContact || null,
          customer_phone: dealerPhone || null,

          delivery_name: hasAltDelivery ? deliveryName || null : null,
          delivery_street: hasAltDelivery ? deliveryStreet || null : null,
          delivery_zip: hasAltDelivery ? deliveryZip || null : null,
          delivery_city: hasAltDelivery ? deliveryCity || null : null,
          delivery_country: hasAltDelivery ? deliveryCountry || null : null,
        };

        const submissionId = await tryInsertSubmission(
          basePayload,
          ["upper", "lower", "omit"],
          requestedDate
        );

        await supabase
          .from("submission_items")
          .insert(
            items.map(
              (i): SubmissionItemInsert => {
                const streetBrutto = i.lowest_price_brutto ?? null;
                const streetNetto =
                  streetBrutto ? safeNum(streetBrutto / 1.077) : 0;

                const dealerPrice = safeNum(i.price ?? 0);

                const marginStreet =
                  streetNetto > 0 && dealerPrice > 0
                    ? parseFloat(
                        (((streetNetto - dealerPrice) / streetNetto) * 100).toFixed(2)
                      )
                    : 0;

                return {
                  submission_id: submissionId,
                  product_id: Number(i.product_id),
                  menge: toInt(i.quantity),
                  preis: dealerPrice,
                  distributor_id: disti.id,

                  lowest_price_brutto: streetBrutto ? safeNum(streetBrutto) : 0,
                  lowest_price_netto: streetNetto,
                  lowest_price_source:
                    i.lowest_price_source?.trim() || null,
                  lowest_price_source_custom:
                    i.lowest_price_source === "Andere"
                      ? (i.lowest_price_source_custom ?? "").trim() || null
                      : null,
                  margin_street: marginStreet,
                };
              }
            )
          );
      }

      clearCart("bestellung");
      setSuccess(true);
      setDistributor("ep");
      setOrderComment("");
      setDealerReference("");

      toast.success("✅ Bestellung erfolgreich gespeichert");
    } catch (err: any) {
      toast.error("❌ Fehler beim Speichern", {
        description: err.message,
      });
    }

    setLoading(false);
  };

  // =====================================================================================
  //   RENDER
  // =====================================================================================

  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="w-full sm:w-[1100px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Bestellung zum Bestpreis
          </SheetTitle>
        </SheetHeader>

        {/* SUCCESS SCREEN */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-green-600 text-lg font-semibold">
              Bestellung erfolgreich gespeichert!
            </p>

            <SheetClose asChild>
              <Button>Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Deine gesamte Bestellmaske bleibt identisch */}
            <>
            {/* ----------------------------------------------------
                2-Spalten Layout
            ---------------------------------------------------- */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 min-h-0">

              {/* ----------------------------------------------------
                  Linke Spalte
              ---------------------------------------------------- */}
              <div className="space-y-4">

                {/* Haupt-Distributor */}
                {hasNormalProducts && (
                  <div className="border rounded-xl p-3 space-y-2 bg-blue-50/40">
                    <label className="block text-xs font-semibold">
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
                          <SelectItem
                            key={d.code}
                            value={d.code}
                            className="text-sm"
                          >
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

                {/* ----------------------------------------------------
                    Bestellangaben
                ---------------------------------------------------- */}
                <div className="border rounded-xl p-3 space-y-3">
                  <p className="text-sm font-semibold">Bestellangaben</p>

                  {/* Lieferung */}
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

                    {/* Lieferdatum */}
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

                  {/* Kommentar */}
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

                  {/* Referenznummer */}
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

                {/* ----------------------------------------------------
                    Abweichende Lieferadresse
                ---------------------------------------------------- */}
                <div className="mt-3 border rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="altDelivery"
                      type="checkbox"
                      checked={hasAltDelivery}
                      onChange={(e) => setHasAltDelivery(e.target.checked)}
                      className="w-4 h-4"
                    />

                    <label htmlFor="altDelivery" className="text-sm font-medium">
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
              </div>

              {/* ----------------------------------------------------
                  Rechte Spalte – PRODUKTLISTE
              ---------------------------------------------------- */}
              <div className="flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1">

                  {cart.length === 0 ? (
                    <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
                  ) : (
                    cart.map((item, index) => {
                      const allowed = Array.isArray(item.allowedDistis)
                        ? item.allowedDistis
                        : [];

                      const ek = getEkNormal(item);
                      const p = toInt(item.price ?? 0);

                      const showSavings = ek > 0 && p > 0 && p < ek;

                      const savedCHF = showSavings ? ek - p : 0;
                      const savedPercent =
                        showSavings ? Math.round(((ek - p) / ek) * 100) : 0;

                      return (
                        <div
                          key={index}
                          className={`border rounded-xl p-3 space-y-2 mb-3 ${
                            item.allowedDistis?.length
                              ? "border-amber-300"
                              : "border-gray-200"
                          }`}
                        >
                          {/* PRODUKT-HEADER */}
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate flex items-center gap-2">
                                {item.product_name ||
                                  (item as any).sony_article ||
                                  "Unbekannt"}

                                {item.allowedDistis?.length ? (
                                  <span className="flex items-center gap-1 text-amber-600 text-[11px] font-semibold border border-amber-300 rounded-full px-2 py-0.5">
                                    <Star className="w-3 h-3" /> Spezialvertrieb
                                  </span>
                                ) : null}
                              </p>

                              <p className="text-[11px] text-gray-500">
                                EAN: {item.ean || "-"}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("bestellung", index)}
                              className="h-7 w-7"
                              title="Entfernen"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>

                          {/* MENGE + PREIS */}
                          <div className="grid grid-cols-2 gap-2 text-center">
                            {/* Menge */}
                            <div>
                              <label className="block text-[11px] text-gray-600 mb-1">
                                Anzahl
                              </label>

                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "quantity",
                                    Math.max(1, toInt(e.target.value))
                                  )
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
                                value={p}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "price",
                                    toInt(e.target.value)
                                  )
                                }
                                className="text-center h-8 text-xs"
                              />

                              <p className="text-[11px] text-gray-500 mt-1">
                                EK normal:{" "}
                                <span className="font-medium text-blue-600">
                                  {ek > 0 ? `${ek} CHF` : "-"}
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

                          {/* STREETPRICE SECTION */}
                          <div className="mt-4 border-t pt-2 text-xs text-gray-700">
                            <label className="block text-gray-500 mb-1">
                              Günstigster Anbieter
                            </label>

                            <Select
                              value={item.lowest_price_source ?? ""}
                              onValueChange={(val) => {
                                updateItem(index, "lowest_price_source", val);

                                if (val !== "Andere") {
                                  updateItem(
                                    index,
                                    "lowest_price_source_custom",
                                    null
                                  );
                                }
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

                            {item.lowest_price_source === "Andere" && (
                              <div className="mt-2">
                                <label className="block text-gray-500 mb-1">
                                  Bitte Namen des Anbieters angeben *
                                </label>

                                <Input
                                  placeholder="Name des Händlers"
                                  value={item.lowest_price_source_custom ?? ""}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "lowest_price_source_custom",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm border-amber-400 focus:border-amber-500"
                                />

                                <p className="text-[11px] text-amber-600 mt-1">
                                  Pflichtfeld bei Auswahl von „Andere“ — bitte genaue Händlerangabe.
                                </p>
                              </div>
                            )}

                            <label className="block text-gray-500 mb-1 mt-3">
                              Günstigster Preis (inkl. MwSt.)
                            </label>

                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={item.lowest_price_brutto ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "lowest_price_brutto",
                                  e.target.value === ""
                                    ? null
                                    : parseFloat(e.target.value) || null
                                )
                              }
                              className="text-sm"
                            />
                          </div>

                          {/* SPEZIAL-DISTRIBUTOR */}
                          {allowed.length > 0 && (
                            <div>
                              <label className="block text-[11px] text-gray-600 mb-1">
                                Distributor (Pflichtfeld)
                              </label>

                              <Select
                                value={item.overrideDistributor || ""}
                                onValueChange={(val) =>
                                  updateItem(index, "overrideDistributor", val)
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Bitte auswählen" />
                                </SelectTrigger>

                                <SelectContent>
                                  {distis
                                    .filter((d) =>
                                      allowed.some(
                                        (c: string) => c.toLowerCase() === d.code.toLowerCase()
                                      )
                                    )
                                    .map((d) => (
                                      <SelectItem
                                        key={d.code}
                                        value={d.code}
                                        className="text-sm"
                                      >
                                        {d.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>

                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* ----------------------------------------------------
                      Sticky Footer
                  ---------------------------------------------------- */}
                  {cart.length > 0 && (
                    <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t mt-2 p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Gesamt:</span>
                        <span>{totalQuantity} Stück</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Gesamtpreis:</span>
                        <span>{totalPrice.toFixed(0)} CHF</span>
                      </div>

                      {totalSaved > 0 && (
                        <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg py-1.5">
                          <Tag className="w-4 h-4" />
                          Gesamtersparnis: {totalSaved.toFixed(0)} CHF
                        </div>
                      )}

                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? "⏳ Sende…" : "✅ Bestellung absenden"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>          
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
