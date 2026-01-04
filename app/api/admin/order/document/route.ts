import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { path, bucket, mode } = await req.json();

    if (!path || !bucket) {
      return NextResponse.json(
        { error: "Missing path or bucket" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔴 Service Role nötig
    );

    const download = mode === "download";

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 5, {
        download,
      });

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: "Failed to create signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (e) {
    console.error("Order document API exception:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
