import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CreateBody = {
  loginNr?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: "admin" | "dealer" | string;
};

type ExistingDealerRow = {
  dealer_id: number;
  login_nr: string;
  auth_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;

    const loginNr = String(body?.loginNr ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const name = String(body?.name ?? "").trim();
    const role = String(body?.role ?? "dealer").trim();

    if (!loginNr) {
      return NextResponse.json(
        { error: "loginNr ist erforderlich." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "E-Mail ist erforderlich." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen lang sein." },
        { status: 400 }
      );
    }

    if (!["admin", "dealer"].includes(role)) {
      return NextResponse.json(
        { error: "Ungültige Rolle." },
        { status: 400 }
      );
    }

    // 1) Prüfen, ob login_nr bereits existiert
    const { data: existingDealer, error: existingDealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, auth_user_id")
      .eq("login_nr", loginNr)
      .maybeSingle<ExistingDealerRow>();

    if (existingDealerError) {
      return NextResponse.json(
        { error: "Dealer-Prüfung fehlgeschlagen: " + existingDealerError.message },
        { status: 500 }
      );
    }

    if (existingDealer) {
      return NextResponse.json(
        { error: "Diese Login-Nr existiert bereits." },
        { status: 409 }
      );
    }

    // 2) Auth-User erstellen
    const { data: createdAuthUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          login_nr: loginNr,
          role,
          store_name: name || "",
        },
      });

    if (createAuthError || !createdAuthUser.user) {
      return NextResponse.json(
        {
          error:
            "Auth-Benutzer konnte nicht erstellt werden: " +
            (createAuthError?.message ?? "unbekannt"),
        },
        { status: 500 }
      );
    }

    const authUserId = createdAuthUser.user.id;

    // 3) Dealer anlegen
    const { data: insertedDealer, error: insertDealerError } = await supabaseAdmin
      .from("dealers")
      .insert({
        login_nr: loginNr,
        email, // optional, falls du die Spalte weiterführen willst
        login_email: email, // optional, falls vorhanden
        store_name: name || null,
        role,
        auth_user_id: authUserId,
      })
      .select("dealer_id")
      .single<{ dealer_id: number }>();

    if (insertDealerError || !insertedDealer) {
      // Rollback: Auth-User wieder löschen
      await supabaseAdmin.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        {
          error:
            "Dealer konnte nicht erstellt werden: " +
            (insertDealerError?.message ?? "unbekannt"),
        },
        { status: 500 }
      );
    }

    // 4) Auth-Metadaten mit dealer_id ergänzen
    const { error: updateMetaError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      {
        user_metadata: {
          login_nr: loginNr,
          role,
          store_name: name || "",
          dealer_id: insertedDealer.dealer_id,
        },
        app_metadata: {
          role,
          dealer_id: insertedDealer.dealer_id,
        },
      }
    );

    if (updateMetaError) {
      return NextResponse.json(
        {
          success: true,
          warning:
            "Benutzer wurde erstellt, aber Metadaten konnten nicht vollständig aktualisiert werden: " +
            updateMetaError.message,
          dealerId: insertedDealer.dealer_id,
          userId: authUserId,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      dealerId: insertedDealer.dealer_id,
      userId: authUserId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}