import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "sofortrabatt-invoices";

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_");
}

function normalizeInvoicePaths(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);

  if (typeof raw === "string") {
    const s = raw.trim();

    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    }

    return [s];
  }

  return [];
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const claimIdRaw = form.get("claim_id");
    const fileRaw = form.get("file");

    const claimId = Number(claimIdRaw);

    if (!claimId || !Number.isFinite(claimId)) {
      return NextResponse.json(
        { error: "Ungültige Claim-ID" },
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
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Ungültiger Dateityp. Erlaubt sind PDF, JPG und PNG." },
        { status: 400 }
      );
    }

    const { data: claim, error: claimError } = await supabaseAdmin
      .from("sofortrabatt_claims")
      .select("claim_id, invoice_file_url")
      .eq("claim_id", claimId)
      .maybeSingle();

    if (claimError || !claim) {
      return NextResponse.json(
        { error: "Sofortrabatt-Claim nicht gefunden" },
        { status: 404 }
      );
    }

    const safeName = sanitizeFilename(file.name);
    const filePath = `${claimId}/admin-${Date.now()}-${safeName}`;

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

    const existingPaths = normalizeInvoicePaths(claim.invoice_file_url);
    const nextPaths = [...existingPaths, filePath];

    const { error: updateError } = await supabaseAdmin
      .from("sofortrabatt_claims")
      .update({
        invoice_file_url: JSON.stringify(nextPaths),
        updated_at: new Date().toISOString(),
      })
      .eq("claim_id", claimId);

    if (updateError) {
      await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
      throw new Error(`Claim konnte nicht aktualisiert werden: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      path: filePath,
      invoice_file_url: nextPaths,
      bucket: BUCKET,
    });
  } catch (e: any) {
    console.error("❌ Sofortrabatt admin invoice upload error:", e);

    return NextResponse.json(
      { error: e?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}