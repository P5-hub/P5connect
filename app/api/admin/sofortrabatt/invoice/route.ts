import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Extrahiert aus:
// - "38/xyz.pdf"
// - "/38/xyz.pdf"
// - "https://.../storage/v1/object/public/sofortrabatt-invoices/38/xyz.pdf"
// - "https://.../storage/v1/object/sign/sofortrabatt-invoices/38/xyz.pdf?token=..."
function normalizeStoragePath(input: string, bucket: string) {
  let p = (input || "").trim();

  // Wenn volle URL: Teil nach ".../<bucket>/" nehmen
  if (p.startsWith("http://") || p.startsWith("https://")) {
    const marker = `/${bucket}/`;
    const idx = p.indexOf(marker);
    if (idx !== -1) {
      p = p.slice(idx + marker.length);
    } else {
      // alternative: manchmal steht ".../object/public/<bucket>/<path>"
      const marker2 = `/object/public/${bucket}/`;
      const idx2 = p.indexOf(marker2);
      if (idx2 !== -1) p = p.slice(idx2 + marker2.length);

      const marker3 = `/object/sign/${bucket}/`;
      const idx3 = p.indexOf(marker3);
      if (idx3 !== -1) p = p.slice(idx3 + marker3.length);
    }
  }

  // führende Slashes entfernen
  p = p.replace(/^\/+/, "");

  return p;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const path = body?.path;
    const bucket = body?.bucket || "sofortrabatt-invoices";

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Kein Dateipfad übergeben" }, { status: 400 });
    }

    const normalized = normalizeStoragePath(path, bucket);

    console.log("🧾 invoice api path raw:", path);
    console.log("🧾 invoice api path normalized:", normalized);
    console.log("🧾 invoice api bucket:", bucket);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(normalized, 60 * 10);

    if (error || !data?.signedUrl) {
      console.error("❌ Signed URL Fehler:", error);
      return NextResponse.json(
        { error: "Signed URL konnte nicht erstellt werden", details: error?.message, normalized },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl, normalized });
  } catch (e: any) {
    console.error("❌ Invoice API Error:", e);
    return NextResponse.json({ error: e.message || "Serverfehler" }, { status: 500 });
  }
}
