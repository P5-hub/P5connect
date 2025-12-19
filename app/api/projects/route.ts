// @ts-nocheck
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// POST /api/projects
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      dealer_id,
      login_nr,
      project_type,
      project_name,
      customer,
      location,
      start_date,
      end_date,
      comment,
    } = body;

    // 🔒 Pflichtfelder gemäss Schema
    if (!dealer_id || !project_type || !project_name) {
      return NextResponse.json(
        { error: "Ungültige Projektanfrage" },
        { status: 400 }
      );
    }

    // ✅ cookies korrekt holen
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

    const dealerId = Number(dealer_id);

    // 🔥 1️⃣ store_name SERVERSEITIG aus dealers laden
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("store_name")
      .eq("dealer_id", dealerId)
      .single();

    if (dealerError || !dealer) {
      console.error("❌ Dealer nicht gefunden:", dealerError);
      return NextResponse.json(
        { error: "Händler nicht gefunden" },
        { status: 400 }
      );
    }

    // 🔥 2️⃣ Projekt speichern (mit store_name)
    const { data: project, error } = await supabase
      .from("project_requests")
      .insert([
        {
          dealer_id: dealerId,
          login_nr: login_nr ?? null,
          store_name: dealer.store_name ?? null, // ✅ HIER
          project_type,
          project_name,
          customer: customer ?? null,
          location: location ?? null,
          start_date: start_date ?? null,
          end_date: end_date ?? null,
          comment: comment ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      throw error;
    }

    // 🔥 3️⃣ Projekt-Log
    await supabase.from("project_logs").insert([
      {
        project_id: project.id,
        dealer_id: dealerId,
        action: "created",
        payload: body,
      },
    ]);

    return NextResponse.json({
      success: true,
      project_id: project.id,
    });
  } catch (err: any) {
    console.error("❌ Project API Error:", err);

    return NextResponse.json(
      {
        error: "Serverfehler",
        details: err?.message ?? "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}
