import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerRow = {
  dealer_id: number;
  login_nr: string;
  login_email: string;
  role: "admin" | "dealer" | string | null;
  auth_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const oldLogin = String(body?.oldLogin ?? "").trim();
    const newLogin = String(body?.newLogin ?? "").trim();
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword.trim() : "";

    if (!oldLogin || !newLogin) {
      return NextResponse.json(
        { error: "oldLogin und newLogin sind erforderlich." },
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

    const currentRole =
      (currentUser.app_metadata as Record<string, unknown> | undefined)?.role ??
      null;

    if (currentRole !== "admin") {
      return NextResponse.json(
        { error: "Nur Admins dürfen Benutzer aktualisieren." },
        { status: 403 }
      );
    }

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, login_email, role, auth_user_id")
      .eq("login_nr", oldLogin)
      .maybeSingle<DealerRow>();

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

    if (oldLogin !== newLogin) {
      const { data: existingDealer, error: existingDealerError } =
        await supabaseAdmin
          .from("dealers")
          .select("dealer_id")
          .eq("login_nr", newLogin)
          .maybeSingle();

      if (existingDealerError) {
        return NextResponse.json(
          { error: "Fehler bei der Login-Prüfung: " + existingDealerError.message },
          { status: 500 }
        );
      }

      if (existingDealer) {
        return NextResponse.json(
          { error: `Die neue login_nr '${newLogin}' existiert bereits.` },
          { status: 409 }
        );
      }
    }

    const userId = dealer.auth_user_id;

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

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

    const existingAppMetadata =
      (authUser.app_metadata as Record<string, unknown> | null) ?? {};

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ...(newPassword ? { password: newPassword } : {}),
        user_metadata: {
          ...existingUserMetadata,
          login_nr: newLogin,
          role: dealer.role ?? "dealer",
        },
        app_metadata: {
          ...existingAppMetadata,
          role: dealer.role ?? "dealer",
          dealer_id: dealer.dealer_id,
        },
      }
    );

    if (authError) {
      return NextResponse.json(
        { error: "Auth-Update fehlgeschlagen: " + authError.message },
        { status: 500 }
      );
    }

    const { error: dealerUpdateError } = await supabaseAdmin
      .from("dealers")
      .update({
        login_nr: newLogin,
      })
      .eq("dealer_id", dealer.dealer_id);

    if (dealerUpdateError) {
      return NextResponse.json(
        { error: "Dealer-Update fehlgeschlagen: " + dealerUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      oldLogin,
      updatedLoginNr: newLogin,
      updatedUserId: userId,
      updatedDealerId: dealer.dealer_id,
      updatedLoginEmail: dealer.login_email,
      role: dealer.role,
      changedOwnAccount: currentUser.id === userId,
      passwordChanged: Boolean(newPassword),
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