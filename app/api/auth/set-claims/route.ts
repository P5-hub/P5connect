import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DealerRow = {
  dealer_id: number;
  login_nr: string;
  role: "admin" | "dealer" | string | null;
  store_name: string | null;
  auth_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = String(body?.userId ?? "").trim();
    const dealerId = Number(body?.dealerId);
    const role = String(body?.role ?? "dealer").trim();

    if (!userId || !Number.isFinite(dealerId) || dealerId <= 0) {
      return NextResponse.json(
        { error: "userId und gültige dealerId sind erforderlich." },
        { status: 400 }
      );
    }

    if (!["admin", "dealer"].includes(role)) {
      return NextResponse.json(
        { error: "Ungültige Rolle." },
        { status: 400 }
      );
    }

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

    // Route ist primär für den frisch eingeloggten User selbst gedacht
    if (currentUser.id !== userId) {
      return NextResponse.json(
        { error: "Claims dürfen nur für den aktuell eingeloggten Benutzer gesetzt werden." },
        { status: 403 }
      );
    }

    const { data: dealer, error: dealerError } = await supabaseAdmin
      .from("dealers")
      .select("dealer_id, login_nr, role, store_name, auth_user_id")
      .eq("dealer_id", dealerId)
      .maybeSingle<DealerRow>();

    if (dealerError) {
      return NextResponse.json(
        { error: "Dealer konnte nicht geladen werden: " + dealerError.message },
        { status: 500 }
      );
    }

    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer nicht gefunden." },
        { status: 404 }
      );
    }

    // Falls auth_user_id noch nicht gesetzt ist oder abweicht: aktualisieren
    if (dealer.auth_user_id !== userId) {
      const { error: dealerUpdateError } = await supabaseAdmin
        .from("dealers")
        .update({ auth_user_id: userId })
        .eq("dealer_id", dealerId);

      if (dealerUpdateError) {
        return NextResponse.json(
          { error: "auth_user_id konnte nicht gesetzt werden: " + dealerUpdateError.message },
          { status: 500 }
        );
      }
    }

    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError || !authUserData?.user) {
      return NextResponse.json(
        {
          error:
            "Auth-User konnte nicht geladen werden: " +
            (authUserError?.message ?? "unbekannt"),
        },
        { status: 500 }
      );
    }

    const authUser = authUserData.user;

    const existingUserMetadata =
      (authUser.user_metadata as Record<string, unknown> | null) ?? {};

    const existingAppMetadata =
      (authUser.app_metadata as Record<string, unknown> | null) ?? {};

    const finalRole = dealer.role ?? role ?? "dealer";

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...existingUserMetadata,
          dealer_id: dealer.dealer_id,
          login_nr: dealer.login_nr,
          role: finalRole,
          store_name: dealer.store_name ?? "",
        },
        app_metadata: {
          ...existingAppMetadata,
          dealer_id: dealer.dealer_id,
          role: finalRole,
        },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Claims konnten nicht gesetzt werden: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      dealerId: dealer.dealer_id,
      role: finalRole,
      loginNr: dealer.login_nr,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: "Unerwarteter Fehler: " + message },
      { status: 500 }
    );
  }
}