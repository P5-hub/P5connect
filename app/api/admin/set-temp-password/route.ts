import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerRow = {
  dealer_id: number;
  login_nr: string | null;
  store_name: string | null;
  auth_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const dealerId = Number(body?.dealerId);
    const password = String(body?.password ?? "").trim();

    if (!Number.isFinite(dealerId) || dealerId <= 0) {
      return NextResponse.json(
        { error: "Ungültige dealerId." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Das temporäre Passwort muss mindestens 8 Zeichen haben." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const {
      data: { user: currentUser },
      error: currentUserError,
    } = await supabase.auth.getUser();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: "Nicht eingeloggt oder Session ungültig." },
        { status: 401 }
      );
    }

    const adminRole =
      (currentUser.app_metadata?.role as string | undefined) ||
      (currentUser.user_metadata?.role as string | undefined) ||
      null;

    if (!adminRole || !["admin", "superadmin"].includes(adminRole)) {
      return NextResponse.json(
        { error: "Keine Berechtigung." },
        { status: 403 }
      );
    }

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, store_name, auth_user_id")
      .eq("dealer_id", dealerId)
      .maybeSingle<DealerRow>();

    if (dealerError) {
      return NextResponse.json(
        { error: "Dealer konnte nicht geladen werden: " + dealerError.message },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer nicht gefunden." },
        { status: 404 }
      );
    }

    if (!dealer.auth_user_id) {
      return NextResponse.json(
        { error: "Für diesen Dealer ist keine auth_user_id hinterlegt." },
        { status: 400 }
      );
    }

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(dealer.auth_user_id);

    if (authUserError || !authUserData?.user) {
      return NextResponse.json(
        {
          error:
            "Auth-User konnte nicht geladen werden: " +
            (authUserError?.message ?? "unbekannt"),
        },
        { status: 500 }
      );
    }

    const authUser = authUserData.user;

    const existingUserMetadata =
      (authUser.user_metadata as Record<string, unknown> | null) ?? {};

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      dealer.auth_user_id,
      {
        password,
        user_metadata: {
          ...existingUserMetadata,
          must_change_password: true,
          temp_password_set_at: new Date().toISOString(),
          temp_password_set_by:
            currentUser.email ??
            String(currentUser.user_metadata?.login_nr ?? currentUser.id),
        },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Temporäres Passwort konnte nicht gesetzt werden: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Temporäres Passwort wurde gesetzt.",
      dealer: {
        dealer_id: dealer.dealer_id,
        login_nr: dealer.login_nr,
        store_name: dealer.store_name,
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