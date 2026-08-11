import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type ApiAdminContext =
  | {
      ok: true;
      user: {
        id: string;
        email: string | null;
        role: string;
      };
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function getApiAdminContext(
  req: NextRequest
): Promise<ApiAdminContext> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // API-Authentifizierung benötigt hier keine Cookie-Änderungen.
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Nicht eingeloggt." },
        { status: 401 }
      ),
    };
  }

  const role = String(user.app_metadata?.role ?? "");

  if (role !== "admin" && role !== "superadmin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Keine Berechtigung." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      role,
    },
  };
}