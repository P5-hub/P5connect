import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
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

type ErrorCode =
  | "NOT_AUTHENTICATED"
  | "FORBIDDEN"
  | "OLD_LOGIN_REQUIRED"
  | "NO_CHANGES_PROVIDED"
  | "PASSWORD_TOO_SHORT"
  | "DEALER_LOAD_FAILED"
  | "DEALER_NOT_FOUND"
  | "AUTH_USER_ID_MISSING"
  | "NEW_LOGIN_CHECK_FAILED"
  | "NEW_LOGIN_ALREADY_EXISTS"
  | "DEALER_UPDATE_FAILED"
  | "AUTH_USER_LOAD_FAILED"
  | "AUTH_USER_UPDATE_FAILED"
  | "UNEXPECTED_ERROR";

function errorResponse(
  status: number,
  errorCode: ErrorCode,
  error?: string
) {
  return NextResponse.json(
    {
      success: false,
      errorCode,
      error,
    },
    { status }
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UpdateBody;

    const oldLogin = String(body?.oldLogin ?? "").trim();
    const newLogin = String(body?.newLogin ?? "").trim();
    const newPassword = String(body?.newPassword ?? "");

    if (!oldLogin) {
      return errorResponse(
        400,
        "OLD_LOGIN_REQUIRED",
        "oldLogin ist erforderlich."
      );
    }

    if (!newLogin && !newPassword) {
      return errorResponse(
        400,
        "NO_CHANGES_PROVIDED",
        "Es wurde keine Änderung übergeben."
      );
    }

    if (newPassword && newPassword.length < 8) {
      return errorResponse(
        400,
        "PASSWORD_TOO_SHORT",
        "Neues Passwort muss mindestens 8 Zeichen lang sein."
      );
    }

    // 0) Aktuellen User aus Session ermitteln
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
      return errorResponse(
        401,
        "NOT_AUTHENTICATED",
        "Nicht eingeloggt oder Session ungültig."
      );
    }

    const currentRole =
      (currentUser.app_metadata as Record<string, unknown> | undefined)?.role ??
      null;

    if (currentRole !== "admin") {
      return errorResponse(
        403,
        "FORBIDDEN",
        "Nur Admins dürfen Benutzer aktualisieren."
      );
    }

    // 1) Ziel-Dealer laden
    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, role, store_name, auth_user_id")
      .eq("login_nr", oldLogin)
      .maybeSingle<DealerRow>();

    if (dealerError) {
      return errorResponse(
        500,
        "DEALER_LOAD_FAILED",
        "Dealer konnte nicht geladen werden: " + dealerError.message
      );
    }

    if (!dealer) {
      return errorResponse(
        404,
        "DEALER_NOT_FOUND",
        "Benutzer mit dieser Login-Nr wurde nicht gefunden."
      );
    }

    if (!dealer.auth_user_id) {
      return errorResponse(
        500,
        "AUTH_USER_ID_MISSING",
        "Für diesen Benutzer fehlt auth_user_id."
      );
    }

    // 2) Prüfen, ob neue login_nr schon existiert
    if (newLogin && newLogin !== oldLogin) {
      const { data: duplicateDealer, error: duplicateError } =
        await supabaseAdmin
          .from("dealers")
          .select("dealer_id, login_nr")
          .eq("login_nr", newLogin)
          .maybeSingle<DuplicateDealerRow>();

      if (duplicateError) {
        return errorResponse(
          500,
          "NEW_LOGIN_CHECK_FAILED",
          "Prüfung der neuen Login-Nr fehlgeschlagen: " + duplicateError.message
        );
      }

      if (duplicateDealer) {
        return errorResponse(
          409,
          "NEW_LOGIN_ALREADY_EXISTS",
          "Die neue Login-Nr ist bereits vergeben."
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
        return errorResponse(
          500,
          "DEALER_UPDATE_FAILED",
          "Dealer konnte nicht aktualisiert werden: " + dealerUpdateError.message
        );
      }
    }

    // 4) Auth-User laden, um vorhandene Metadaten mitzunehmen
    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(dealer.auth_user_id);

    if (authUserError || !authUserData?.user) {
      return errorResponse(
        500,
        "AUTH_USER_LOAD_FAILED",
        "Auth-Benutzer konnte nicht geladen werden: " +
          (authUserError?.message ?? "unbekannt")
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

    const { error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(
        dealer.auth_user_id,
        authUpdatePayload
      );

    if (authUpdateError) {
      return errorResponse(
        500,
        "AUTH_USER_UPDATE_FAILED",
        "Auth-Benutzer konnte nicht aktualisiert werden: " +
          authUpdateError.message
      );
    }

    // 6) Eigenen Account korrekt erkennen
    const changedOwnAccount = currentUser.id === dealer.auth_user_id;

    return NextResponse.json({
      success: true,
      oldLogin,
      updatedLoginNr: finalLogin,
      updatedUserId: dealer.auth_user_id,
      updatedDealerId: dealer.dealer_id,
      role: dealer.role ?? "dealer",
      passwordChanged: Boolean(newPassword),
      changedOwnAccount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return errorResponse(
      500,
      "UNEXPECTED_ERROR",
      "Unerwarteter Fehler: " + message
    );
  }
}