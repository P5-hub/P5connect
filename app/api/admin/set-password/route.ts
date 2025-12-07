import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { dealerId, newPassword } = await req.json();

    if (!dealerId || !newPassword) {
      return NextResponse.json(
        { error: "dealerId und newPassword sind erforderlich" },
        { status: 400 }
      );
    }

    // 1️⃣ Händler-Daten abrufen
    const { data: dealer, error: dealerErr } = await supabaseAdmin
      .from("dealers")
      .select("auth_user_id")
      .eq("dealer_id", dealerId)
      .maybeSingle();

    if (dealerErr) {
      return NextResponse.json(
        { error: "Dealer nicht gefunden: " + dealerErr.message },
        { status: 500 }
      );
    }

    if (!dealer?.auth_user_id) {
      return NextResponse.json(
        { error: "Dealer hat keine auth_user_id – bitte nachtragen." },
        { status: 400 }
      );
    }

    // 2️⃣ Passwort im Auth-System setzen
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      dealer.auth_user_id,
      { password: newPassword }
    );

    if (authError) {
      return NextResponse.json(
        { error: "Fehler beim Setzen des Passworts: " + authError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Passwort im dealers-Table aktualisieren
    const { error: pwErr } = await supabaseAdmin
      .from("dealers")
      .update({ password_plain: newPassword })
      .eq("dealer_id", dealerId);

    if (pwErr) {
      return NextResponse.json(
        { error: "Passwort wurde in Auth geändert, aber nicht in dealers: " + pwErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
