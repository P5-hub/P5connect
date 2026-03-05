import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * ⚠️ Service-Role Client
 * - notwendig für Storage Upload
 * - umgeht RLS sauber
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SUPPORT_BUCKET = "support-invoices";

function num(v: any) {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getActingDealerIdFromCookie(req: Request): number | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("acting_dealer_id="));

  if (!match) return null;
  const raw = decodeURIComponent(match.split("=")[1] || "").trim();
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * ✅ Auth-Dealer Fallback:
 * - liest Supabase Session (Auth Cookie)
 * - findet dealer_id über dealers.auth_user_id
 */
async function getDealerIdFromSupabaseSession(): Promise<number | null> {
  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data, error } = await supabaseAuth.auth.getUser();
  if (error || !data?.user) return null;

  const { data: dealer, error: dealerErr } = await supabaseAdmin
    .from("dealers")
    .select("dealer_id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (dealerErr || !dealer?.dealer_id) return null;
  return Number(dealer.dealer_id) || null;
}

async function uploadSupportFile(file: File, dealerId: number): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const path = `support/${dealerId}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(SUPPORT_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(`Storage Upload fehlgeschlagen: ${error.message}`);
  return path;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let payload: any = null;
    let file: File | null = null;

    // 1) Payload lesen
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const rawPayload = (form.get("payload") ?? form.get("data")) as any;

      if (!rawPayload || typeof rawPayload !== "string") {
        return NextResponse.json({ error: "payload fehlt" }, { status: 400 });
      }

      payload = JSON.parse(rawPayload);

      const maybeFile = form.get("file");
      if (maybeFile && typeof maybeFile !== "string") {
        file = maybeFile as File;
      }
    } else {
      payload = await req.json();
    }

    // 2) dealer_id bestimmen (Payload -> acting cookie -> Supabase session)
    const dealerFromPayload = Number(payload?.dealer_id);
    const dealerFromCookie = getActingDealerIdFromCookie(req);

    let dealer_id =
      (Number.isFinite(dealerFromPayload) && dealerFromPayload > 0
        ? dealerFromPayload
        : null) ?? dealerFromCookie;

    if (!dealer_id) {
      const fromSession = await getDealerIdFromSupabaseSession();
      dealer_id = fromSession ?? null;
    }

    if (!dealer_id) {
      return NextResponse.json(
        { error: "dealer_id fehlt oder ungültig (Payload/Cookie/Session)" },
        { status: 400 }
      );
    }

    // 3) Meta robust lesen (neu + alt)
    const meta = payload?.meta ?? {};

    const support_type =
      payload?.type ?? meta?.support_type ?? meta?.type ?? null;

    const comment =
      payload?.comment ?? meta?.comment ?? payload?.meta_comment ?? null;

    const items = Array.isArray(payload?.items) ? payload.items : [];

    const totalCost = payload?.totalCost ?? meta?.totalCost ?? null;
    const sonyShare = payload?.sonyShare ?? meta?.sonyShare ?? null;
    const sonyAmount = payload?.sonyAmount ?? meta?.sonyAmount ?? null;

    // 4) Optional Upload
    let documentPath: string | null = null;
    if (file) documentPath = await uploadSupportFile(file, dealer_id);

    // 5) Submission anlegen
    const { data: submission, error: subErr } = await supabaseAdmin
      .from("submissions")
      .insert({
        dealer_id,
        typ: "support",
        kommentar: comment,
        status: "pending",
        project_file_path: documentPath,
      })
      .select("submission_id")
      .single();

    if (subErr || !submission) {
      throw new Error(subErr?.message || "Submission konnte nicht erstellt werden");
    }

    const submission_id = submission.submission_id;

    // 6) Items (Sell-Out)
    if (items.length > 0) {
      const mappedItems = items.map((i: any) => ({
        submission_id,
        product_id: i.product_id ?? null,
        ean: i.ean ?? null,
        product_name: i.product_name ?? null,
        sony_article: i.sony_article ?? null,
        menge: Number(i.quantity ?? i.menge ?? 1),
        preis: i.supportbetrag != null ? num(i.supportbetrag) : null,
        comment: i.comment ?? null,
        created_at: new Date().toISOString(),
        datum: new Date().toISOString().slice(0, 10),
      }));

      const { error: itemErr } = await supabaseAdmin
        .from("submission_items")
        .insert(mappedItems);

      if (itemErr) {
        await supabaseAdmin
          .from("submissions")
          .delete()
          .eq("submission_id", submission_id);
        throw new Error(itemErr.message);
      }
    }

    // ✅ 7) support_details IMMER speichern, sobald support_type vorhanden ist
    // - bei Sell-Out: betrag kann null sein
    // - bei Non-Sellout: betrag = sonyAmount (falls vorhanden)
    if (support_type) {
      const supportTypText = [
        support_type,
        totalCost != null ? `totalCost=${num(totalCost)}` : null,
        sonyShare != null ? `sonyShare=${num(sonyShare)}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const betrag = num(sonyAmount) > 0 ? num(sonyAmount) : null;

      const { error: detailsErr } = await supabaseAdmin
        .from("support_details")
        .insert({
          submission_id,
          support_typ: supportTypText,
          betrag,
        });

      if (detailsErr) {
        // nicht hart failen, aber loggen (optional)
        console.error("⚠️ support_details insert failed:", detailsErr);
      }
    }

    return NextResponse.json({
      success: true,
      submission_id,
      document_path: documentPath,
      bucket: SUPPORT_BUCKET,
    });
  } catch (err: any) {
    console.error("❌ SUPPORT API ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}