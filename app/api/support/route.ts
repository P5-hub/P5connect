import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

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
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

function num(v: any) {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_");
}

async function uploadSupportFile(
  file: File,
  dealerId: number,
  submissionId?: number
): Promise<{
  file_name: string;
  file_path: string;
  bucket: string;
}> {
  const safeName = sanitizeFilename(file.name);
  const baseFolder = submissionId ? `${submissionId}` : `support/${dealerId}`;
  const file_path = `${baseFolder}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(SUPPORT_BUCKET)
    .upload(file_path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage Upload fehlgeschlagen: ${error.message}`);
  }

  return {
    file_name: file.name,
    file_path,
    bucket: SUPPORT_BUCKET,
  };
}

export async function POST(req: NextRequest) {
  let uploadedPaths: string[] = [];
  let submission_id: number | null = null;

  try {
    const auth = await getApiDealerContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { ctx } = auth;

    if (!ctx.effectiveDealerId) {
      return NextResponse.json(
        { error: "No effective dealer context found" },
        { status: 403 }
      );
    }

    const dealer_id = ctx.effectiveDealerId;

    const contentType = req.headers.get("content-type") || "";

    let payload: any = null;
    let files: File[] = [];

    // 1) Payload lesen
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const rawPayload = (form.get("payload") ?? form.get("data")) as any;

      if (!rawPayload || typeof rawPayload !== "string") {
        return NextResponse.json({ error: "payload fehlt" }, { status: 400 });
      }

      payload = JSON.parse(rawPayload);

      files = form
        .getAll("files")
        .filter((entry): entry is File => entry instanceof File);

      // Fallback für alte Logik mit "file"
      if (files.length === 0) {
        const maybeFile = form.get("file");
        if (maybeFile && typeof maybeFile !== "string") {
          files = [maybeFile as File];
        }
      }
    } else {
      payload = await req.json();
    }

    // 2) Dateien validieren
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximal ${MAX_FILES} Belege erlaubt` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Ungültiger Dateityp (${file.name}). Erlaubt sind PDF, JPG und PNG.`,
          },
          { status: 400 }
        );
      }
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

    // 4) Submission anlegen
    const { data: submission, error: subErr } = await supabaseAdmin
      .from("submissions")
      .insert({
        dealer_id,
        typ: "support",
        kommentar: comment,
        status: "pending",
        project_file_path: null,
      })
      .select("submission_id")
      .single();

    if (subErr || !submission) {
      throw new Error(subErr?.message || "Submission konnte nicht erstellt werden");
    }

    submission_id = submission.submission_id;

    // 5) Dateien uploaden + in submission_files speichern
    let uploadedFilesMeta: Array<{
      file_name: string;
      file_path: string;
      bucket: string;
      file_size: number;
      mime_type: string | null;
    }> = [];

    if (files.length > 0) {
      uploadedFilesMeta = await Promise.all(
        files.map(async (file) => {
          const uploaded = await uploadSupportFile(file, dealer_id, submission_id!);
          uploadedPaths.push(uploaded.file_path);

          return {
            ...uploaded,
            file_size: file.size,
            mime_type: file.type || null,
          };
        })
      );

      const { error: filesErr } = await supabaseAdmin
        .from("submission_files")
        .insert(
          uploadedFilesMeta.map((f) => ({
            submission_id,
            file_name: f.file_name,
            file_path: f.file_path,
            bucket: f.bucket,
          }))
        );

      if (filesErr) {
        throw new Error(`submission_files insert fehlgeschlagen: ${filesErr.message}`);
      }

      const { error: subUpdateErr } = await supabaseAdmin
        .from("submissions")
        .update({
          project_file_path: uploadedFilesMeta[0]?.file_path ?? null,
        })
        .eq("submission_id", submission_id);

      if (subUpdateErr) {
        console.error("⚠️ submission project_file_path update failed:", subUpdateErr);
      }
    }

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
        throw new Error(itemErr.message);
      }
    }

    // 7) support_details speichern
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
        console.error("⚠️ support_details insert failed:", detailsErr);
      }
    }

    return NextResponse.json({
      success: true,
      submission_id,
      file_count: files.length,
      file_paths: uploadedPaths,
      bucket: SUPPORT_BUCKET,
    });
  } catch (err: any) {
    console.error("❌ SUPPORT API ERROR:", err);

    // Cleanup: hochgeladene Dateien löschen
    if (uploadedPaths.length > 0) {
      try {
        await supabaseAdmin.storage.from(SUPPORT_BUCKET).remove(uploadedPaths);
      } catch (cleanupErr) {
        console.error("⚠️ Cleanup uploaded files failed:", cleanupErr);
      }
    }

    // Cleanup: Submission löschen
    if (submission_id) {
      try {
        await supabaseAdmin
          .from("submissions")
          .delete()
          .eq("submission_id", submission_id);
      } catch (cleanupErr) {
        console.error("⚠️ Cleanup submission failed:", cleanupErr);
      }
    }

    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}