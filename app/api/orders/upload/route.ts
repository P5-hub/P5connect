import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

export async function POST(req: NextRequest) {
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

    const adminSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: submission, error: submissionError } = await adminSupabase
      .from("submissions")
      .select("submission_id, dealer_id")
      .eq("submission_id", Number(submissionId))
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (Number(submission.dealer_id) !== Number(ctx.effectiveDealerId)) {
      return NextResponse.json(
        { error: "Forbidden for this dealer context" },
        { status: 403 }
      );
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${submissionId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await adminSupabase.storage
        .from("order-documents")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { error: dbError } = await adminSupabase
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