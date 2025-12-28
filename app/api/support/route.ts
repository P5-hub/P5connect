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

const SUPPORT_BUCKET = "support-documents";

/**
 * Hilfsfunktion für saubere Zahlen
 */
function num(v: any) {
  const n =
    typeof v === "string"
      ? Number(v.replace(",", "."))
      : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 📤 Upload eines Support-Belegs
 * Rückgabe: Storage-Pfad (wird in DB gespeichert)
 */
async function uploadSupportFile(
  file: File,
  dealerId: number
): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `support/${dealerId}/${Date.now()}-${file.name}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(SUPPORT_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
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
    // 1️⃣ Payload lesen (JSON oder multipart)
    // ---------------------------------------------
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const rawPayload = form.get("payload");
      if (!rawPayload || typeof rawPayload !== "string") {
        return NextResponse.json(
          { error: "payload fehlt" },
          { status: 400 }
        );
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
    // 2️⃣ Pflichtfelder
    // ---------------------------------------------
    const dealer_id = Number(payload.dealer_id);
    if (!dealer_id) {
      return NextResponse.json(
        { error: "dealer_id fehlt oder ungültig" },
        { status: 400 }
      );
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const comment = payload.comment ?? null;
    const support_type = payload.type ?? null;
    const totalCost = payload.totalCost ?? null;
    const sonyShare = payload.sonyShare ?? null;
    const sonyAmount = payload.sonyAmount ?? null;

    // ---------------------------------------------
    // 3️⃣ Optional: Beleg hochladen
    // ---------------------------------------------
    let documentPath: string | null = null;

    if (file) {
      documentPath = await uploadSupportFile(file, dealer_id);
    }

    // ---------------------------------------------
    // 4️⃣ Submission anlegen
    // ---------------------------------------------
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .insert({
        dealer_id,
        typ: "support",
        kommentar: comment,
        status: "pending",
        project_file_path: documentPath, // ✅ EINZIGE WAHRHEIT
      })
      .select("submission_id")
      .single();

    if (subErr || !submission) {
      throw new Error(subErr?.message || "Submission konnte nicht erstellt werden");
    }

    const submission_id = submission.submission_id;

    // ---------------------------------------------
    // 5️⃣ Items (Sell-Out Support)
    // ---------------------------------------------
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

      const { error: itemErr } = await supabase
        .from("submission_items")
        .insert(mappedItems);

      if (itemErr) {
        // Rollback Submission
        await supabase
          .from("submissions")
          .delete()
          .eq("submission_id", submission_id);

        throw new Error(itemErr.message);
      }
    }

    // ---------------------------------------------
    // 6️⃣ Non-Sellout Meta (optional)
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
    // ✅ ERFOLG
    // ---------------------------------------------
    return NextResponse.json({
      success: true,
      submission_id,
      document_path: documentPath,
    });
  } catch (err: any) {
    console.error("❌ SUPPORT API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Serverfehler" },
      { status: 500 }
    );
  }
}
