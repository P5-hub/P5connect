import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const submissionId = formData.get("submissionId") as string;
    if (!submissionId) {
      return NextResponse.json(
        { error: "Missing submissionId" },
        { status: 400 }
      );
    }

    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 SERVER ONLY
    );

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const path = `${submissionId}/${Date.now()}_${file.name}`;

    // 1️⃣ Upload in Storage
    const { error: uploadError } = await supabase.storage
      .from("order-documents")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // 2️⃣ 🔑 WICHTIG: Eintrag in submission_files
    const { error: dbError } = await supabase
      .from("submission_files")
      .insert({
        submission_id: Number(submissionId),
        file_name: file.name,
        file_path: path,
        bucket: "order-documents",
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      throw dbError;
    }
  }


    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Upload failed", err);
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
