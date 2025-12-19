import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function num(v: any) {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function uploadToSupportBucket(file: File, dealerId: string) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const filePath = `support/${dealerId}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("support-documents")
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);
  return filePath;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // -------------------------------------------------------
    // 1) Payload lesen (JSON oder multipart/form-data)
    // -------------------------------------------------------
    let payload: any = null;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const payloadStr = form.get("payload");
      if (!payloadStr || typeof payloadStr !== "string") {
        return NextResponse.json(
          { error: "payload fehlt (FormData)" },
          { status: 400 }
        );
      }
      payload = JSON.parse(payloadStr);

      const maybeFile = form.get("file");
      if (maybeFile && typeof maybeFile !== "string") {
        file = maybeFile as File;
      }
    } else {
      payload = await req.json();
    }

    const {
      dealer_id,
      items = [],
      type, // "sellout" | "marketing" | "event" | "other"
      comment,
      totalCost,
      sonyShare,
      sonyAmount,
      document_path, // optional, wenn du schon einen Pfad hast
    } = payload ?? {};

    if (!dealer_id) {
      return NextResponse.json({ error: "dealer_id fehlt" }, { status: 400 });
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items muss ein Array sein" }, { status: 400 });
    }

    // -------------------------------------------------------
    // 2) Optional: File serverseitig hochladen
    // -------------------------------------------------------
    let finalDocumentPath: string | null = document_path ?? null;

    if (file) {
      finalDocumentPath = await uploadToSupportBucket(file, String(dealer_id));
    }

    // -------------------------------------------------------
    // 3) submission anlegen (typ = 'support')
    // -------------------------------------------------------
    // NOTE: submission_type enum MUSS 'support' enthalten.
    // Falls dein Enum anders heisst: hier anpassen.
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .insert({
        dealer_id: dealer_id,
        typ: "support",
        kommentar: comment ?? null,
        sony_share: sonyShare != null ? num(sonyShare) : null,
        status: "pending",
        // wir speichern den Document-Pfad in order_comment (weil es kein eigenes Feld gibt)
        order_comment: finalDocumentPath ? `document_path=${finalDocumentPath}` : null,
      })
      .select("submission_id")
      .single();

    if (subErr || !submission?.submission_id) {
      console.error("SUBMISSIONS INSERT ERROR:", subErr);
      return NextResponse.json(
        { error: subErr?.message || "submissions insert failed" },
        { status: 500 }
      );
    }

    const submission_id = submission.submission_id as number;

    // -------------------------------------------------------
    // 4) items speichern (Sell-Out Support)
    // -------------------------------------------------------
    if (items.length > 0) {
      const mapped = items.map((i: any) => ({
        submission_id,
        product_id: i.product_id ?? null,
        ean: i.ean ?? null,
        product_name: i.product_name ?? null,
        sony_article: i.sony_article ?? null,
        menge: i.quantity ?? i.menge ?? 1,
        // Bei Support nutzen wir "preis" als Supportbetrag pro Stück (weil es kein extra Feld gibt)
        preis: i.supportbetrag != null ? num(i.supportbetrag) : null,
        comment: i.comment ?? null,
        serial: i.seriennummer ?? i.serial ?? null,
      }));

      const { error: itemErr } = await supabase
        .from("submission_items")
        .insert(mapped);

      if (itemErr) {
        console.error("SUBMISSION_ITEMS INSERT ERROR:", itemErr);

        // rollback (optional): submission löschen, damit keine "leere" submission übrig bleibt
        await supabase.from("submissions").delete().eq("submission_id", submission_id);

        return NextResponse.json({ error: itemErr.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------
    // 5) support_details (für Non-Sellout / Meta)
    // -------------------------------------------------------
    // In deiner DB gibt es kein total_cost Feld.
    // Wir speichern sonyAmount (Gutschrift) als betrag
    // und hängen totalCost/sonyShare als Text in support_typ an (damit nichts verloren geht).
    if (type && (num(sonyAmount) > 0 || num(totalCost) > 0 || num(sonyShare) > 0)) {
      const supportTypText = [
        String(type),
        totalCost != null ? `totalCost=${num(totalCost)}` : null,
        sonyShare != null ? `sonyShare=${num(sonyShare)}` : null,
        finalDocumentPath ? `doc=${finalDocumentPath}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const { error: detErr } = await supabase.from("support_details").insert({
        submission_id,
        support_typ: supportTypText,
        betrag: num(sonyAmount) > 0 ? num(sonyAmount) : null,
      });

      if (detErr) {
        console.error("SUPPORT_DETAILS INSERT ERROR:", detErr);
        // Kein harter Fail nötig – Submission & Items sind schon da.
      }
    }

    return NextResponse.json({
      success: true,
      submission_id,
      document_path: finalDocumentPath,
    });
  } catch (err: any) {
    console.error("SUPPORT API FATAL ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
