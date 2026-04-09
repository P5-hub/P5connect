import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerLookup = {
  dealer_id: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const loginNr = String(body?.loginNr ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const name = String(body?.name ?? "").trim();
    const role = String(body?.role ?? "dealer").trim();

    if (!loginNr || !email || !password) {
      return NextResponse.json(
        { error: "loginNr, email und password sind erforderlich." },
        { status: 400 }
      );
    }

    if (!["admin", "dealer"].includes(role)) {
      return NextResponse.json(
        { error: "Ungültige Rolle. Erlaubt sind nur 'admin' oder 'dealer'." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Das Passwort muss mindestens 6 Zeichen lang sein." },
        { status: 400 }
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
        { error: "Nur Admins dürfen Benutzer erstellen." },
        { status: 403 }
      );
    }

    // 2) Prüfen, ob login_nr schon existiert
    const { data: existingLogin, error: existingLoginError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id")
      .eq("login_nr", loginNr)
      .maybeSingle<DealerLookup>();

    if (existingLoginError) {
      return NextResponse.json(
        { error: "Fehler bei der Prüfung von login_nr: " + existingLoginError.message },
        { status: 500 }
      );
    }

    if (existingLogin) {
      return NextResponse.json(
        { error: `Die login_nr '${loginNr}' existiert bereits.` },
        { status: 409 }
      );
    }

    // 3) Prüfen, ob login_email schon existiert
    const { data: existingEmail, error: existingEmailError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id")
      .eq("login_email", email)
      .maybeSingle<DealerLookup>();

    if (existingEmailError) {
      return NextResponse.json(
        { error: "Fehler bei der Prüfung von login_email: " + existingEmailError.message },
        { status: 500 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: `Die E-Mail '${email}' existiert bereits.` },
        { status: 409 }
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
      return NextResponse.json(
        {
          error:
            "Auth-User konnte nicht erstellt werden: " +
            (createAuthError?.message ?? "unbekannt"),
        },
        { status: 500 }
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
        password_plain: password, // mittelfristig entfernen
      })
      .select("dealer_id")
      .single<DealerLookup>();

    if (createDealerError || !createdDealer) {
      // Rollback-Versuch: Auth-User wieder löschen
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);

      return NextResponse.json(
        {
          error:
            "Dealer-Datensatz konnte nicht erstellt werden: " +
            (createDealerError?.message ?? "unbekannt"),
        },
        { status: 500 }
      );
    }

    // 6) app_metadata mit dealer_id ergänzen
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      {
        app_metadata: {
          ...((authUser.app_metadata as Record<string, unknown> | null) ?? {}),
          role,
          dealer_id: createdDealer.dealer_id,
        },
      }
    );

    if (updateAuthError) {
      return NextResponse.json(
        {
          error:
            "Benutzer wurde erstellt, aber app_metadata konnte nicht ergänzt werden: " +
            updateAuthError.message,
        },
        { status: 500 }
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
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}