import { NextRequest, NextResponse } from "next/server";
import { getApiAdminContext } from "@/lib/auth/getApiAdminContext";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getAdminSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function createRawToken() {
  return `p5_live_${crypto.randomBytes(32).toString("hex")}`;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseDealerId(value: string) {
  const dealerId = Number(value);

  if (!Number.isInteger(dealerId) || dealerId <= 0) {
    return null;
  }

  return dealerId;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const auth = await getApiAdminContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { dealerId: dealerIdParam } = await params;
    const dealerId = parseDealerId(dealerIdParam);

    if (!dealerId) {
      return NextResponse.json(
        { error: "Ungültige Händler-ID." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("dealer_api_tokens")
      .select(
        `
          id,
          dealer_id,
          name,
          active,
          created_at,
          last_used_at,
          expires_at,
          revoked_at
        `
      )
      .eq("dealer_id", dealerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Feed token GET error:", error);

      return NextResponse.json(
        { error: "API-Zugang konnte nicht geladen werden." },
        { status: 500 }
      );
    }

    const tokens = data ?? [];

    const activeToken =
      tokens.find(
        (token) =>
          token.active === true &&
          !token.revoked_at &&
          (!token.expires_at ||
            new Date(token.expires_at).getTime() > Date.now())
      ) ?? null;

    return NextResponse.json({
      dealerId,
      activeToken,
      tokens,
      feedUrl: "https://www.p5connect.ch/api/dealer-feed/pricelist",
    });
  } catch (error) {
    console.error("Feed token GET unexpected error:", error);

    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const auth = await getApiAdminContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { dealerId: dealerIdParam } = await params;
    const dealerId = parseDealerId(dealerIdParam);

    if (!dealerId) {
      return NextResponse.json(
        { error: "Ungültige Händler-ID." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("dealer_id, name")
      .eq("dealer_id", dealerId)
      .maybeSingle();

    if (dealerError) {
      console.error("Dealer lookup error:", dealerError);

      return NextResponse.json(
        { error: "Händler konnte nicht geprüft werden." },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: "Händler nicht gefunden." },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const requestedName =
      typeof body?.name === "string" ? body.name.trim() : "";

    const tokenName =
      requestedName ||
      `${dealer.name ?? `Dealer ${dealerId}`} – Price Feed`;

    const { data: existingTokens, error: existingError } = await supabase
      .from("dealer_api_tokens")
      .select("id")
      .eq("dealer_id", dealerId)
      .eq("active", true)
      .is("revoked_at", null);

    if (existingError) {
      console.error("Existing token lookup error:", existingError);

      return NextResponse.json(
        {
          error:
            "Bestehende API-Zugänge konnten nicht geprüft werden.",
        },
        { status: 500 }
      );
    }

    if ((existingTokens ?? []).length > 0) {
      return NextResponse.json(
        {
          error:
            "Für diesen Händler existiert bereits ein aktiver API-Zugang. Bitte zuerst deaktivieren oder widerrufen.",
        },
        { status: 409 }
      );
    }

    const rawToken = createRawToken();
    const tokenHash = hashToken(rawToken);

    const { data: insertedToken, error: insertError } = await supabase
      .from("dealer_api_tokens")
      .insert({
        dealer_id: dealerId,
        token_hash: tokenHash,
        name: tokenName,
        active: true,
      })
      .select(
        `
          id,
          dealer_id,
          name,
          active,
          created_at,
          last_used_at,
          expires_at,
          revoked_at
        `
      )
      .single();

    if (insertError) {
      console.error("Feed token create error:", insertError);

      return NextResponse.json(
        { error: "API-Zugang konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "API-Zugang wurde erstellt.",
        token: rawToken,
        tokenInfo: insertedToken,
        feedUrl: "https://www.p5connect.ch/api/dealer-feed/pricelist",
        warning:
          "Der Token wird nur dieses eine Mal im Klartext angezeigt.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feed token POST unexpected error:", error);

    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const auth = await getApiAdminContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { dealerId: dealerIdParam } = await params;
    const dealerId = parseDealerId(dealerIdParam);

    if (!dealerId) {
      return NextResponse.json(
        { error: "Ungültige Händler-ID." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    if (typeof body?.active !== "boolean") {
      return NextResponse.json(
        { error: "active muss true oder false sein." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: latestToken, error: lookupError } = await supabase
      .from("dealer_api_tokens")
      .select("id, active, revoked_at")
      .eq("dealer_id", dealerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("Feed token PATCH lookup error:", lookupError);

      return NextResponse.json(
        { error: "API-Zugang konnte nicht geladen werden." },
        { status: 500 }
      );
    }

    if (!latestToken) {
      return NextResponse.json(
        { error: "Kein API-Zugang vorhanden." },
        { status: 404 }
      );
    }

    if (latestToken.revoked_at && body.active === true) {
      return NextResponse.json(
        {
          error:
            "Ein widerrufener Token kann nicht wieder aktiviert werden. Bitte einen neuen Token erstellen.",
        },
        { status: 409 }
      );
    }

    const { data: updatedToken, error: updateError } = await supabase
      .from("dealer_api_tokens")
      .update({
        active: body.active,
      })
      .eq("id", latestToken.id)
      .select(
        `
          id,
          dealer_id,
          name,
          active,
          created_at,
          last_used_at,
          expires_at,
          revoked_at
        `
      )
      .single();

    if (updateError) {
      console.error("Feed token PATCH update error:", updateError);

      return NextResponse.json(
        { error: "API-Zugang konnte nicht geändert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: body.active
        ? "API-Zugang wurde aktiviert."
        : "API-Zugang wurde deaktiviert.",
      tokenInfo: updatedToken,
    });
  } catch (error) {
    console.error("Feed token PATCH unexpected error:", error);

    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const auth = await getApiAdminContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { dealerId: dealerIdParam } = await params;
    const dealerId = parseDealerId(dealerIdParam);

    if (!dealerId) {
      return NextResponse.json(
        { error: "Ungültige Händler-ID." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: latestToken, error: lookupError } = await supabase
      .from("dealer_api_tokens")
      .select("id, revoked_at")
      .eq("dealer_id", dealerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("Feed token DELETE lookup error:", lookupError);

      return NextResponse.json(
        { error: "API-Zugang konnte nicht geladen werden." },
        { status: 500 }
      );
    }

    if (!latestToken) {
      return NextResponse.json(
        { error: "Kein API-Zugang vorhanden." },
        { status: 404 }
      );
    }

    if (latestToken.revoked_at) {
      return NextResponse.json({
        message: "API-Zugang ist bereits widerrufen.",
      });
    }

    const { error: revokeError } = await supabase
      .from("dealer_api_tokens")
      .update({
        active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", latestToken.id);

    if (revokeError) {
      console.error("Feed token revoke error:", revokeError);

      return NextResponse.json(
        { error: "API-Zugang konnte nicht widerrufen werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "API-Zugang wurde widerrufen.",
    });
  } catch (error) {
    console.error("Feed token DELETE unexpected error:", error);

    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}