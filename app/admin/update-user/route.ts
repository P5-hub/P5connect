import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type UpdateBody = {
  oldLogin?: string;
  newLogin?: string;
  newPassword?: string;
};

type DealerRow = {
  dealer_id: number;
  login_nr: string;
  role: "admin" | "dealer" | string | null;
  store_name: string | null;
  auth_user_id: string | null;
};

type DuplicateDealerRow = {
  dealer_id: number;
  login_nr: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UpdateBody;

    const oldLogin = String(body?.oldLogin ?? "").trim();
    const newLogin = String(body?.newLogin ?? "").trim();
    const newPassword = String(body?.newPassword ?? "");

    if (!oldLogin) {
      return NextResponse.json(
        { error: "oldLogin ist erforderlich." },
        { status: 400 }
      );
    }

    if (!newLogin && !newPassword) {
      return NextResponse.json(
        { error: "Es wurde keine Änderung übergeben." },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { error: "Neues Passwort muss mindestens 8 Zeichen lang sein." },
        { status: 400 }
      );
    }

    // 1) Ziel-Dealer laden
    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, role, store_name, auth_user_id")
      .eq("login_nr", oldLogin)
      .maybeSingle<DealerRow>();

    if (dealerError) {
      return NextResponse.json(
        { error: "Dealer konnte nicht geladen werden: " + dealerError.message },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: "Benutzer mit dieser Login-Nr wurde nicht gefunden." },
        { status: 404 }
      );
    }

    if (!dealer.auth_user_id) {
      return NextResponse.json(
        { error: "Für diesen Benutzer fehlt auth_user_id." },
        { status: 500 }
      );
    }

    // 2) Prüfen, ob neue login_nr schon existiert
    if (newLogin && newLogin !== oldLogin) {
      const { data: duplicateDealer, error: duplicateError } = await supabaseAdmin
        .from("dealers")
        .select("dealer_id, login_nr")
        .eq("login_nr", newLogin)
        .maybeSingle<DuplicateDealerRow>();

      if (duplicateError) {
        return NextResponse.json(
          { error: "Prüfung der neuen Login-Nr fehlgeschlagen: " + duplicateError.message },
          { status: 500 }
        );
      }

      if (duplicateDealer) {
        return NextResponse.json(
          { error: "Die neue Login-Nr ist bereits vergeben." },
          { status: 409 }
        );
      }
    }

    const finalLogin = newLogin || dealer.login_nr;

    // 3) Dealer-Datensatz aktualisieren
    if (finalLogin !== dealer.login_nr) {
      const { error: dealerUpdateError } = await supabaseAdmin
        .from("dealers")
        .update({
          login_nr: finalLogin,
        })
        .eq("dealer_id", dealer.dealer_id);

      if (dealerUpdateError) {
        return NextResponse.json(
          { error: "Dealer konnte nicht aktualisiert werden: " + dealerUpdateError.message },
          { status: 500 }
        );
      }
    }

    // 4) Auth-User laden, um vorhandene Metadaten mitzunehmen
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

    const existingUserMetadata =
      (authUserData.user.user_metadata as Record<string, unknown> | null) ?? {};
    const existingAppMetadata =
      (authUserData.user.app_metadata as Record<string, unknown> | null) ?? {};

    // 5) Auth-Update vorbereiten
    const authUpdatePayload: {
      password?: string;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    } = {
      user_metadata: {
        ...existingUserMetadata,
        dealer_id: dealer.dealer_id,
        login_nr: finalLogin,
        role: dealer.role ?? "dealer",
        store_name: dealer.store_name ?? "",
      },
      app_metadata: {
        ...existingAppMetadata,
        dealer_id: dealer.dealer_id,
        role: dealer.role ?? "dealer",
      },
    };

    if (newPassword) {
      authUpdatePayload.password = newPassword;
    }

    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      dealer.auth_user_id,
      authUpdatePayload
    );

    if (authUpdateError) {
      return NextResponse.json(
        { error: "Auth-Benutzer konnte nicht aktualisiert werden: " + authUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      oldLogin,
      updatedLoginNr: finalLogin,
      updatedUserId: dealer.auth_user_id,
      updatedDealerId: dealer.dealer_id,
      role: dealer.role ?? "dealer",
      passwordChanged: Boolean(newPassword),
      changedOwnAccount: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}