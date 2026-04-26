import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    const login_nr = String(
      body.login_nr ?? body.loginNr ?? body.loginNumber ?? ""
    ).trim();

    const password = String(
      body.password ?? body.startPassword ?? body.start_password ?? ""
    ).trim();

    const city = String(body.city ?? "").trim() || null;
    const street = String(body.street ?? "").trim() || null;
    const zip = String(body.zip ?? body.plz ?? "").trim() || null;
    const country = String(body.country ?? "").trim() || null;

    if (!name || !email || !login_nr || !password) {
      return NextResponse.json(
        {
          error: "Pflichtfelder fehlen",
          received: {
            name: Boolean(name),
            email: Boolean(email),
            login_nr: Boolean(login_nr),
            password: Boolean(password),
          },
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
        { status: 400 }
      );
    }

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          login_nr,
          role: "dealer",
          store_name: name,
        },
        app_metadata: {
          role: "dealer",
        },
      });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth User konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    const authUserId = authUser.user.id;

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .insert({
        name,
        store_name: name,
        email,
        login_email: email,
        login_nr,
        password_plain: password,
        role: "dealer",
        city,
        street,
        zip,
        country,
        auth_user_id: authUserId,
      })
      .select()
      .single();

    if (dealerError || !dealer) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        { error: dealerError?.message || "Dealer konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: {
        login_nr,
        dealer_id: dealer.dealer_id,
        role: "dealer",
        store_name: name,
      },
      app_metadata: {
        dealer_id: dealer.dealer_id,
        role: "dealer",
      },
    });

    return NextResponse.json({
      success: true,
      dealer,
    });
  } catch (err: any) {
    console.error("Create dealer error:", err);

    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}