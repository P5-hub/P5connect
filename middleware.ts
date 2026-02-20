import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ✅ Erweiterte Public-Routen + startsWith kompatibel
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

  // ✅ 0) API- und Next-internals NIE anfassen
  // Sonst bekommst du bei fetch() Redirect/HTML statt JSON
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Session holen
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  // ⭐ Public check
  const isPublic = publicRoutes.some((route) => path.startsWith(route));

  // --------------------
  // 1) Nicht eingeloggt
  // --------------------
  if (!user) {
    if (isPublic) return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // --------------------
  // 2) Rolle bestimmen
  // --------------------
  // (Hinweis: Das ist user_metadata. Später willst du role aus app_metadata/JWT claims nehmen.)
  const role =
  (user.app_metadata as any)?.role ??
  user.user_metadata?.role ??
  "dealer";

  // --------------------
  // 3) ADMIN BYPASS
  // --------------------
  if (role === "admin") {
    if (path === "/login") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return res;
  }

  // --------------------
  // 4) Dealer-Restriktionen
  // --------------------
  if (path === "/login") {
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  return res;
}

// ✅ matcher: /api ausschliessen
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
