// @ts-nocheck
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Helpers */
const s = (v: any) => (typeof v === "string" ? v.trim() : "");
const toNull = (v: any) => {
  const t = s(v);
  return t.length ? t : null;
};
const normalizeDate = (v: any) => {
  const t = s(v);
  if (!t) return null;
  // akzeptiere YYYY-MM-DD (was dein UI liefert)
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
};

// POST /api/projects
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ dealer_id ist Pflicht
    const dealerId = Number(body?.dealer_id);
    if (!dealerId || Number.isNaN(dealerId)) {
      return NextResponse.json({ error: "Ungültige dealer_id" }, { status: 400 });
    }

    /**
     * ✅ WICHTIG:
     * Wir akzeptieren sowohl snake_case (API) als auch camelCase (Frontend),
     * weil bei dir sehr wahrscheinlich projectName/startDate/... ankommt.
     */
    const loginNr = toNull(body?.login_nr ?? body?.loginNr);

    const projectType = toNull(body?.project_type ?? body?.projectType);
    const projectName = toNull(body?.project_name ?? body?.projectName);
    const customerVal = toNull(body?.customer ?? body?.customerName);
    const locationVal = toNull(body?.location ?? body?.projectLocation);

    const startDate = normalizeDate(body?.start_date ?? body?.startDate);
    const endDate = normalizeDate(body?.end_date ?? body?.endDate);

    const commentVal = toNull(body?.comment ?? body?.projekt_comment ?? body?.projectComment);

    // cookies korrekt holen (cookies() ist sync; await ist egal durch ts-nocheck)
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      }
    );

    // 🔥 store_name serverseitig aus dealers laden
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("store_name")
      .eq("dealer_id", dealerId)
      .single();

    if (dealerError || !dealer) {
      console.error("❌ Dealer nicht gefunden:", dealerError);
      return NextResponse.json({ error: "Händler nicht gefunden" }, { status: 400 });
    }

    // 🔥 Projekt speichern
    const { data: project, error } = await supabase
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
      console.error("❌ Supabase insert error:", error);
      throw error;
    }

    // 🔥 Projekt-Log (soll Request nicht killen)
    const { error: logErr } = await supabase.from("project_logs").insert([
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