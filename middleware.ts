import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Seiten, die keinen Login brauchen
const publicRoutes = ["/login", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Supabase Client mit Cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = req.nextUrl;
  const path = url.pathname;
  const dealerId = url.searchParams.get("dealer_id");

  // Falls nicht eingeloggt → nur Public Routes erlauben
  if (!user) {
    if (publicRoutes.some((r) => path.startsWith(r))) {
      return res;
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Eingeloggt → Rolle prüfen
  const role = user.user_metadata?.role;

  // 🔹 LOGIN-REDIRECT LOGIK
  if (path === "/login") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role === "dealer") {
      return NextResponse.redirect(new URL("/bestellung", req.url));
    }
  }

  // 🔹 ADMIN → darf Händlerseiten aufrufen, wenn dealer_id in URL
  if (role === "admin") {
    if (dealerId) {
      // Impersonation erlaubt für alle Händlerseiten
      return res;
    }

    // Ohne dealer_id → kein Zugriff auf Händlerbereiche
    if (
      path.startsWith("/bestellung") ||
      path.startsWith("/verkauf") ||
      path.startsWith("/projekt") ||
      path.startsWith("/support") ||
      path.startsWith("/sofortrabatt") ||
      path.startsWith("/infos")
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 🔹 HÄNDLER → darf nicht in Admin-Bereich
  if (role === "dealer" && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  // 🔹 Wenn kein dealer_id, kein admin → normale Weiterleitung
  return res;
}

// Auf welche Routen Middleware angewendet wird
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
