import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* --------------------------------------------------
   Supabase Service Client
-------------------------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "sofortrabatt-invoices";

type PromoType = "classic_fixed" | "tv55_soundbar_percent";

/* --------------------------------------------
   Helpers
-------------------------------------------- */
function getProductRole(item: any): "tv" | "soundbar" | "sub" | null {
  const c = (item.category || item.gruppe || "").toLowerCase();
  if (c.includes("tv")) return "tv";
  if (c.includes("soundbar")) return "soundbar";
  if (c.includes("sub")) return "sub";
  return null;
}

function parseTvInches(product: any): number {
  const direct =
    Number(product?.screen_size_inch) ||
    Number(product?.size_inch) ||
    Number(product?.inch) ||
    0;

  if (direct > 0) return direct;

  const source = [
    product?.sony_article,
    product?.product_name,
    product?.name,
    product?.title,
  ]
    .filter(Boolean)
    .join(" ");

  const match = source.match(/(\d{2,3})\s*(?:["]|zoll|inch)/i);
  if (match) return Number(match[1]);

  const sonyMatch = source.match(/(?:^|[^\d])(\d{2,3})(?:[A-Z]|$)/);
  if (sonyMatch) {
    const value = Number(sonyMatch[1]);
    if (value >= 32 && value <= 100) return value;
  }

  return 0;
}

function toNumber(value: any) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(",", ".").trim();
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

/* --------------------------------------------
   Klassische Fixbetrag-Promo
-------------------------------------------- */
function calculateClassicRabatt(items: any[]) {
  const roles = items.map(getProductRole);

  const tvCount = roles.filter((r) => r === "tv").length;
  const soundbarCount = roles.filter((r) => r === "soundbar").length;
  const subCount = roles.filter((r) => r === "sub").length;

  if (tvCount !== 1) throw new Error("Genau ein TV ist erforderlich");
  if (soundbarCount > 1 || subCount > 1) {
    throw new Error("Maximal eine Soundbar und ein Subwoofer erlaubt");
  }

  let rabattLevel: 1 | 2 | 3 = 1;
  if (soundbarCount === 1 && subCount === 1) rabattLevel = 3;
  else if (soundbarCount === 1) rabattLevel = 2;

  const tvItem = items.find((i) => getProductRole(i) === "tv");
  if (!tvItem) throw new Error("TV nicht gefunden");

  let rabattBetrag = 0;
  if (rabattLevel === 1) rabattBetrag = Number(tvItem.sofortrabatt_amount || 0);
  if (rabattLevel === 2) rabattBetrag = Number(tvItem.sofortrabatt_double_amount || 0);
  if (rabattLevel === 3) rabattBetrag = Number(tvItem.sofortrabatt_triple_amount || 0);

  return {
    rabattLevel,
    rabattBetrag: Number(rabattBetrag.toFixed(2)),
    detailComment: `Promo classic_fixed / Rabatt-Level ${rabattLevel}`,
    enrichedProducts: items.map((i) => ({
      product_name: i.product_name || i.sony_article,
      ean: i.ean,
      category: i.category || i.gruppe,
      qty: 1,
    })),
  };
}

/* --------------------------------------------
   Neue Prozent-Promo
-------------------------------------------- */
function calculatePercentPromoRabatt(
  items: any[],
  salesPrices: { soundbar?: number; subwoofer?: number }
) {
  const roles = items.map(getProductRole);

  const tvCount = roles.filter((r) => r === "tv").length;
  const soundbarCount = roles.filter((r) => r === "soundbar").length;
  const subCount = roles.filter((r) => r === "sub").length;

  if (tvCount !== 1) throw new Error("Genau ein TV ist erforderlich");
  if (soundbarCount !== 1) {
    throw new Error("Für diese Promo ist genau eine Soundbar erforderlich");
  }
  if (subCount > 1) throw new Error("Maximal ein Subwoofer erlaubt");

  const tvItem = items.find((i) => getProductRole(i) === "tv");
  const soundbarItem = items.find((i) => getProductRole(i) === "soundbar");
  const subItem = items.find((i) => getProductRole(i) === "sub");

  if (!tvItem || !soundbarItem) {
    throw new Error("Ungültige Artikelkombination");
  }

  const tvInches = parseTvInches(tvItem);
  if (tvInches < 55) {
    throw new Error("Die Promotion gilt nur für TVs ab 55 Zoll");
  }

  const soundbarPrice = toNumber(salesPrices.soundbar);
  if (soundbarPrice <= 0) {
    throw new Error("Bitte gültigen Verkaufspreis der Soundbar übermitteln");
  }

  const soundbarDiscount = Number((soundbarPrice * 0.3).toFixed(2));

  let subPrice = 0;
  let subDiscount = 0;

  if (subItem) {
    subPrice = toNumber(salesPrices.subwoofer);
    if (subPrice <= 0) {
      throw new Error("Bitte gültigen Verkaufspreis des Subwoofers übermitteln");
    }
    subDiscount = Number((subPrice * 0.5).toFixed(2));
  }

  const totalDiscount = Number((soundbarDiscount + subDiscount).toFixed(2));
  const rabattLevel: 2 | 3 = subItem ? 3 : 2;

  return {
    rabattLevel,
    rabattBetrag: totalDiscount,
    detailComment:
      `Promo tv55_soundbar_percent / TV ${tvInches}" / ` +
      `Soundbar VK ${soundbarPrice.toFixed(2)} CHF => Rabatt ${soundbarDiscount.toFixed(2)} CHF` +
      (subItem
        ? ` / Subwoofer VK ${subPrice.toFixed(2)} CHF => Rabatt ${subDiscount.toFixed(2)} CHF`
        : ""),
    enrichedProducts: items.map((i) => {
      const role = getProductRole(i);

      return {
        product_name: i.product_name || i.sony_article,
        ean: i.ean,
        category: i.category || i.gruppe,
        qty: 1,
        tv_size_inch: role === "tv" ? tvInches : null,
        sales_price:
          role === "soundbar"
            ? soundbarPrice
            : role === "sub"
            ? subPrice
            : null,
        calculated_discount:
          role === "soundbar"
            ? soundbarDiscount
            : role === "sub"
            ? subDiscount
            : 0,
      };
    }),
  };
}

function calculateRabattByPromo(
  promoType: PromoType,
  items: any[],
  salesPrices: { soundbar?: number; subwoofer?: number }
) {
  if (promoType === "tv55_soundbar_percent") {
    return calculatePercentPromoRabatt(items, salesPrices);
  }

  return calculateClassicRabatt(items);
}

/* --------------------------------------------
   POST Handler
-------------------------------------------- */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const dealer_id = Number(formData.get("dealer_id"));
    const itemsRaw = formData.get("items");
    const promoType = String(
      formData.get("promo_type") || "classic_fixed"
    ) as PromoType;
    const salesPricesRaw = formData.get("sales_prices");

    const filesRaw = formData.getAll("files") as unknown[];

    if (!dealer_id || !itemsRaw) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const items = JSON.parse(itemsRaw as string);
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items müssen ein Array sein" },
        { status: 400 }
      );
    }

    const salesPrices = salesPricesRaw
      ? JSON.parse(String(salesPricesRaw))
      : {};

    const files = filesRaw
      .filter((f) => f && typeof f !== "string")
      .map((f) => f as File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Bitte mindestens eine Rechnung hochladen" },
        { status: 400 }
      );
    }

    /* 1) Upload Files */
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeName = file.name.replace(/[^\w.\-()]+/g, "_");
      const filePath = `${dealer_id}/sofort-${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(BUCKET).remove(uploadedPaths);
        }
        throw uploadError;
      }

      uploadedPaths.push(filePath);
    }

    /* 2) Rabatt berechnen */
    const { rabattLevel, rabattBetrag, detailComment, enrichedProducts } =
      calculateRabattByPromo(promoType, items, salesPrices);

    /* 3) Claim speichern */
    const { error: insertError } = await supabase
      .from("sofortrabatt_claims")
      .insert([
        {
          dealer_id,
          rabatt_level: rabattLevel,
          rabatt_betrag: rabattBetrag,
          invoice_file_url: JSON.stringify(uploadedPaths),
          status: "pending",
          products: enrichedProducts,
          comment: detailComment,
        },
      ]);

    if (insertError) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      files: uploadedPaths,
      rabatt_betrag: rabattBetrag,
    });
  } catch (e: any) {
    console.error("❌ Sofortrabatt Error:", e);
    return NextResponse.json(
      { error: e.message || "Unbekannter Fehler" },
      { status: 400 }
    );
  }
}