import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "sofortrabatt-invoices";

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
    const body = await req.json().catch(() => null);

    const claimId = Number(body?.claim_id);
    const path = String(body?.path || "").trim();

    if (!claimId || !Number.isFinite(claimId)) {
      return NextResponse.json(
        { error: "Ungültige Claim-ID" },
        { status: 400 }
      );
    }

    if (!path) {
      return NextResponse.json(
        { error: "Kein Dateipfad übergeben" },
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

    const existingPaths = normalizeInvoicePaths(claim.invoice_file_url);
    const nextPaths = existingPaths.filter((p) => p !== path);

    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([path]);

    if (storageError) {
      throw new Error(`Storage Delete fehlgeschlagen: ${storageError.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from("sofortrabatt_claims")
      .update({
        invoice_file_url: JSON.stringify(nextPaths),
        updated_at: new Date().toISOString(),
      })
      .eq("claim_id", claimId);

    if (updateError) {
      throw new Error(`Claim konnte nicht aktualisiert werden: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      invoice_file_url: nextPaths,
      deleted_path: path,
    });
  } catch (e: any) {
    console.error("❌ Sofortrabatt invoice delete error:", e);

    return NextResponse.json(
      { error: e?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}