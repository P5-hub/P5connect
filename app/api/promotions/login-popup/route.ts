import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMO_BUCKET = "promotion-documents";
const PROMO_ID = "bravia-cool-summer-2026";

const SUPPORTED_LANGS = ["de", "en", "fr", "it", "rm"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function normalizeLang(value: string | null): Lang {
  const lang = (value || "de").toLowerCase();

  if (SUPPORTED_LANGS.includes(lang as Lang)) {
    return lang as Lang;
  }

  return "de";
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getApiDealerContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const lang = normalizeLang(req.nextUrl.searchParams.get("lang"));
    const filePath = `${PROMO_ID}/${lang}.png`;

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
      promo_id: PROMO_ID,
      lang,
      image_url: data.signedUrl,
      valid_from: "2026-07-13",
      valid_to: "2026-08-31",
    });
  } catch (err: any) {
    console.error("❌ Promotion popup API error:", err);

    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}