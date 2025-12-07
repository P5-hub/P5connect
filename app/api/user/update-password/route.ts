import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { newPassword } = await req.json();
    if (!newPassword) {
      return NextResponse.json(
        { error: "Kein neues Passwort angegeben." },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // eingeloggten User ziehen
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Nicht eingeloggt." },
        { status: 401 }
      );
    }

    // 1) Passwort in Supabase Auth setzen (WICHTIG!)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2) Passwort in dealers Tabelle updaten (optional)
    const { error: updateError } = await supabaseAdmin
      .from("dealers")
      .update({ password_plain: newPassword })
      .eq("auth_user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
