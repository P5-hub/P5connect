import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { oldLogin, newLogin, newPassword } = await req.json();

    if (!oldLogin || !newLogin) {
      return NextResponse.json(
        { error: "oldLogin und newLogin sind erforderlich." },
        { status: 400 }
      );
    }

    // 1️⃣ Dealer anhand alter login_nr finden
    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("*")
      .eq("login_nr", oldLogin)
      .maybeSingle();

    if (dealerError) {
      return NextResponse.json(
        { error: "Fehler beim Laden des Dealers: " + dealerError.message },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: `Kein Dealer mit login_nr='${oldLogin}' gefunden.` },
        { status: 404 }
      );
    }

    if (!dealer.auth_user_id) {
      return NextResponse.json(
        { error: "auth_user_id fehlt. Bitte DB prüfen." },
        { status: 500 }
      );
    }

    const userId: string = dealer.auth_user_id;

    // ❗ NICHT die E-Mail verändern!
    // Wir lassen die echte Händler-Mail unangetastet.

    // 2️⃣ Auth-User aktualisieren → login_nr + Passwort
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ...(newPassword ? { password: newPassword } : {}),
        user_metadata: {
          ...dealer.user_metadata,
          login_nr: newLogin, // login_nr updaten
          role: dealer.role,
        },
      }
    );

    if (authError) {
      return NextResponse.json(
        { error: "Auth-Update fehlgeschlagen: " + authError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Dealer updaten
    const { error: dealerUpdateError } = await supabaseAdmin
      .from("dealers")
      .update({
        login_nr: newLogin,
        // ❗ email NICHT überschreiben!
        ...(newPassword ? { password_plain: newPassword } : {}),
      })
      .eq("login_nr", oldLogin);

    if (dealerUpdateError) {
      return NextResponse.json(
        { error: "Dealer-Update fehlgeschlagen: " + dealerUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + err?.message },
      { status: 500 }
    );
  }
}
