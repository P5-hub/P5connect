"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calcInvestByRule } from "@/lib/helpers/calcHelpers";


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
  ClipboardList,
  Trash2,
  Star,
  Tag,
  Hash,
  User,
  FolderKanban,
  MapPin,
  FileText,
  Calendar,
  Phone,
  BadgeInfo,
} from "lucide-react";

import { useDealer } from "@/app/(dealer)/DealerContext";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

import type { Database } from "@/types/supabase";
import type { CartItem } from "@/app/(dealer)/types/CartItem";

type Disti = {
  id: string;
  code: string;
  name: string;
  invest_rule: string | null;
};

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
   🧱 PRODUKTKARTE (Projekt)
------------------------------------------------------------------- */

function ProductCardProjekt({
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
    form:
      | "verkauf"
      | "bestellung"
      | "projekt"
      | "support"
      | "sofortrabatt"
      | "cashback",
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
  const savedCHF = showSavings ? ek - price : 0;
  const savedPercent = showSavings
    ? Math.round(((ek - price) / ek) * 100)
    : 0;

  return (
    <div
      className={`border rounded-xl p-3 space-y-2 mb-3 ${
        allowed.length ? "border-amber-300" : "border-gray-200"
      }`}
    >
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
              updateItem("projekt", index, {
                quantity: Math.max(1, toInt(e.target.value)),
              })
            }
            className="text-center h-8 text-xs"
          />
        </div>

        {/* Preis */}
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">
            Projektpreis (CHF)
          </label>

          <Input
            type="number"
            value={price}
            onChange={(e) =>
              updateItem("projekt", index, {
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
            updateItem("projekt", index, {
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
                updateItem("projekt", index, {
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
            updateItem("projekt", index, {
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
              updateItem("projekt", index, { overrideDistributor: val })
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
   🧱 PRODUKTLISTE (Projekt)
------------------------------------------------------------------- */

function ProductListProjekt({
  cart,
  distis,
  updateItem,
  removeFromCart,
}: {
  cart: CartItem[];
  distis: Disti[];
  updateItem: (
    form:
      | "verkauf"
      | "bestellung"
      | "projekt"
      | "support"
      | "sofortrabatt"
      | "cashback",
    index: number,
    updates: Partial<any>
  ) => void;
  removeFromCart: (index: number) => void;
}) {
  if (cart.length === 0) {
    return <p className="text-gray-500">Noch keine Produkte im Projekt.</p>;
  }

  return (
    <>
      {cart.map((item, index) => (
        <ProductCardProjekt
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
   🟪 HAUPTKOMPONENTE: CartProjekt
------------------------------------------------------------------- */

export default function CartProjekt() {
  const dealer = useDealer();
  const supabase = getSupabaseBrowser();

  // GLOBAL CART
  const {
    state,
    getItems,
    removeItem,
    clearCart,
    closeCart,
    updateItem,
    projectDetails, // 👈 wird verwendet
  } = useCart();




  const cart = (
    (getItems("projekt") as (CartItem | undefined)[]) || []
  ).filter((item): item is CartItem => Boolean(item));

  const open = state.open && state.currentForm === "projekt";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [distis, setDistis] = useState<Disti[]>([]);
  const [distributor, setDistributor] = useState<string>("ep");

  // Lieferadresse (optional auch bei Projekten)
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

  // Projekt-Stammdaten
  // Projekt-Stammdaten
  const [details, setDetails] = useState<{
    type: string;
    name: string;
    customer: string;
    location: string;
    start: string;
    end: string;
    comment: string;
    files: File[];
  }>({
    type: "",
    name: "",
    customer: "",
    location: "",
    start: "",
    end: "",
    comment: "",
    files: [],
  });

  // 📎 Projekt-Dateien (CSV, PDF, etc.)
const projectFiles: File[] = details.files;



  const patchDetails = (
    patch: Partial<{
      type: string;
      name: string;
      customer: string;
      location: string;
      start: string;
      end: string;
      comment: string;
      files: File[];
    }>
  ) =>
    setDetails((prev) => ({ ...prev, ...patch }));


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
    if (projectDetails && Object.keys(projectDetails).length > 0) {
      setDetails((prev) => ({
        ...prev,
        ...projectDetails,
        files: projectDetails.files ?? prev.files,
      }));
    }
  }, [projectDetails]);




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
        const { data } = await supabase
          .from("product_distributors")
          .select("distributor_id, distributors(code)")
          .eq("product_id", Number((item as any).product_id));

        if (data && data.length > 0) {
          const allowed = data
            .map((d: any) => d.distributors?.code)
            .filter(Boolean) as string[];

          updateItem("projekt", index, {
            allowedDistis: allowed,
            overrideDistributor:
              (item as any).overrideDistributor ??
              pickPreferred(item as CartItem, allowed),
          });
        }
      }
    };

    if (cart.length > 0) loadAllowedDistis();
  }, [cart.length, supabase, cart, updateItem]);

  /* ------------------------------------------------------------------
     🧹 REMOVE ITEM WRAPPER
  ------------------------------------------------------------------- */

  const removeFromCart = useCallback(
    (index: number) => removeItem("projekt", index),
    [removeItem]
  );

  /* ------------------------------------------------------------------
     SUBMISSION LOGIC (Projekt)
  ------------------------------------------------------------------- */
  const submitProject = async () => {
    if (!(dealer as any)?.dealer_id) {
      toast.error("❌ Kein Händler gefunden – bitte neu einloggen.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Keine Produkte im Projekt.");
      return;
    }

    // ℹ️ KEINE Pflichtfelder mehr – nur Hinweis
    if (
      !details.type.trim() &&
      !details.name.trim() &&
      !details.customer.trim() &&
      !details.location.trim()
    ) {
      toast.message("ℹ️ Projekt wird ohne detaillierte Angaben gespeichert.");
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

    // 🔎 Produkt-Validierung bleibt
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
      // 1️⃣ Projekt-Stammdaten
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_id: (dealer as any).dealer_id,
          login_nr: (dealer as any).login_nr,
          project_type: details.type || null,
          project_name: details.name || null,
          customer: details.customer || null,
          location: details.location || null,
          start_date: details.start || null,
          end_date: details.end || null,
          comment: details.comment || null,
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Fehler beim Speichern des Projekts.");
      }

      const { project_id } = await res.json();

      // 📎 DATEI-UPLOADS (CSV / Anhänge)
      for (const file of projectFiles) {

        // 🔒 SCHRITT 3 – SICHERHEITSCHECK (HIER!)
        if (!(file instanceof File)) {
          console.error("Ungültiges File-Objekt:", file);
          throw new Error(
            `Ungültige Datei erkannt (${(file as any)?.name ?? "unbekannt"})`
          );
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("project_id", project_id);
        fd.append("dealer_id", String((dealer as any).dealer_id));
        fd.append("login_nr", String((dealer as any).login_nr ?? ""));

        const uploadRes = await fetch("/api/project-files/upload", {
          method: "POST",
          body: fd,
        });

        if (!uploadRes.ok) {
          const e = await uploadRes.json().catch(() => ({}));
          throw new Error(
            `Datei-Upload fehlgeschlagen (${file.name}): ${e.error ?? "Unbekannt"}`
          );
        }
      }



      // 2️⃣ Items gruppieren & speichern
      const itemsByCode: Record<string, CartItem[]> = {};

      for (const item of cart as any[]) {
        const code = item.allowedDistis?.length
          ? item.overrideDistributor
          : distributor;
        const key = (code || "").toLowerCase();
        if (!itemsByCode[key]) itemsByCode[key] = [];
        itemsByCode[key].push(item as CartItem);
      }

      for (const [codeLower, items] of Object.entries(itemsByCode)) {
        const distiUuid = codeToId.get(codeLower);
        if (!distiUuid) throw new Error(`Distributor "${codeLower}" nicht gefunden`);

        const { data: subData, error: subErr } = await supabase
          .from("submissions")
          .insert({
            dealer_id: (dealer as any).dealer_id,
            typ: "projekt",
            distributor: codeLower,
            project_id,
            status: "pending",
          })
          .select("submission_id")
          .single();

        if (subErr || !subData) throw subErr;

        const submissionId = subData.submission_id;

        const itemPayloads = items.map((i: any) => ({
          submission_id: submissionId,
          product_id: Number(i.product_id),
          ean: i.ean || null,
          product_name: i.product_name || i.sony_article || null,
          menge: toInt(i.quantity),
          preis: toInt(i.price),
          distributor_id: distiUuid,
          project_id,
        }));

        const { error: itemsErr } = await supabase
          .from("submission_items")
          .insert(itemPayloads);

        if (itemsErr) throw itemsErr;
      }

      // 🧹 Cleanup
      clearCart("projekt");
      setSuccess(true);
      setDistributor("ep");
      setDeliveryMode("sofort");
      setDeliveryDate("");
      setOrderComment("");
      setDealerReference("");
      setHasAltDelivery(false);

      setDetails({
        type: "",
        name: "",
        customer: "",
        location: "",
        start: "",
        end: "",
        comment: "",
        files: [], // 👈 WICHTIG
      });


      toast.success("✅ Projekt erfolgreich gespeichert");
    } catch (err: any) {
      console.error("Projekt API Error:", err);
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
          <SheetTitle className="flex items-center gap-2 text-base text-purple-700">
            <ClipboardList className="w-5 h-5" />
            Projektanfrage absenden
          </SheetTitle>
        </SheetHeader>

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
            <p className="text-purple-600 font-semibold text-lg">
              🎉 Projekt gespeichert!
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              {details.name && <p>🏗️ {details.name}</p>}
              {details.customer && <p>👤 {details.customer}</p>}
              {details.location && <p>📍 {details.location}</p>}
              {details.type && <p>📁 {details.type}</p>}
            </div>
            <SheetClose asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Schließen
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* 2-Spalten Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 min-h-0">
              {/* Linke Spalte */}
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Projektangaben */}
                <div className="border rounded-xl p-3 space-y-3 bg-purple-50/40">
                  <p className="text-sm font-semibold flex items-center gap-2 text-purple-700">
                    <FolderKanban className="w-4 h-4" />
                    Projektangaben
                  </p>

                  <div className="space-y-2 text-sm">
                    {projectDetails?.name && (
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-gray-500" />
                        <span>{projectDetails.name}</span>
                      </div>
                    )}

                    {projectDetails?.customer && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{projectDetails.customer}</span>
                      </div>
                    )}

                    {projectDetails?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{projectDetails.location}</span>
                      </div>
                    )}

                    {projectDetails?.type && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{projectDetails.type}</span>
                      </div>
                    )}

                    {(projectDetails?.start || projectDetails?.end) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {projectDetails.start || "–"} → {projectDetails.end || "–"}
                        </span>
                      </div>
                    )}

                    {projectDetails?.comment && (
                      <div className="text-xs italic text-gray-600 mt-2">
                        {projectDetails.comment}
                      </div>
                    )}
                  </div>
                </div>


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

                {/* Bestellangaben / Lieferung (optional für Projekte) */}
                <div className="border rounded-xl p-3 space-y-3">
                  <p className="text-sm font-semibold">
                    Liefer-/Projektangaben
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
                      Wichtige Infos zur Projektbestellung (Kommentar)
                    </label>

                    <textarea
                      value={orderComment}
                      onChange={(e) => setOrderComment(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-xs"
                      rows={3}
                      placeholder="z. B. 'Lieferung in Etappen, Montagefenster'…"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">
                        Ihre Projekt-/Bestell-Referenz
                      </label>

                      <Input
                        value={dealerReference}
                        onChange={(e) => setDealerReference(e.target.value)}
                        placeholder="z. B. PROJ-2025-001"
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

                    <label
                      htmlFor="altDelivery"
                      className="text-sm font-medium"
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
              </div>

              {/* Rechte Spalte – PRODUKTLISTE */}
              <div className="flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1">
                  <ProductListProjekt
                    cart={cart}
                    distis={distis}
                    updateItem={updateItem}
                    removeFromCart={removeFromCart}
                  />

                  {/* Sticky Footer */}
                  {projectFiles.length > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="font-semibold">Angehängte Dateien:</p>
                      {projectFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          {f.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t mt-2 p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Gesamt:</span>
                        <span>{totalQuantity} Stück</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Projektpreis total:</span>
                        <span>{totalPrice.toFixed(0)} CHF</span>
                      </div>

                      {totalSaved > 0 && (
                        <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg py-1.5">
                          <Tag className="w-4 h-4" />
                          Gesamtersparnis: {totalSaved.toFixed(0)} CHF
                        </div>
                      )}

                      {/* Projekt absenden */}
                      <Button
                        onClick={submitProject}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {loading ? "Wird gesendet…" : "✅ Projekt absenden"}
                      </Button>

                      {/* Weiter bearbeiten */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={closeCart}
                      >
                        Weiter konfigurieren
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
