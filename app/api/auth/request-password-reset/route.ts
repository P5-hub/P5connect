import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerRow = {
  dealer_id: number;
  login_nr: string;
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

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, auth_user_id")
      .eq("login_nr", loginNr)
      .maybeSingle<DealerRow>();

    if (dealerError) {
      return NextResponse.json(
        { error: "Dealer konnte nicht geladen werden: " + dealerError.message },
        { status: 500 }
      );
    }

    // bewusst generisch
    if (!dealer?.auth_user_id) {
      return NextResponse.json({ success: true });
    }

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(dealer.auth_user_id);

    if (authUserError || !authUserData?.user?.email) {
      return NextResponse.json({ success: true });
    }

    const authEmail = authUserData.user.email;

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      authEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/change`,
      }
    );

    if (resetError) {
      return NextResponse.json(
        { error: "Reset-Mail konnte nicht gesendet werden: " + resetError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}