// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

/** Helpers */
const s = (v: any) => (typeof v === "string" ? v.trim() : "");
const toNull = (v: any) => {
  const t = s(v);
  return t.length ? t : null;
};
const normalizeDate = (v: any) => {
  const t = s(v);
  if (!t) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
};

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

    const dealerId = ctx.effectiveDealerId;
    const body = await req.json();

    const loginNr = toNull(body?.login_nr ?? body?.loginNr);
    const projectType = toNull(body?.project_type ?? body?.projectType);
    const projectName = toNull(body?.project_name ?? body?.projectName);
    const customerVal = toNull(body?.customer ?? body?.customerName);
    const locationVal = toNull(body?.location ?? body?.projectLocation);
    const startDate = normalizeDate(body?.start_date ?? body?.startDate);
    const endDate = normalizeDate(body?.end_date ?? body?.endDate);
    const commentVal = toNull(
      body?.comment ?? body?.projekt_comment ?? body?.projectComment
    );

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("store_name")
      .eq("dealer_id", dealerId)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json({ error: "Händler nicht gefunden" }, { status: 400 });
    }

    const { data: project, error } = await supabaseAdmin
      .from("project_requests")
      .insert([
        {
          dealer_id: dealerId,
          login_nr: loginNr,
          store_name: dealer.store_name ?? null,
          project_type: projectType,
          project_name: projectName,
          customer: customerVal,
          location: locationVal,
          start_date: startDate,
          end_date: endDate,
          comment: commentVal,
        },
      ])
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    const { error: logErr } = await supabaseAdmin.from("project_logs").insert([
      {
        project_id: project.id,
        dealer_id: dealerId,
        action: "created",
        payload: body,
      },
    ]);

    if (logErr) {
      console.warn("⚠️ Projekt-Log konnte nicht geschrieben werden:", logErr);
    }

    return NextResponse.json({ success: true, project_id: project.id });
  } catch (err: any) {
    console.error("❌ Project API Error:", err);

    return NextResponse.json(
      { error: "Serverfehler", details: err?.message ?? "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}