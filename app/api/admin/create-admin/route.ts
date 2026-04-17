import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

type CreateAdminBody = {
  dealer_id: number;
  email: string;
  password?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateAdminBody;

    const dealer_id = Number(body.dealer_id);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = body.password?.trim();

    if (!dealer_id || Number.isNaN(dealer_id)) {
      return NextResponse.json(
        { error: "dealer_id ist ungültig." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "E-Mail ist ungültig." },
        { status: 400 }
      );
    }

    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // keine Cookies nötig
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Nicht eingeloggt." },
        { status: 401 }
      );
    }

    // Nur Superadmin darf neue Admins anlegen
    if (user.app_metadata?.role !== "superadmin") {
      return NextResponse.json(
        {
          error:
            "Keine Berechtigung. Nur Superadmins dürfen Admins anlegen.",
        },
        { status: 403 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, name, login_email, auth_user_id, role")
      .eq("dealer_id", dealer_id)
      .maybeSingle();

    if (dealerError) {
      return NextResponse.json(
        { error: `Dealer-Lookup fehlgeschlagen: ${dealerError.message}` },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: `Dealer mit dealer_id ${dealer_id} nicht gefunden.` },
        { status: 404 }
      );
    }

    const { data: usersData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (listError) {
      return NextResponse.json(
        { error: `Auth-User konnten nicht geladen werden: ${listError.message}` },
        { status: 500 }
      );
    }

    const existingUser = usersData.users.find(
      (u) => (u.email || "").toLowerCase() === email
    );

    let authUserId: string;

    if (existingUser) {
      authUserId = existingUser.id;

      const currentAppMeta = existingUser.app_metadata ?? {};

      const { error: updateUserError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          app_metadata: {
            ...currentAppMeta,
            role: "admin",
            dealer_id,
          },
          user_metadata: {
            ...(existingUser.user_metadata ?? {}),
            role: "admin",
            dealer_id,
          },
        });

      if (updateUserError) {
        return NextResponse.json(
          {
            error: `Auth-User konnte nicht aktualisiert werden: ${updateUserError.message}`,
          },
          { status: 500 }
        );
      }
    } else {
      if (!password || password.length < 8) {
        return NextResponse.json(
          {
            error:
              "Für neue Admins ist ein Passwort mit mindestens 8 Zeichen erforderlich.",
          },
          { status: 400 }
        );
      }

      const { data: createdUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          app_metadata: {
            role: "admin",
            dealer_id,
          },
          user_metadata: {
            role: "admin",
            dealer_id,
          },
        });

      if (createUserError || !createdUser.user) {
        return NextResponse.json(
          {
            error: `Auth-User konnte nicht erstellt werden: ${
              createUserError?.message || "Unbekannter Fehler"
            }`,
          },
          { status: 500 }
        );
      }

      authUserId = createdUser.user.id;
    }

    if (dealer.auth_user_id && dealer.auth_user_id !== authUserId) {
      return NextResponse.json(
        {
          error:
            "Dieser Dealer ist bereits einem anderen Benutzer zugewiesen.",
        },
        { status: 400 }
      );
    }

    const { error: rpcError } = await supabaseAdmin.rpc(
      "link_admin_to_dealer",
      {
        p_dealer_id: dealer_id,
        p_auth_user_id: authUserId,
        p_login_email: email,
      }
    );

    if (rpcError) {
      return NextResponse.json(
        { error: `Dealer-Verknüpfung fehlgeschlagen: ${rpcError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin wurde erfolgreich angelegt oder aktualisiert.",
      dealer_id,
      email,
      auth_user_id: authUserId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Serverfehler";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}