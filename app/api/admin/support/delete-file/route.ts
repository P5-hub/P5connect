import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const fileId = Number(body?.file_id);

    if (!fileId || !Number.isFinite(fileId)) {
      return NextResponse.json(
        { error: "Ungültige Datei-ID" },
        { status: 400 }
      );
    }

    const { data: file, error: fileError } = await supabaseAdmin
      .from("submission_files")
      .select("id, submission_id, file_name, file_path, bucket")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError || !file) {
      return NextResponse.json(
        { error: "Datei nicht gefunden" },
        { status: 404 }
      );
    }

    const { data: submission } = await supabaseAdmin
      .from("submissions")
      .select("submission_id, typ")
      .eq("submission_id", file.submission_id)
      .maybeSingle();

    if (submission?.typ !== "support") {
      return NextResponse.json(
        { error: "Diese Route ist nur für Support-Belege vorgesehen" },
        { status: 400 }
      );
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from(file.bucket)
      .remove([file.file_path]);

    if (storageError) {
      throw new Error(`Storage Delete fehlgeschlagen: ${storageError.message}`);
    }

    const { error: dbError } = await supabaseAdmin
      .from("submission_files")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      throw new Error(`Datei konnte nicht aus der Datenbank gelöscht werden: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      deleted_file_id: fileId,
    });
  } catch (e: any) {
    console.error("❌ Support admin file delete error:", e);

    return NextResponse.json(
      { error: e?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}