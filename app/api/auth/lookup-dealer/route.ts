import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type DealerRow = {
  dealer_id: number;
  login_nr: string;
  role: string | null;
  store_name: string | null;
  email: string | null;
  auth_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const { loginNr } = await req.json();

    if (!loginNr || typeof loginNr !== "string") {
      return NextResponse.json({ error: "Missing loginNr" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✅ WICHTIG: Wir holen die echte Mail aus dealers.email und zusätzlich auth_user_id
    const { data, error } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, role, store_name, email, auth_user_id")
      .eq("login_nr", loginNr.trim())
      .maybeSingle<DealerRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Primär: dealers.email (die echte Mail)
    let resolvedEmail = data.email?.trim() || "";

    // ✅ Fallback: falls email leer ist, nutze auth_user_id → auth.users Email
    if (!resolvedEmail && data.auth_user_id) {
      const { data: userData, error: userErr } =
        await supabaseAdmin.auth.admin.getUserById(data.auth_user_id);

      if (!userErr) {
        resolvedEmail = userData.user?.email?.trim() || "";
      }
    }

    if (!resolvedEmail) {
      return NextResponse.json(
        { error: "No email configured for this login" },
        { status: 400 }
      );
    }

    // Einheitliche Response
    return NextResponse.json(
      {
        dealer: {
          dealer_id: data.dealer_id,
          login_nr: data.login_nr,
          role: data.role,
          store_name: data.store_name,
          email: resolvedEmail, // ✅ garantiert echte Mail
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
