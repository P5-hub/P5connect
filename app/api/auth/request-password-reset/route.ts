import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerRow = {
  dealer_id: number;
  login_nr: string;
  auth_user_id: string | null;
};

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const url = new URL(req.url);
  return url.origin;
}

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

    if (!dealer) {
      return NextResponse.json(
        { error: "Kein Händler mit dieser Login-Nr. gefunden." },
        { status: 404 }
      );
    }

    if (!dealer.auth_user_id) {
      return NextResponse.json(
        { error: "Für diesen Händler ist keine auth_user_id hinterlegt." },
        { status: 400 }
      );
    }

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(dealer.auth_user_id);

    if (authUserError) {
      return NextResponse.json(
        { error: "Auth-User konnte nicht geladen werden: " + authUserError.message },
        { status: 500 }
      );
    }

    const authEmail = authUserData?.user?.email;

    if (!authEmail) {
      return NextResponse.json(
        { error: "Zum Auth-User wurde keine E-Mail gefunden." },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(req);

    const { error: resetError } =
      await supabaseAdmin.auth.resetPasswordForEmail(authEmail, {
        redirectTo: `${baseUrl}/reset-password/change`,
      });

    if (resetError) {
      return NextResponse.json(
        {
          error:
            "Reset-Mail konnte nicht gesendet werden: " + resetError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reset-Mail wurde versendet.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";

    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}
