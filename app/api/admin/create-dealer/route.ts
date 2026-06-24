import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DealerLanguage = "de_CH" | "fr_CH" | "it_CH";

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\r?\n|\r/g, "")
    .trim();
}

function cleanNullableText(value: unknown): string | null {
  const cleaned = cleanText(value);
  return cleaned.length > 0 ? cleaned : null;
}

function cleanEmail(value: unknown): string {
  return cleanText(value).toLowerCase();
}

function normalizeLanguage(value: unknown): DealerLanguage {
  const lang = cleanText(value || "de_CH");

  if (lang === "fr" || lang === "fr_CH") return "fr_CH";
  if (lang === "it" || lang === "it_CH") return "it_CH";
  return "de_CH";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let authUserId: string | null = null;

  try {
    const body = await req.json();

    const name = cleanText(body.name);
    const email = cleanEmail(body.email);

    const login_nr = cleanText(
      body.login_nr ?? body.loginNr ?? body.loginNumber ?? ""
    );

    const password = cleanText(
      body.password ?? body.startPassword ?? body.start_password ?? ""
    );

    const role = "dealer";

    const city = cleanNullableText(body.city);
    const street = cleanNullableText(body.street);
    const plz = cleanNullableText(body.plz ?? body.zip);
    const zip = cleanNullableText(body.zip ?? body.plz);
    const country = cleanNullableText(body.country ?? "CH");

    const phone = cleanNullableText(body.phone);
    const website = cleanNullableText(body.website);

    const contactPerson = cleanNullableText(
      body.contactPerson ?? body.contact_person
    );

    const language = normalizeLanguage(body.language);

    const mailDealer = cleanNullableText(
      body.mailDealer ?? body.mail_dealer ?? email
    );

    const mailBg = cleanNullableText(body.mailBg ?? body.mail_bg);
    const mailBg2 = cleanNullableText(body.mailBg2 ?? body.mail_bg2);

    const mailKam = cleanNullableText(
      body.mailKam ?? body.mail_kam ?? "matthias.violante@p5connect.ch"
    );

    const mailKam2 = cleanNullableText(body.mailKam2 ?? body.mail_kam2);

    const kam = cleanNullableText(body.kam ?? "Matthias Violante");
    const kamName = cleanNullableText(
      body.kamName ?? body.kam_name ?? body.kam ?? "Matthias Violante"
    );

    const kamEmailSony = cleanNullableText(
      body.kamEmailSony ??
        body.kam_email_sony ??
        "matthias.violante@sony.com"
    );

    const distribution = cleanNullableText(body.distribution);

    const customerType = cleanNullableText(
      body.customerType ?? body.customer_type
    );

    const customerClassification = cleanNullableText(
      body.customerClassification ?? body.customer_classification
    );

    const serp = cleanNullableText(body.serp);
    const sds = cleanNullableText(body.sds);
    const fivejGv = cleanNullableText(body.fivejGv ?? body.fivej_gv);
    const ecot4 = cleanNullableText(body.ecot4);
    const description = cleanNullableText(body.description);

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

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Die E-Mail-Adresse ist ungültig." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
        { status: 400 }
      );
    }

    // 1) Prüfen, ob Login-Nr. bereits existiert
    const { data: existingLogin, error: existingLoginError } =
      await supabaseAdmin
        .from("dealers")
        .select("dealer_id, login_nr, auth_user_id")
        .eq("login_nr", login_nr)
        .maybeSingle();

    if (existingLoginError) {
      return NextResponse.json(
        {
          error:
            "Dealer-Prüfung fehlgeschlagen: " + existingLoginError.message,
        },
        { status: 500 }
      );
    }

    if (existingLogin) {
      return NextResponse.json(
        { error: "Diese Login-Nr. existiert bereits." },
        { status: 409 }
      );
    }

    // 2) Prüfen, ob E-Mail bereits bei einem Händler existiert
    const { data: existingEmailDealer, error: existingEmailError } =
      await supabaseAdmin
        .from("dealers")
        .select("dealer_id, email, login_email")
        .or(`email.eq.${email},login_email.eq.${email}`)
        .maybeSingle();

    if (existingEmailError) {
      return NextResponse.json(
        {
          error:
            "E-Mail-Prüfung fehlgeschlagen: " + existingEmailError.message,
        },
        { status: 500 }
      );
    }

    if (existingEmailDealer) {
      return NextResponse.json(
        { error: "Diese E-Mail ist bereits bei einem Händler hinterlegt." },
        { status: 409 }
      );
    }

    // 3) Auth User erstellen
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          login_nr,
          role,
          store_name: name,
        },
        app_metadata: {
          role,
        },
      });

    if (authError || !authUser.user) {
      return NextResponse.json(
        {
          error:
            authError?.message || "Auth User konnte nicht erstellt werden.",
        },
        { status: 500 }
      );
    }

    authUserId = authUser.user.id;

    // 4) Dealer anlegen
    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .insert({
        name,
        store_name: name,

        email,
        login_email: email,
        mail_dealer: mailDealer,

        login_nr,
        role,

        city,
        street,
        plz,
        zip,
        country,
        phone,
        website,

        language,

        contact_person: contactPerson,

        kam,
        kam_name: kamName,
        kam_email_sony: kamEmailSony,

        mail_kam: mailKam,
        mail_kam2: mailKam2,
        mail_bg: mailBg,
        mail_bg2: mailBg2,

        distribution,

        customer_type: customerType,
        customer_classification: customerClassification,
        serp,
        sds,
        fivej_gv: fivejGv,
        ecot4,
        description,

        auth_user_id: authUserId,
      })
      .select()
      .single();

    if (dealerError || !dealer) {
      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }

      return NextResponse.json(
        {
          error:
            dealerError?.message || "Dealer konnte nicht erstellt werden.",
        },
        { status: 500 }
      );
    }

    // 5) Auth-Metadaten mit dealer_id ergänzen
    const { error: updateMetaError } =
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          login_nr,
          dealer_id: dealer.dealer_id,
          role,
          store_name: name,
        },
        app_metadata: {
          dealer_id: dealer.dealer_id,
          role,
        },
      });

    if (updateMetaError) {
      return NextResponse.json(
        {
          success: true,
          warning:
            "Dealer wurde erstellt, aber Auth-Metadaten konnten nicht vollständig aktualisiert werden: " +
            updateMetaError.message,
          dealer,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      dealer,
    });
  } catch (err: any) {
    console.error("Create dealer error:", err);

    if (authUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (rollbackError) {
        console.error("Rollback Auth User fehlgeschlagen:", rollbackError);
      }
    }

    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 }
    );
  }
}