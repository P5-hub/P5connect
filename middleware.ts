import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicRoutes = [
  "/login",
  "/reset-password",
  "/reset-password/change",
  "/impressum",
  "/datenschutz",
  "/favicon.ico",
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // API + Next internals + favicon nie anfassen
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // WICHTIG: serverseitig lieber getUser() statt getSession()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Auth-nahe Antworten nicht cachen
  res.headers.set("Cache-Control", "private, no-store");

  const isPublic = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // 1) Nicht eingeloggt
  if (userError || !user) {
    if (isPublic) return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2) Rolle bestimmen
  const role =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role
      : typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : "dealer";

  // 3) Bereits eingeloggt und auf Public-Seiten
  if (path === "/login") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  // reset-password Seiten dürfen auch eingeloggt erreichbar bleiben,
  // falls du das so möchtest. Wenn nicht, hier separat umleiten.
  if (
    path === "/reset-password" ||
    path === "/reset-password/change"
  ) {
    return res;
  }

  // 4) Admin / Dealer Routing
  if (role === "admin") {
    return res;
  }

  // Dealer darf nicht in /admin
  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};