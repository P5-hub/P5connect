import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerLookupRow = {
  dealer_id: number;
  login_nr: string;
  role: "admin" | "dealer" | string | null;
  store_name: string | null;
  email: string | null;
  login_email: string;
  auth_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const loginNr = String(body?.loginNr ?? "").trim();

    if (!loginNr) {
      return NextResponse.json(
        { error: "loginNr ist erforderlich." },
        { status: 400 }
      );
    }

    const { data: dealer, error } = await supabaseAdmin
      .from("dealers")
      .select(
        "dealer_id, login_nr, role, store_name, email, login_email, auth_user_id"
      )
      .eq("login_nr", loginNr)
      .maybeSingle<DealerLookupRow>();

    if (error) {
      return NextResponse.json(
        { error: "Fehler beim Laden des Dealers: " + error.message },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!dealer.auth_user_id) {
      return NextResponse.json(
        { error: "Für diesen Benutzer fehlt auth_user_id." },
        { status: 500 }
      );
    }

    // ECHTE Auth-E-Mail direkt aus Supabase Auth holen
    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(dealer.auth_user_id);

    if (authUserError || !authUserData?.user) {
      return NextResponse.json(
        {
          error:
            "Auth-Benutzer konnte nicht geladen werden: " +
            (authUserError?.message ?? "unbekannt"),
        },
        { status: 500 }
      );
    }

    const authEmail = authUserData.user.email?.trim() ?? null;

    if (!authEmail) {
      return NextResponse.json(
        { error: "Für diesen Benutzer ist keine Auth-E-Mail hinterlegt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      dealer: {
        dealer_id: dealer.dealer_id,
        login_nr: dealer.login_nr,
        role: dealer.role ?? "dealer",
        store_name: dealer.store_name ?? null,
        email: authEmail,
        auth_user_id: dealer.auth_user_id,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}