import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import * as XLSX from "xlsx";

type ProductRow = {
  product_id: number;
  ean: string;
  sony_article: string | null;
  product_name: string;
  active: boolean | null;
};

type ValidImportRow = {
  product_id: number;
  pricing_group_id: number;
  dealer_invoice_price: number | null;
  price_on_invoice: number | null;
  toppreise_allowed: boolean | null;
  active: boolean;
  note: string | null;
  updated_at: string;
};

function normalizeHeader(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function normalizeEan(value: unknown): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  return raw.replace(/\.0$/, "");
}

function normalizeText(value: unknown): string | null {
  const raw = String(value || "").trim();
  return raw || null;
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const raw = String(value)
    .trim()
    .replace("CHF", "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;

  const raw = String(value).trim().toLowerCase();

  if (["true", "yes", "ja", "1", "x"].includes(raw)) return true;
  if (["false", "no", "nein", "0"].includes(raw)) return false;

  return null;
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key];
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
    }

    if (
      user.app_metadata?.role !== "admin" &&
      user.app_metadata?.role !== "superadmin"
    ) {
      return NextResponse.json(
        { error: "Keine Berechtigung." },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file");
    const pricingGroupIdRaw = formData.get("pricing_group_id");
    const dryRunRaw = formData.get("dry_run");

    const pricing_group_id = Number(pricingGroupIdRaw);
    const dry_run = String(dryRunRaw || "false") === "true";

    if (!pricing_group_id || Number.isNaN(pricing_group_id)) {
      return NextResponse.json(
        { error: "pricing_group_id ist ungültig." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Keine Excel-Datei erhalten." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: pricingGroup, error: pricingGroupError } =
      await supabaseAdmin
        .from("dealer_pricing_groups")
        .select("pricing_group_id, code, name, active")
        .eq("pricing_group_id", pricing_group_id)
        .eq("active", true)
        .maybeSingle();

    if (pricingGroupError || !pricingGroup) {
      return NextResponse.json(
        { error: "Pricing-Gruppe nicht gefunden oder inaktiv." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        { error: "Excel-Datei enthält kein Tabellenblatt." },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[firstSheetName];

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
    });

    const normalizedRows = rawRows.map((rawRow) => {
      const normalized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(rawRow)) {
        normalized[normalizeHeader(key)] = value;
      }

      return normalized;
    });

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("product_id, ean, sony_article, product_name, active")
      .in("active", [true, false]);

    if (productsError) {
      return NextResponse.json(
        { error: `Produkte konnten nicht geladen werden: ${productsError.message}` },
        { status: 500 }
      );
    }

    const productRows = (products || []) as ProductRow[];

    const productsByEan = new Map<string, ProductRow>();
    const productsBySonyArticle = new Map<string, ProductRow[]>();

    for (const product of productRows) {
      const ean = normalizeEan(product.ean);
      if (ean) productsByEan.set(ean, product);

      const sonyArticle = normalizeText(product.sony_article);
      if (sonyArticle) {
        const key = sonyArticle.toLowerCase();
        const list = productsBySonyArticle.get(key) || [];
        list.push(product);
        productsBySonyArticle.set(key, list);
      }
    }

    const validRowsByProductId = new Map<number, ValidImportRow>();
    let errorRows = 0;
    const now = new Date().toISOString();

    for (const [index, row] of normalizedRows.entries()) {
      const ean = normalizeEan(
        pick(row, ["ean", "ean_code", "ean_code_", "ean_nummer"])
      );

      const sony_article = normalizeText(
        pick(row, [
          "sony_article",
          "sony_artikel",
          "artikel",
          "artikelnummer",
          "sony_artikelnummer",
          "article",
        ])
      );

      const dealer_invoice_price = parseNumber(
        pick(row, [
          "dealer_invoice_price",
          "haendlerpreis",
          "handlerpreis",
          "dealer_price",
          "einkaufspreis",
          "preis",
        ])
      );

      const price_on_invoice = parseNumber(
        pick(row, [
          "price_on_invoice",
          "rechnungspreis",
          "displaypreis",
          "displaypreis_netto",
          "invoice_price",
        ])
      );

      const toppreise_allowed = parseBoolean(
        pick(row, [
          "toppreise_allowed",
          "toppreise",
          "toppreise_erlaubt",
          "toppreise_allowed?",
        ])
      );

      const note = normalizeText(
        pick(row, ["note", "bemerkung", "kommentar", "comment"])
      );

      if (!ean && !sony_article) {
        errorRows++;
        continue;
      }

      if (dealer_invoice_price === null && price_on_invoice === null) {
        errorRows++;
        continue;
      }

      let matchedProduct: ProductRow | null = null;

      if (ean) {
        matchedProduct = productsByEan.get(ean) || null;
      }

      if (!matchedProduct && sony_article) {
        const matches = productsBySonyArticle.get(sony_article.toLowerCase()) || [];
        if (matches.length === 1) {
          matchedProduct = matches[0];
        } else if (matches.length > 1) {
          errorRows++;
          continue;
        }
      }

      if (!matchedProduct) {
        errorRows++;
        continue;
      }

      if (matchedProduct.active !== true) {
        errorRows++;
        continue;
      }

      validRowsByProductId.set(matchedProduct.product_id, {
        product_id: matchedProduct.product_id,
        pricing_group_id,
        dealer_invoice_price,
        price_on_invoice,
        toppreise_allowed,
        active: true,
        note,
        updated_at: now,
      });
    }

    const validRows = Array.from(validRowsByProductId.values());
    const productIds = validRows.map((row) => row.product_id);

    let existingProductIds = new Set<number>();

    if (productIds.length > 0) {
      const { data: existingRows, error: existingError } = await supabaseAdmin
        .from("standard_product_group_prices")
        .select("product_id")
        .eq("pricing_group_id", pricing_group_id)
        .in("product_id", productIds);

      if (existingError) {
        return NextResponse.json(
          {
            error: `Bestehende Gruppenpreise konnten nicht geprüft werden: ${existingError.message}`,
          },
          { status: 500 }
        );
      }

      existingProductIds = new Set(
        (existingRows || []).map((row: any) => Number(row.product_id))
      );
    }

    const updatedRows = validRows.filter((row) =>
      existingProductIds.has(row.product_id)
    ).length;

    const insertedRows = validRows.length - updatedRows;

    if (!dry_run && validRows.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("standard_product_group_prices")
        .upsert(validRows, {
          onConflict: "product_id,pricing_group_id",
        });

      if (upsertError) {
        return NextResponse.json(
          { error: `Import fehlgeschlagen: ${upsertError.message}` },
          { status: 500 }
        );
      }
    }

    const { error: historyError } = await supabaseAdmin
      .from("standard_product_group_price_imports")
      .insert({
        pricing_group_id,
        file_name: file.name,
        dry_run,
        total_rows: normalizedRows.length,
        matched_rows: validRows.length,
        inserted_rows: dry_run ? 0 : insertedRows,
        updated_rows: dry_run ? 0 : updatedRows,
        error_rows: errorRows,
        status: "completed",
        note: dry_run
          ? "Dry Run ausgeführt. Keine Preise importiert."
          : "Import erfolgreich ausgeführt.",
        created_by: user.id,
      });

    if (historyError) {
      return NextResponse.json(
        {
          error: `Import wurde verarbeitet, aber History konnte nicht geschrieben werden: ${historyError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dry_run,
      pricing_group: pricingGroup,
      file_name: file.name,
      total_rows: normalizedRows.length,
      matched_rows: validRows.length,
      inserted_rows: dry_run ? 0 : insertedRows,
      updated_rows: dry_run ? 0 : updatedRows,
      error_rows: errorRows,
      message: dry_run
        ? "Dry Run erfolgreich. Es wurden keine Preise importiert."
        : "Import erfolgreich abgeschlossen.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Serverfehler";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}