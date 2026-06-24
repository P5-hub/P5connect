import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Role = "admin" | "dealer";
type DealerLanguage = "de_CH" | "fr_CH" | "it_CH";

type CreateBody = {
  loginNr?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: Role | string;

  // Optional: falls du später mehr Felder direkt aus dem Formular mitsenden willst
  storeName?: string;
  street?: string;
  plz?: string;
  zip?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  language?: string;

  contactPerson?: string;

  kam?: string;
  kamName?: string;
  kamEmailSony?: string;
  mailKam?: string;
  mailKam2?: string;

  mailDealer?: string;
  mailBg?: string;
  mailBg2?: string;

  distribution?: string;
  customerType?: string;
  customerClassification?: string;
  serp?: string;
  sds?: string;
  fivejGv?: string;
  ecot4?: string;
  description?: string;
};

type ExistingDealerRow = {
  dealer_id: number;
  login_nr: string;
  auth_user_id: string | null;
};

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

function normalizeRole(value: unknown): Role {
  const role = cleanText(value || "dealer").toLowerCase();

  if (role === "admin") return "admin";
  return "dealer";
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
    const body = (await req.json()) as CreateBody;

    const loginNr = cleanText(body?.loginNr);
    const email = cleanEmail(body?.email);
    const password = String(body?.password ?? "");
    const role = normalizeRole(body?.role);

    const name = cleanText(body?.name);
    const storeName = cleanText(body?.storeName || body?.name);
    const language = normalizeLanguage(body?.language);

    const street = cleanNullableText(body?.street);
    const plz = cleanNullableText(body?.plz);
    const zip = cleanNullableText(body?.zip || body?.plz);
    const city = cleanNullableText(body?.city);
    const country = cleanNullableText(body?.country || "CH");
    const phone = cleanNullableText(body?.phone);
    const website = cleanNullableText(body?.website);

    const contactPerson = cleanNullableText(body?.contactPerson);

    const kam = cleanNullableText(body?.kam || "Matthias Violante");
    const kamName = cleanNullableText(body?.kamName || body?.kam || "Matthias Violante");
    const kamEmailSony = cleanNullableText(
      body?.kamEmailSony || "matthias.violante@sony.com"
    );

    const mailKam = cleanNullableText(
      body?.mailKam || "matthias.violante@p5connect.ch"
    );
    const mailKam2 = cleanNullableText(body?.mailKam2);

    const mailDealer = cleanNullableText(body?.mailDealer || email);
    const mailBg = cleanNullableText(body?.mailBg);
    const mailBg2 = cleanNullableText(body?.mailBg2);

    const distribution = cleanNullableText(body?.distribution);
    const customerType = cleanNullableText(body?.customerType);
    const customerClassification = cleanNullableText(body?.customerClassification);
    const serp = cleanNullableText(body?.serp);
    const sds = cleanNullableText(body?.sds);
    const fivejGv = cleanNullableText(body?.fivejGv);
    const ecot4 = cleanNullableText(body?.ecot4);
    const description = cleanNullableText(body?.description);

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

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "E-Mail ist ungültig." },
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
    const { data: existingDealer, error: existingDealerError } =
      await supabaseAdmin
        .from("dealers")
        .select("dealer_id, login_nr, auth_user_id")
        .eq("login_nr", loginNr)
        .maybeSingle<ExistingDealerRow>();

    if (existingDealerError) {
      return NextResponse.json(
        {
          error:
            "Dealer-Prüfung fehlgeschlagen: " +
            existingDealerError.message,
        },
        { status: 500 }
      );
    }

    if (existingDealer) {
      return NextResponse.json(
        { error: "Diese Login-Nr existiert bereits." },
        { status: 409 }
      );
    }

    // 2) Prüfen, ob E-Mail bereits in dealers existiert
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
            "E-Mail-Prüfung fehlgeschlagen: " +
            existingEmailError.message,
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

    // 3) Auth-User erstellen
    const { data: createdAuthUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          login_nr: loginNr,
          role,
          store_name: storeName || name || "",
        },
        app_metadata: {
          role,
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

    authUserId = createdAuthUser.user.id;

    // 4) Dealer anlegen
    const { data: insertedDealer, error: insertDealerError } =
      await supabaseAdmin
        .from("dealers")
        .insert({
          login_nr: loginNr,

          name: name || storeName || null,
          store_name: storeName || name || null,

          email,
          login_email: email,
          mail_dealer: mailDealer,

          role,
          auth_user_id: authUserId,

          language,

          street,
          plz,
          zip,
          city,
          country,
          phone,
          website,

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

    // 5) Auth-Metadaten mit dealer_id ergänzen
    const { error: updateMetaError } =
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          login_nr: loginNr,
          role,
          store_name: storeName || name || "",
          dealer_id: insertedDealer.dealer_id,
        },
        app_metadata: {
          role,
          dealer_id: insertedDealer.dealer_id,
        },
      });

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
    // Sicherheits-Rollback, falls Auth-User erstellt wurde, aber später ein unerwarteter Fehler passiert
    if (authUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (rollbackError) {
        console.error("Rollback Auth-User fehlgeschlagen:", rollbackError);
      }
    }

    const message = err instanceof Error ? err.message : "Unbekannter Fehler";

    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}