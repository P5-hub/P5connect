import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function formatCsvValue(value: unknown) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\|/g, " ")
    .replace(/\r?\n/g, " ");
}

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Bearer Token lesen
    // --------------------------------------------------

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tokenHash = hashToken(token);

    // --------------------------------------------------
    // 2. Server-Supabase Client
    // --------------------------------------------------

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // --------------------------------------------------
    // 3. Token prüfen
    // --------------------------------------------------

    const { data: tokenRow, error: tokenError } = await supabase
      .from("dealer_api_tokens")
      .select(`
        id,
        dealer_id,
        active,
        expires_at,
        revoked_at
      `)
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenError) {
      console.error("Token lookup error:", tokenError);

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (!tokenRow.active || tokenRow.revoked_at) {
      return NextResponse.json(
        { error: "Token inactive" },
        { status: 401 }
      );
    }

    if (
      tokenRow.expires_at &&
      new Date(tokenRow.expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 401 }
      );
    }

    // Händler-ID kommt AUSSCHLIESSLICH aus dem Token
    const dealerId = tokenRow.dealer_id;

    // --------------------------------------------------
    // 4. Standardpreise laden
    // --------------------------------------------------

    const { data: standardData, error: standardError } =
      await supabase
        .from("v_dealer_standard_price_list")
        .select("*")
        .eq("dealer_id", dealerId)
        .order("sony_article", { ascending: true });

    if (standardError) {
      console.error(
        "Standard price list error:",
        standardError
      );

      return NextResponse.json(
        { error: "Could not load standard price list" },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 5. Pro Produkt besten Standardpreis bestimmen
    // --------------------------------------------------

    const standardByProduct = new Map<number, any>();

    for (const row of standardData ?? []) {
      const productId = Number(row.product_id);

      const current = standardByProduct.get(productId);

      const newPrice = Number(
        row.dealer_price ?? Infinity
      );

      const currentPrice = Number(
        current?.dealer_price ?? Infinity
      );

      if (!current || newPrice < currentPrice) {
        standardByProduct.set(productId, row);
      }
    }

    const standardRows = Array.from(
      standardByProduct.values()
    );

    // --------------------------------------------------
    // 6. Aktive Promotionen / Kampagnen laden
    // --------------------------------------------------

    const { data: campaignRows, error: campaignError } =
      await supabase
        .from("v_dealer_campaign_price_list")
        .select("*")
        .eq("dealer_id", dealerId);

    if (campaignError) {
      console.error(
        "Campaign price list error:",
        campaignError
      );

      return NextResponse.json(
        { error: "Could not load campaign price list" },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 7. Besten aktuellen Kampagnenpreis je Produkt
    // --------------------------------------------------

    const campaignByProduct = new Map<number, any>();

    for (const row of campaignRows ?? []) {
      const productId = Number(row.product_id);

      const existing =
        campaignByProduct.get(productId);

      const newPrice = Number(
        row.messe_price_netto ?? Infinity
      );

      const existingPrice = Number(
        existing?.messe_price_netto ?? Infinity
      );

      if (!existing || newPrice < existingPrice) {
        campaignByProduct.set(productId, row);
      }
    }

    // --------------------------------------------------
    // 8. Eine aktuelle Gesamtpreisliste bauen
    // --------------------------------------------------

    const rows = standardRows.map((standard: any) => {
      const productId = Number(standard.product_id);

      const campaign =
        campaignByProduct.get(productId);

      const standardPrice =
      Math.round(Number(standard.dealer_price ?? 0) * 100) / 100;

      const campaignPrice =
      campaign?.messe_price_netto !== null &&
      campaign?.messe_price_netto !== undefined
          ? Math.round(Number(campaign.messe_price_netto) * 100) / 100
          : null;

      const hasBetterCampaignPrice =
        campaign &&
        campaignPrice !== null &&
        campaignPrice > 0 &&
        campaignPrice < standardPrice;

      const currentPrice = hasBetterCampaignPrice
        ? campaignPrice!
        : standardPrice;

      return {
        "Sony Artikel":
          standard.sony_article ?? "",

        EAN:
          standard.ean ?? "",

        Produktname:
          standard.product_name ?? "",

        Gruppe:
          standard.gruppe ?? "",

        Kategorie:
          standard.category ?? "",

        "UPE brutto":
          Number(standard.retail_price ?? 0).toFixed(2),

        VRG:
          standard.vrg !== null &&
          standard.vrg !== undefined
            ? Number(standard.vrg).toFixed(2)
            : "",

        "Standardpreis netto":
          standardPrice.toFixed(2),

        "Aktueller Preis netto":
          currentPrice.toFixed(2),

        Preistyp:
          hasBetterCampaignPrice
            ? "Promotion"
            : "Standard",

        Promotion:
          hasBetterCampaignPrice
            ? campaign.campaign_name ?? ""
            : "",

        "Gültig von":
          hasBetterCampaignPrice
            ? campaign.start_date ?? ""
            : "",

        "Gültig bis":
          hasBetterCampaignPrice
            ? campaign.end_date ?? ""
            : "",
      };
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Keine Preisdaten vorhanden." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 9. Letzten erfolgreichen Zugriff speichern
    // --------------------------------------------------

    const { error: usageError } = await supabase
      .from("dealer_api_tokens")
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq("id", tokenRow.id);

    if (usageError) {
      // Feed trotzdem ausliefern.
      // Logging darf keinen Feed-Ausfall verursachen.
      console.error(
        "Could not update last_used_at:",
        usageError
      );
    }

    // --------------------------------------------------
    // 10. CSV erstellen
    // --------------------------------------------------

    const headers = Object.keys(rows[0]);

    const csvBody = [
      headers.join("|"),

      ...rows.map((row: any) =>
        headers
          .map((header) =>
            formatCsvValue(row[header])
          )
          .join("|")
      ),
    ].join("\r\n");

    // UTF-8 BOM für Excel / ERP-Kompatibilität
    const csv = "\uFEFF" + csvBody;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          'attachment; filename="p5connect-current-prices.csv"',

        "Cache-Control":
          "no-store, no-cache, must-revalidate",

        "Pragma":
          "no-cache",
      },
    });
  } catch (error) {
    console.error("Dealer feed error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}