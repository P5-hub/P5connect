import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMO_BUCKET = "promotion-documents";

const PROMO = {
  id: "bravia_6",
  title: "BRAVIA 6 OLED",
  validFrom: "2026-09-13",
  validTo: "2026-09-30",
};

const SUPPORTED_LANGS = ["de", "en", "fr", "it", "rm"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function normalizeLang(value: string | null): Lang {
  const lang = (value || "de").toLowerCase();

  if (SUPPORTED_LANGS.includes(lang as Lang)) {
    return lang as Lang;
  }

  return "de";
}

function isPromotionActive(validFrom: string, validTo: string) {
  const today = new Date();

  const from = new Date(`${validFrom}T00:00:00`);
  const to = new Date(`${validTo}T23:59:59`);

  return today >= from && today <= to;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getApiDealerContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const forcePreview = req.nextUrl.searchParams.get("preview") === "1";

    if (
      !forcePreview &&
      !isPromotionActive(PROMO.validFrom, PROMO.validTo)
    ) {
      return NextResponse.json(
        {
          error: "No active promotion",
        },
        { status: 404 }
      );
    }

    const lang = normalizeLang(req.nextUrl.searchParams.get("lang"));

    const filePath = `${PROMO.id}/BRAVIA_6_${lang.toUpperCase()}.png`;

    const { data, error } = await supabaseAdmin.storage
      .from(PROMO_BUCKET)
      .createSignedUrl(filePath, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error("❌ Promotion signed URL error:", error);

      return NextResponse.json(
        {
          error: "Promotion image not available",
          path: filePath,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      promo_id: PROMO.id,
      title: PROMO.title,
      lang,
      image_url: data.signedUrl,
      valid_from: PROMO.validFrom,
      valid_to: PROMO.validTo,
    });
  } catch (err: any) {
    console.error("❌ Promotion popup API error:", err);

    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}