import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "project-documents"; // ✅ MUSS exakt so heissen

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const projectId = formData.get("project_id") as string;
    const dealerId = formData.get("dealer_id") as string;
    const loginNr = formData.get("login_nr") as string;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Missing file or project_id" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 📁 saubere Projektstruktur im Bucket
    const path = `${projectId}/${Date.now()}-${file.name}`;

    // ⬆️ UPLOAD ZU RICHTIGEM BUCKET
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 🔗 Public URL (oder alternativ nur path speichern)
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    // 🧾 DB INSERT
    const { error: dbError } = await supabase.from("project_files").insert({
      project_id: projectId,
      file_name: file.name,
      dealer_id: Number(dealerId),
      login_nr: loginNr ?? null,
      bucket: BUCKET,
      path,
      file_size: file.size,
      mime_type: file.type,
    });


    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
