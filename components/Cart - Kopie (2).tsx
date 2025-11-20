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
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Trash2, Star, Tag, Hash, User, Phone, BadgeInfo } from "lucide-react";
import { Product } from "@/types/Product";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { Database } from "@/types/supabase";

type CartItem = Product & {
  quantity: number;
  price?: number;
  overrideDistributor?: string;
  allowedDistis?: string[];

  // Streetprice & Quelle (pro Produkt)
  lowest_price_brutto?: number | null;       // inkl. MwSt.
  lowest_price_source?: string | null;       // Auswahl
  lowest_price_source_custom?: string | null;// Freitext bei "Andere"
};

type Disti = { id: string; code: string; name: string };

type DealerExtra = {
  login_nr?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  kam_name?: string | null;
  kam?: string | null;
  store_name?: string | null;
  company_name?: string | null;
};

type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"];
type SubmissionItemInsert = Database["public"]["Tables"]["submission_items"]["Insert"];

export default function Cart({
  cart,
  setCart,
  onOrderSuccess,
  open,
  setOpen,
}: {
  cart: CartItem[];
  setCart: (fn: (prev: CartItem[]) => CartItem[]) => void;
  onOrderSuccess: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  const dealer = useDealer();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [distis, setDistis] = useState<Disti[]>([]);
  const [distributor, setDistributor] = useState<string>("ep");
  const supabase = getSupabaseBrowser();
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  // Lieferadresse
  const [hasAltDelivery, setHasAltDelivery] = useState(false);
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("Schweiz");
  const [deliveryEmail, setDeliveryEmail] = useState(""); // optional, für deinen Screenshot
  const [deliveryPhone, setDeliveryPhone] = useState("");


  // Zusatzfelder
  const [deliveryMode, setDeliveryMode] = useState<"sofort" | "termin">("sofort");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [orderComment, setOrderComment] = useState<string>("");
  const [dealerReference, setDealerReference] = useState<string>("");

  // Fallback-Dealer-Infos
  const [extraDealer, setExtraDealer] = useState<DealerExtra | null>(null);

  const toInt = (v: any) => (Number.isFinite(+v) ? Math.round(+v) : 0);
  const norm = (v: any) => (typeof v === "string" ? v.trim() : v ?? "");
  const mapUpper = (m: "sofort" | "termin") => (m === "termin" ? "TERMIN" : "SOFORT");
  const mapLower = (m: "sofort" | "termin") => (m === "termin" ? "termin" : "sofort");

  const normalizeRequestedDate = (mode: "sofort" | "termin", dateStr: string) => {
    if (mode !== "termin") return null;
    const s = (dateStr || "").trim();
    if (!s) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };

  const codeToId = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of distis) if (d.code) m.set(d.code.toLowerCase(), d.id);
    return m;
  }, [distis]);

  useEffect(() => {
    if (cart.length > 0 && cartButtonRef.current) {
      cartButtonRef.current.classList.add("bounce-once");
      const t = setTimeout(() => cartButtonRef.current?.classList.remove("bounce-once"), 500);
      return () => clearTimeout(t);
    }
  }, [cart.length]);

  useEffect(() => {
    if (cart.length > 0) setSuccess(false);
  }, [cart]);

  useEffect(() => {
    const loadDistis = async () => {
      const { data, error } = await supabase
        .from("distributors")
        .select("id, code, name")
        .eq("active", true)
        .order("name")
        .throwOnError();
      if (!error && data) setDistis(data as Disti[]);
    };
    loadDistis();
  }, [supabase]);

  useEffect(() => {
    const fetchDealerIfMissing = async () => {
      const id = (dealer as any)?.dealer_id;
      if (!id) return;

      const hookHas =
        (dealer as any).login_nr !== undefined &&
        (dealer as any).phone !== undefined &&
        (dealer as any).kam_name !== undefined &&
        (dealer as any).store_name !== undefined;

      if (hookHas) {
        setExtraDealer({
          login_nr: (dealer as any).login_nr ?? null,
          contact_person: (dealer as any).contact_person ?? null,
          phone: (dealer as any).phone ?? null,
          kam_name: (dealer as any).kam_name ?? null,
          kam: (dealer as any).kam ?? null,
          store_name: (dealer as any).store_name ?? null,
          company_name: (dealer as any).company_name ?? null,
        });
        return;
      }

      const { data } = await supabase
        .from("dealers")
        .select("login_nr, contact_person, phone, kam_name, kam, store_name, company_name")
        .eq("dealer_id", id)
        .maybeSingle();

      if (data) setExtraDealer(data as DealerExtra);
    };

    fetchDealerIfMissing();
  }, [(dealer as any)?.dealer_id, supabase, dealer]);

  useEffect(() => {
    const loadAllowedDistis = async () => {
      for (const [index, item] of cart.entries()) {
        const { data, error } = await supabase
          .from("product_distributors")
          .select("distributor_id, distributors(code)")
          .eq("product_id", Number(item.product_id))
          .throwOnError();

        if (!error && data && data.length > 0) {
          const allowedCodes = data.map((d: any) => d.distributors?.code).filter(Boolean) as string[];
          updateItem(index, "allowedDistis", allowedCodes);
          if (!item.overrideDistributor) {
            updateItem(index, "overrideDistributor", pickPreferred(item, allowedCodes));
          }
        } else if ((item as any).distri && !item.allowedDistis) {
          const allowedCodes = (item as any).distri.split(",").map((d: string) => d.trim());
          updateItem(index, "allowedDistis", allowedCodes);
          if (!item.overrideDistributor) {
            updateItem(index, "overrideDistributor", pickPreferred(item, allowedCodes));
          }
        }
      }
    };
    if (cart.length > 0) loadAllowedDistis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

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
    field:
      | keyof CartItem
      | "overrideDistributor"
      | "allowedDistis"
      | "lowest_price_brutto"
      | "lowest_price_source"
      | "lowest_price_source_custom",
    value: any
  ) => {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Gemergte Dealer-Infos
  const dealerDisplayName = norm(
    (dealer as any)?.store_name ??
      extraDealer?.store_name ??
      (dealer as any)?.company_name ??
      extraDealer?.company_name ??
      (dealer as any)?.name ??
      ""
  );
  const dealerLoginNr = norm(
    (dealer as any)?.login_nr ?? extraDealer?.login_nr ?? (dealer as any)?.dealer_login_nr ?? ""
  );
  const dealerContact = norm(
    (dealer as any)?.contact_person ??
      extraDealer?.contact_person ??
      (dealer as any)?.dealer_contact_person ??
      ""
  );
  const dealerPhone = norm(
    (dealer as any)?.phone ?? extraDealer?.phone ?? (dealer as any)?.dealer_phone ?? ""
  );
  const dealerKam = norm(
    (dealer as any)?.kam_name ?? (dealer as any)?.kam ?? extraDealer?.kam_name ?? extraDealer?.kam ?? ""
  );

  // Summen
  const totalQuantity = cart.reduce((s, i) => s + toInt(i.quantity || 0), 0);
  const totalPrice = cart.reduce((s, i) => s + toInt(i.quantity || 0) * toInt(i.price || 0), 0);
  const getEkNormal = (item: CartItem) =>
    toInt(
      (item as any).dealer_invoice_price ??
        (item as any).product_price ??
        (item as any).ek_normal ??
        (item as any).ek ??
        0
    );
  const totalSaved = cart.reduce((s, i) => {
    const ek = getEkNormal(i);
    const p = toInt(i.price ?? 0);
    if (ek > 0 && p > 0 && p < ek) return s + (ek - p) * toInt(i.quantity || 1);
    return s;
  }, 0);
  const hasNormalProducts = cart.some((item) => !item.allowedDistis || item.allowedDistis.length === 0);

  // Insert-Helper: requested_delivery (SOFORT/sofort/omit) + Termin
  const tryInsertSubmission = async (
    basePayload: Record<string, any>,
    candidates: Array<"omit" | "upper" | "lower">,
    requestedDate: string | null
  ): Promise<number> => {
    for (const variant of candidates) {
      const payload: Record<string, any> = { ...basePayload };

      if (variant === "upper") payload.requested_delivery = mapUpper(deliveryMode);
      else if (variant === "lower") payload.requested_delivery = mapLower(deliveryMode);
      else delete payload.requested_delivery;

      const mode = (payload.requested_delivery ?? "").toString().toLowerCase();
      if (mode === "termin") payload.requested_delivery_date = requestedDate ?? null;
      else payload.requested_delivery_date = null;

      const { data, error } = await supabase
        .from("submissions")
        .insert(payload as SubmissionInsert)
        .select("submission_id")
        .single();

      if (!error && data?.submission_id) return data.submission_id;

      const isCheckFail =
        (error as any)?.code === "23514" ||
        (typeof (error as any)?.message === "string" &&
          (error as any).message.includes("violates check constraint") &&
          (error as any).message.includes("submissions_requested_delivery_check"));

      if (!isCheckFail) throw error ?? new Error("Unknown insert error");
    }
    throw new Error("Delivery-Constraint konnte mit keiner Variante erfüllt werden.");
  };

  // Bestellung absenden
  const handleSubmit = async () => {
    if (!(dealer as any)?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }

    const hasNormal = cart.some((item) => !item.allowedDistis || item.allowedDistis.length === 0);
    if (hasNormal && !distributor) {
      toast.error("❌ Bitte Haupt-Distributor auswählen.");
      return;
    }

    const requestedDate = normalizeRequestedDate(deliveryMode, deliveryDate);
    if (deliveryMode === "termin" && !requestedDate) {
      toast.error("Bitte ein gültiges Lieferdatum (YYYY-MM-DD) wählen.");
      return;
    }
    if (deliveryMode === "sofort" && deliveryDate) setDeliveryDate("");

    // Produkt-Validierung inkl. Streetprice-Felder
    for (const item of cart) {
      if (!item.quantity || item.quantity <= 0) {
        toast.error("Ungültige Eingabe", {
          description: `Bitte gültige Menge für ${item.product_name ?? (item as any).sony_article ?? "Produkt"} eingeben!`,
        });
        return;
      }
      if (item.allowedDistis?.length && !item.overrideDistributor) {
        toast.error("❌ Distributor fehlt", {
          description: `Bitte Distributor für ${item.product_name ?? (item as any).sony_article} auswählen.`,
        });
        return;
      }
      if (item.lowest_price_source === "Andere" && !(item as any).lowest_price_source_custom?.trim()) {
        toast.error("❌ Anbieter fehlt", {
          description: `Bitte Händlernamen für "Andere" bei ${item.product_name ?? "Produkt"} angeben.`,
        });
        return;
      }
    }

    // Distributor-Codes zu UUIDs prüfen
    const allCodes = new Set<string>();
    for (const item of cart) {
      const code = item.allowedDistis?.length ? (item.overrideDistributor as string) : distributor;
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
      // gruppiere pro Distributor-CODE
      const itemsByCode: Record<string, CartItem[]> = {};
      for (const item of cart) {
        const code = item.allowedDistis?.length ? (item.overrideDistributor as string) : distributor;
        const key = (code || "").toLowerCase();
        if (!itemsByCode[key]) itemsByCode[key] = [];
        itemsByCode[key].push(item);
      }

      const safeNum = (v: any) => (isFinite(v) && !isNaN(v) ? parseFloat(Number(v).toFixed(2)) : 0);

      for (const [distiCodeLower, items] of Object.entries(itemsByCode)) {
        const distiUuid = codeToId.get(distiCodeLower);
        if (!distiUuid) throw new Error(`Distributor-Code "${distiCodeLower}" nicht gefunden.`);

        const basePayload: SubmissionInsert = {
          dealer_id: (dealer as any).dealer_id,
          typ: "bestellung",
          distributor: distiCodeLower, // Code in Kleinbuchstaben
          status: "pending",
          order_comment: orderComment || null,
          dealer_reference: dealerReference || null,
          customer_number: dealerLoginNr || null,
          customer_contact: dealerContact || null,
          customer_phone: dealerPhone || null,

          // Abweichende Lieferadresse
          delivery_name: hasAltDelivery ? deliveryName || null : null,
          delivery_street: hasAltDelivery ? deliveryStreet || null : null,
          delivery_zip: hasAltDelivery ? deliveryZip || null : null,
          delivery_city: hasAltDelivery ? deliveryCity || null : null,
          delivery_country: hasAltDelivery ? deliveryCountry || null : null,
        };

        const submissionId = await tryInsertSubmission(basePayload, ["upper", "lower", "omit"], requestedDate);

        await supabase
          .from("submission_items")
          .insert(
            items.map((i): SubmissionItemInsert => {
              const streetBrutto = i.lowest_price_brutto ?? null;
              const streetNetto = streetBrutto ? safeNum(streetBrutto / 1.077) : 0;
              const dealerPrice = safeNum(i.price ?? 0);
              const marginStreet =
                streetNetto > 0 && dealerPrice > 0
                  ? parseFloat((((streetNetto - dealerPrice) / streetNetto) * 100).toFixed(2))
                  : 0;

              return {
                submission_id: submissionId,
                product_id: Number(i.product_id),
                menge: toInt(i.quantity),
                preis: dealerPrice,
                distributor_id: distiUuid,
                lowest_price_brutto: streetBrutto ? safeNum(streetBrutto) : 0,
                lowest_price_netto: streetNetto,
                lowest_price_source:
                  i.lowest_price_source && i.lowest_price_source.trim() !== ""
                    ? i.lowest_price_source.trim()
                    : null,
                lowest_price_source_custom:
                  i.lowest_price_source === "Andere"
                    ? (i.lowest_price_source_custom ?? "")?.trim() || null
                    : null,
                margin_street: marginStreet,
              };
            })
          )
          .throwOnError();

        // Benachrichtigung
        try {
          await fetch("/api/orders/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ submissionId, stage: "placed" }),
          });
        } catch (e) {
          console.warn("notify failed", e);
        }
      }

      // cleanup
      setCart(() => []);
      onOrderSuccess();
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

      toast.success("✅ Bestellung gespeichert", {
        description: "Die Bestellung wurde erfolgreich übermittelt.",
      });
    } catch (err: any) {
      console.error("Order API Error:", err?.message ?? err);
      toast.error("❌ Fehler beim Speichern", {
        description: err?.message ?? "Unbekannter Fehler",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          ref={cartButtonRef}
          variant="outline"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2
                    border-blue-600 text-blue-600 hover:bg-blue-50
                    dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950
                    transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">Warenkorb {cart.length ? `(${cart.length})` : ""}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[780px] lg:w-[980px] xl:w-[1120px] 2xl:w-[1280px] flex flex-col"
      >
        <SheetHeader className="p-3 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Bestellung zum Bestpreis
          </SheetTitle>
        </SheetHeader>

        {/* Dealer-Info */}
        <div className="mt-2 mb-2 text-xs">
          <div className="font-semibold text-gray-800">{dealerDisplayName}</div>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
            <div className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Kd-Nr.: <span className="font-medium">{dealerLoginNr || "–"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>
                AP: <span className="font-medium">{dealerContact || "–"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Tel.: <span className="font-medium">{dealerPhone || "–"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BadgeInfo className="w-3.5 h-3.5 text-gray-400" />
              <span>
                KAM: <span className="font-medium">{dealerKam || "–"}</span>
              </span>
            </div>
          </div>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-green-600 font-semibold text-lg">✅ Bestellung gespeichert!</p>
            <SheetClose asChild>
              <Button variant="default">Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* 2-Spalten Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 min-h-0">
              {/* Linke Spalte */}
              <div className="space-y-4">
                {hasNormalProducts && (
                  <div className="border rounded-xl p-3 space-y-2 bg-blue-50/40">
                    <label className="block text-xs font-semibold">Haupt-Distributor</label>
                    <Select onValueChange={(v) => setDistributor(v)} value={distributor}>
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

                <div className="border rounded-xl p-3 space-y-3">
                  <p className="text-sm font-semibold">Bestellangaben</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Lieferung</label>
                      <Select
                        value={deliveryMode}
                        onValueChange={(v) => setDeliveryMode(v as "sofort" | "termin")}
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
                      <label className="block text-[11px] text-gray-600 mb-1">Lieferdatum (optional)</label>
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
                    <label className="block text-[11px] text-gray-600 mb-1">Wichtige Infos zur Bestellung (Kommentar)</label>
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
                      <label className="block text-[11px] text-gray-600 mb-1">Ihre Bestell-/Referenz-Nr.</label>
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
                        <label className="block text-[11px] text-gray-600 mb-1">Name / Firma</label>
                        <Input value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Straße / Nr.</label>
                        <Input value={deliveryStreet} onChange={(e) => setDeliveryStreet(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">PLZ</label>
                        <Input value={deliveryZip} onChange={(e) => setDeliveryZip(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Ort</label>
                        <Input value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Land</label>
                        <Input value={deliveryCountry} onChange={(e) => setDeliveryCountry(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Telefon (optional)</label>
                        <Input value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">E-Mail (optional)</label>
                        <Input value={deliveryEmail} onChange={(e) => setDeliveryEmail(e.target.value)} className="h-8 text-xs" />
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* Rechte Spalte: Produkte */}
              <div className="flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <p className="text-gray-500">Noch keine Produkte ausgewählt.</p>
                  ) : (
                    cart.map((item, index) => {
                      const allowed = Array.isArray(item.allowedDistis) ? item.allowedDistis : [];
                      const ek = getEkNormal(item);
                      const p = toInt(item.price ?? 0);
                      const showSavings = ek > 0 && p > 0 && p < ek;
                      const savedCHF = showSavings ? ek - p : 0;
                      const savedPercent = showSavings ? Math.round(((ek - p) / ek) * 100) : 0;

                      return (
                        <div
                          key={index}
                          className={`border rounded-xl p-3 space-y-2 mb-3 ${
                            item.allowedDistis?.length ? "border-amber-300" : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate flex items-center gap-2">
                                {item.product_name || (item as any).sony_article || "Unbekannt"}
                                {item.allowedDistis?.length ? (
                                  <span className="flex items-center gap-1 text-amber-600 text-[11px] font-semibold border border-amber-300 rounded-full px-2 py-0.5">
                                    <Star className="w-3 h-3" /> Spezialvertrieb
                                  </span>
                                ) : null}
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
                            <div>
                              <label className="block text-[11px] text-gray-600 mb-1">Anzahl</label>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateItem(index, "quantity", Math.max(1, toInt(e.target.value)))}
                                className="text-center h-8 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-gray-600 mb-1">Preis (CHF)</label>
                              <Input
                                type="number"
                                value={p}
                                onChange={(e) => updateItem(index, "price", toInt(e.target.value))}
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

                          {/* Günstigster Anbieter / Streetprice pro Produkt */}
                          <div className="mt-4 border-t pt-2 text-xs text-gray-700">
                            <label className="block text-gray-500 mb-1">Günstigster Anbieter</label>
                            <Select
                              value={item.lowest_price_source ?? ""}
                              onValueChange={(val) => {
                                updateItem(index, "lowest_price_source", val);
                                if (val !== "Andere") updateItem(index, "lowest_price_source_custom", null);
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
                                <label className="block text-gray-500 mb-1">Bitte Namen des Anbieters angeben *</label>
                                <Input
                                  placeholder="Name des Händlers"
                                  value={item.lowest_price_source_custom ?? ""}
                                  onChange={(e) => updateItem(index, "lowest_price_source_custom", e.target.value)}
                                  className="text-sm border-amber-400 focus:border-amber-500"
                                />
                                <p className="text-[11px] text-amber-600 mt-1">
                                  Pflichtfeld bei Auswahl von „Andere“ — bitte genaue Händlerangabe.
                                </p>
                              </div>
                            )}

                            <label className="block text-gray-500 mb-1 mt-3">Günstigster Preis (inkl. MwSt.)</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={item.lowest_price_brutto ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "lowest_price_brutto",
                                  e.target.value === "" ? null : parseFloat(e.target.value) || null
                                )
                              }
                              className="text-sm"
                            />
                          </div>

                          {/* Spezial-Distributor Auswahl (Pflicht bei allowedDistis) */}
                          {allowed.length > 0 && (
                            <div>
                              <label className="block text-[11px] text-gray-600 mb-1">Distributor (Pflichtfeld)</label>
                              <Select
                                value={item.overrideDistributor || ""}
                                onValueChange={(val) => updateItem(index, "overrideDistributor", val)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Bitte auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                  {distis
                                    .filter((d) => allowed.some((c) => c.toLowerCase() === d.code.toLowerCase()))
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
                    })
                  )}

                  {/* Sticky Footer */}
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
                      <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading ? "⏳ Sende…" : "✅ Bestellung absenden"}
                      </Button>
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
