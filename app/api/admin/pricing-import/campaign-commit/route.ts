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
  campaign_id: number;
  product_id: number;
  pricing_group_id: number;
  messe_price_netto: number | null;
  display_price_netto: number | null;
  display_discount_percent: number | null;
  active: boolean;
  note: string | null;
  updated_at: string;
};

function normalizeHeader(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .replace(/%/g, "percent");
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
    .replace("%", "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
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
    const campaignIdRaw = formData.get("campaign_id");
    const pricingGroupIdRaw = formData.get("pricing_group_id");
    const dryRunRaw = formData.get("dry_run");

    const campaign_id = Number(campaignIdRaw);
    const pricing_group_id = Number(pricingGroupIdRaw);
    const dry_run = String(dryRunRaw || "false") === "true";

    if (!campaign_id || Number.isNaN(campaign_id)) {
      return NextResponse.json(
        { error: "campaign_id ist ungültig." },
        { status: 400 }
      );
    }

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

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("campaign_id, code, name, active")
      .eq("campaign_id", campaign_id)
      .eq("active", true)
      .maybeSingle();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Kampagne nicht gefunden oder inaktiv." },
        { status: 400 }
      );
    }

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

    const cleanedRows = normalizedRows.filter((row) => {
      return Object.values(row).some((value) => {
        return value !== null && String(value).trim() !== "";
      });
    });

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("product_id, ean, sony_article, product_name, active")
      .in("active", [true, false]);

    if (productsError) {
      return NextResponse.json(
        {
          error: `Produkte konnten nicht geladen werden: ${productsError.message}`,
        },
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

    for (const row of cleanedRows) {
      const ean = normalizeEan(
        pick(row, ["ean", "ean_code", "ean_nummer"])
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

      const messe_price_netto = parseNumber(
        pick(row, [
          "messe_price_netto",
          "messepreis_netto",
          "messepreis",
          "campaign_price",
          "kampagnenpreis",
        ])
      );

      const display_price_netto = parseNumber(
        pick(row, [
          "display_price_netto",
          "displaypreis_netto",
          "displaypreis",
          "display_price",
        ])
      );

      const display_discount_percent = parseNumber(
        pick(row, [
          "display_discount_percent",
          "display_discount",
          "display_rabatt_percent",
          "display_rabatt",
          "rabatt",
        ])
      );

      const note = normalizeText(
        pick(row, ["note", "bemerkung", "kommentar", "comment"])
      );

      if (!ean && !sony_article) {
        errorRows++;
        continue;
      }

      if (
        messe_price_netto === null &&
        display_price_netto === null &&
        display_discount_percent === null
      ) {
        errorRows++;
        continue;
      }

      let matchedProduct: ProductRow | null = null;

      if (ean) {
        matchedProduct = productsByEan.get(ean) || null;
      }

      if (!matchedProduct && sony_article) {
        const matches =
          productsBySonyArticle.get(sony_article.toLowerCase()) || [];

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
        campaign_id,
        product_id: matchedProduct.product_id,
        pricing_group_id,
        messe_price_netto,
        display_price_netto,
        display_discount_percent,
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
        .from("campaign_product_group_prices")
        .select("product_id")
        .eq("campaign_id", campaign_id)
        .eq("pricing_group_id", pricing_group_id)
        .in("product_id", productIds);

      if (existingError) {
        return NextResponse.json(
          {
            error: `Bestehende Kampagnenpreise konnten nicht geprüft werden: ${existingError.message}`,
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
      const { data: existingCampaignProducts, error: existingCampaignProductsError } =
        await supabaseAdmin
          .from("campaign_products")
          .select("product_id")
          .eq("campaign_id", campaign_id)
          .in("product_id", productIds);

      if (existingCampaignProductsError) {
        return NextResponse.json(
          {
            error: `Bestehende Kampagnenprodukte konnten nicht geprüft werden: ${existingCampaignProductsError.message}`,
          },
          { status: 500 }
        );
      }

      const existingCampaignProductIds = new Set(
        (existingCampaignProducts || []).map((row: any) => Number(row.product_id))
      );

      const missingCampaignProducts = validRows
        .filter((row) => !existingCampaignProductIds.has(row.product_id))
        .map((row) => ({
          campaign_id,
          product_id: row.product_id,
          active: true,
          pricing_mode:
            row.messe_price_netto !== null &&
            (row.display_price_netto !== null ||
              row.display_discount_percent !== null)
              ? "mixed"
              : row.messe_price_netto !== null
                ? "messe"
                : "display",
          messe_price_netto: row.messe_price_netto,
          display_price_netto: row.display_price_netto,
          display_discount_percent: row.display_discount_percent,
          bonus_relevant: true,
          notes: row.note,
          updated_at: now,
        }));

      if (missingCampaignProducts.length > 0) {
        const { error: insertCampaignProductsError } = await supabaseAdmin
          .from("campaign_products")
          .insert(missingCampaignProducts);

        if (insertCampaignProductsError) {
          return NextResponse.json(
            {
              error: `Fehlende Kampagnenprodukte konnten nicht angelegt werden: ${insertCampaignProductsError.message}`,
            },
            { status: 500 }
          );
        }
      }
    }
    
    if (!dry_run && validRows.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("campaign_product_group_prices")
        .upsert(validRows, {
          onConflict: "campaign_id,product_id,pricing_group_id",
        });

      if (upsertError) {
        return NextResponse.json(
          { error: `Kampagnenimport fehlgeschlagen: ${upsertError.message}` },
          { status: 500 }
        );
      }
    }

    const { error: historyError } = await supabaseAdmin
      .from("campaign_product_group_price_imports")
      .insert({
        campaign_id,
        pricing_group_id,
        file_name: file.name,
        dry_run,
        total_rows: cleanedRows.length,
        matched_rows: validRows.length,
        inserted_rows: dry_run ? 0 : insertedRows,
        updated_rows: dry_run ? 0 : updatedRows,
        error_rows: errorRows,
        status: "completed",
        note: dry_run
          ? "Dry Run für Kampagnenpreise ausgeführt. Keine Preise importiert."
          : "Kampagnenpreise erfolgreich importiert.",
        created_by: user.id,
      });

    if (historyError) {
      return NextResponse.json(
        {
          error: `Import verarbeitet, aber History konnte nicht geschrieben werden: ${historyError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dry_run,
      campaign,
      pricing_group: pricingGroup,
      file_name: file.name,
      total_rows: cleanedRows.length,
      matched_rows: validRows.length,
      inserted_rows: dry_run ? 0 : insertedRows,
      updated_rows: dry_run ? 0 : updatedRows,
      error_rows: errorRows,
      message: dry_run
        ? "Dry Run erfolgreich. Es wurden keine Kampagnenpreise importiert."
        : "Kampagnenpreise erfolgreich importiert.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Serverfehler";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}