import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerLookup = {
  dealer_id: number;
};

type ErrorCode =
  | "MISSING_REQUIRED_FIELDS"
  | "INVALID_ROLE"
  | "PASSWORD_TOO_SHORT"
  | "NOT_AUTHENTICATED"
  | "FORBIDDEN"
  | "LOGIN_NR_CHECK_FAILED"
  | "LOGIN_NR_EXISTS"
  | "LOGIN_EMAIL_CHECK_FAILED"
  | "LOGIN_EMAIL_EXISTS"
  | "AUTH_CREATE_FAILED"
  | "DEALER_CREATE_FAILED"
  | "AUTH_METADATA_UPDATE_FAILED"
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
    const body = await req.json();

    const loginNr = String(body?.loginNr ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const name = String(body?.name ?? "").trim();
    const role = String(body?.role ?? "dealer").trim();

    if (!loginNr || !email || !password) {
      return errorResponse(
        400,
        "MISSING_REQUIRED_FIELDS",
        "loginNr, email und password sind erforderlich."
      );
    }

    if (!["admin", "dealer"].includes(role)) {
      return errorResponse(
        400,
        "INVALID_ROLE",
        "Ungültige Rolle. Erlaubt sind nur 'admin' oder 'dealer'."
      );
    }

    if (password.length < 6) {
      return errorResponse(
        400,
        "PASSWORD_TOO_SHORT",
        "Das Passwort muss mindestens 6 Zeichen lang sein."
      );
    }

    // 1) Aufrufenden User prüfen
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
        "Nur Admins dürfen Benutzer erstellen."
      );
    }

    // 2) Prüfen, ob login_nr schon existiert
    const { data: existingLogin, error: existingLoginError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id")
      .eq("login_nr", loginNr)
      .maybeSingle<DealerLookup>();

    if (existingLoginError) {
      return errorResponse(
        500,
        "LOGIN_NR_CHECK_FAILED",
        "Fehler bei der Prüfung von login_nr: " + existingLoginError.message
      );
    }

    if (existingLogin) {
      return errorResponse(
        409,
        "LOGIN_NR_EXISTS",
        `Die login_nr '${loginNr}' existiert bereits.`
      );
    }

    // 3) Prüfen, ob login_email schon existiert
    const { data: existingEmail, error: existingEmailError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id")
      .eq("login_email", email)
      .maybeSingle<DealerLookup>();

    if (existingEmailError) {
      return errorResponse(
        500,
        "LOGIN_EMAIL_CHECK_FAILED",
        "Fehler bei der Prüfung von login_email: " + existingEmailError.message
      );
    }

    if (existingEmail) {
      return errorResponse(
        409,
        "LOGIN_EMAIL_EXISTS",
        `Die E-Mail '${email}' existiert bereits.`
      );
    }

    // 4) Auth-User anlegen
    const { data: createdAuth, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          login_nr: loginNr,
          role,
          name: name || null,
        },
        app_metadata: {
          role,
        },
      });

    if (createAuthError || !createdAuth.user) {
      return errorResponse(
        500,
        "AUTH_CREATE_FAILED",
        "Auth-User konnte nicht erstellt werden: " +
          (createAuthError?.message ?? "unbekannt")
      );
    }

    const authUser = createdAuth.user;

    // 5) Dealer-Datensatz anlegen
    const { data: createdDealer, error: createDealerError } = await supabaseAdmin
      .from("dealers")
      .insert({
        login_nr: loginNr,
        login_email: email,
        name: name || loginNr,
        role,
        auth_user_id: authUser.id,
        password_plain: null, // bewusst NICHT mehr speichern
      })
      .select("dealer_id")
      .single<DealerLookup>();

    if (createDealerError || !createdDealer) {
      // Rollback-Versuch: Auth-User wieder löschen
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);

      return errorResponse(
        500,
        "DEALER_CREATE_FAILED",
        "Dealer-Datensatz konnte nicht erstellt werden: " +
          (createDealerError?.message ?? "unbekannt")
      );
    }

    // 6) app_metadata mit dealer_id ergänzen
    const { error: updateAuthError } =
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        app_metadata: {
          ...((authUser.app_metadata as Record<string, unknown> | null) ?? {}),
          role,
          dealer_id: createdDealer.dealer_id,
        },
      });

    if (updateAuthError) {
      return errorResponse(
        500,
        "AUTH_METADATA_UPDATE_FAILED",
        "Benutzer wurde erstellt, aber app_metadata konnte nicht ergänzt werden: " +
          updateAuthError.message
      );
    }

    return NextResponse.json({
      success: true,
      userId: authUser.id,
      dealerId: createdDealer.dealer_id,
      loginNr,
      email,
      role,
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