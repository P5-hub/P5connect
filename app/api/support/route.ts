import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ⚠️ Service-Role Client
 * - notwendig für Storage Upload
 * - umgeht RLS sauber
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Zielbucket
const SUPPORT_BUCKET = "support-invoices";

/**
 * Hilfsfunktion für saubere Zahlen
 */
function num(v: any) {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Cookie helper (acting_dealer_id)
 */
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
 * 📤 Upload eines Support-Belegs
 * Rückgabe: Storage-Pfad (wird in DB gespeichert)
 */
async function uploadSupportFile(file: File, dealerId: number): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();

  // ✅ einheitliche Struktur im Bucket
  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const path = `support/${dealerId}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(SUPPORT_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(`Storage Upload fehlgeschlagen: ${error.message}`);
  }

  return path;
}

/**
 * ======================================================
 * POST /api/support
 * ======================================================
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let payload: any = null;
    let file: File | null = null;

    // ---------------------------------------------
    // 1) Payload lesen (JSON oder multipart)
    // ---------------------------------------------
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      // akzeptiere payload oder (legacy) payload als "data"
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

    // ---------------------------------------------
    // 2) dealer_id bestimmen
    //    - aus payload.dealer_id
    //    - oder aus Cookie acting_dealer_id
    // ---------------------------------------------
    const dealerFromPayload = Number(payload?.dealer_id);
    const dealerFromCookie = getActingDealerIdFromCookie(req);

    const dealer_id =
      (Number.isFinite(dealerFromPayload) && dealerFromPayload > 0
        ? dealerFromPayload
        : null) ?? dealerFromCookie;

    if (!dealer_id) {
      return NextResponse.json(
        { error: "dealer_id fehlt oder ungültig (Payload/Cookie)" },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 3) Support Meta robust lesen
    //    (neu: payload.meta.support_type/comment)
    //    (alt: payload.type/comment)
    // ---------------------------------------------
    const meta = payload?.meta ?? {};
    const support_type =
      payload?.type ?? meta?.support_type ?? meta?.type ?? null;

    const comment =
      payload?.comment ?? meta?.comment ?? payload?.meta_comment ?? null;

    const items = Array.isArray(payload?.items) ? payload.items : [];

    // Non-sellout Felder (optional)
    const totalCost = payload?.totalCost ?? meta?.totalCost ?? null;
    const sonyShare = payload?.sonyShare ?? meta?.sonyShare ?? null;
    const sonyAmount = payload?.sonyAmount ?? meta?.sonyAmount ?? null;

    // ---------------------------------------------
    // 4) Optional: Beleg hochladen
    // ---------------------------------------------
    let documentPath: string | null = null;

    if (file) {
      documentPath = await uploadSupportFile(file, dealer_id);
    }

    // ---------------------------------------------
    // 5) Submission anlegen
    // ---------------------------------------------
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .insert({
        dealer_id,
        typ: "support",
        kommentar: comment,
        status: "pending",
        project_file_path: documentPath, // ✅ bleibt wie bei dir
      })
      .select("submission_id")
      .single();

    if (subErr || !submission) {
      throw new Error(subErr?.message || "Submission konnte nicht erstellt werden");
    }

    const submission_id = submission.submission_id;

    // ---------------------------------------------
    // 6) Items (Sell-Out Support)
    // ---------------------------------------------
    if (items.length > 0) {
      const mappedItems = items.map((i: any) => ({
        submission_id,
        product_id: i.product_id ?? null,
        ean: i.ean ?? null,
        product_name: i.product_name ?? null,
        sony_article: i.sony_article ?? null,
        menge: Number(i.quantity ?? i.menge ?? 1),
        // supportbetrag kommt in preis
        preis: i.supportbetrag != null ? num(i.supportbetrag) : null,
        comment: i.comment ?? null,
        created_at: new Date().toISOString(),
        datum: new Date().toISOString().slice(0, 10),
      }));

      const { error: itemErr } = await supabase
        .from("submission_items")
        .insert(mappedItems);

      if (itemErr) {
        // Rollback Submission
        await supabase.from("submissions").delete().eq("submission_id", submission_id);
        throw new Error(itemErr.message);
      }
    }

    // ---------------------------------------------
    // 7) Non-Sellout Meta (optional)
    // ---------------------------------------------
    if (
      support_type &&
      (num(totalCost) > 0 || num(sonyShare) > 0 || num(sonyAmount) > 0)
    ) {
      const supportTypText = [
        support_type,
        totalCost != null ? `totalCost=${num(totalCost)}` : null,
        sonyShare != null ? `sonyShare=${num(sonyShare)}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      await supabase.from("support_details").insert({
        submission_id,
        support_typ: supportTypText,
        betrag: num(sonyAmount) > 0 ? num(sonyAmount) : null,
      });
    }

    // ---------------------------------------------
    // ✅ Erfolg
    // ---------------------------------------------
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