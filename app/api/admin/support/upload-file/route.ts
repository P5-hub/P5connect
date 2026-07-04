import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "support-invoices";

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const submissionIdRaw = form.get("submission_id");
    const fileRaw = form.get("file");

    const submissionId = Number(submissionIdRaw);

    if (!submissionId || !Number.isFinite(submissionId)) {
      return NextResponse.json(
        { error: "Ungültige Submission-ID" },
        { status: 400 }
      );
    }

    if (!fileRaw || typeof fileRaw === "string") {
      return NextResponse.json(
        { error: "Keine Datei übergeben" },
        { status: 400 }
      );
    }

    const file = fileRaw as File;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/octet-stream",
    ];

    const fileName = file.name.toLowerCase();

    const hasAllowedExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png");

    if (!allowedTypes.includes(file.type) && !hasAllowedExtension) {
      return NextResponse.json(
        {
          error: `Ungültiger Dateityp (${file.type || "unbekannt"}). Erlaubt sind PDF, JPG und PNG.`,
        },
        { status: 400 }
      );
    }

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("submissions")
      .select("submission_id, typ")
      .eq("submission_id", submissionId)
      .maybeSingle();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission nicht gefunden" },
        { status: 404 }
      );
    }

    if (submission.typ !== "support") {
      return NextResponse.json(
        { error: "Diese Route ist nur für Support-Belege vorgesehen" },
        { status: 400 }
      );
    }

    const safeName = sanitizeFilename(file.name);
    const filePath = `${submissionId}/admin-${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    const { data: insertedFile, error: insertError } = await supabaseAdmin
      .from("submission_files")
      .insert({
        submission_id: submissionId,
        file_name: file.name,
        file_path: filePath,
        bucket: BUCKET,
      })
      .select("id, file_name, file_path, bucket, created_at")
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
      throw new Error(`Datei konnte nicht gespeichert werden: ${insertError.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from("submissions")
      .update({
        project_file_path: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq("submission_id", submissionId);

    if (updateError) {
      console.error("⚠️ project_file_path update failed:", updateError);
    }

    return NextResponse.json({
      success: true,
      file: insertedFile,
    });
  } catch (e: any) {
    console.error("❌ Support admin file upload error:", e);

    return NextResponse.json(
      { error: e?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}