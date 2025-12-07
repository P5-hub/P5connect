import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { loginNr, email, password, name, role } = await req.json();

    if (!loginNr || !email || !password) {
      return NextResponse.json(
        { error: "loginNr, email und password sind erforderlich." },
        { status: 400 }
      );
    }

    const finalRole = role === "admin" ? "admin" : "dealer";

    // 1️⃣ Auth-User anlegen
    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: finalRole,
          login_nr: loginNr,
        },
      });

    if (createError || !created?.user) {
      return NextResponse.json(
        {
          error:
            "Auth-User konnte nicht erstellt werden: " +
            (createError?.message ?? "Unbekannter Fehler"),
        },
        { status: 500 }
      );
    }

    const authUserId = created.user.id;

    // 2️⃣ Dealer-Datensatz anlegen
    const { error: dealerError } = await supabaseAdmin.from("dealers").insert({
      login_nr: loginNr,
      name: name || loginNr,
      role: finalRole,
      password_plain: password,
      login_email: email,        // echte E-Mail verwenden
      auth_user_id: authUserId,
    });

    if (dealerError) {
      return NextResponse.json(
        {
          error: "Dealer-Eintrag konnte nicht erstellt werden: " + dealerError.message,
        },
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
