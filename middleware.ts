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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  res.headers.set("Cache-Control", "private, no-store");

  const isPublic = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (userError || !user) {
    if (isPublic) return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role
      : "dealer";

  const isAdminLike = role === "admin" || role === "superadmin";

  if (path === "/login") {
    if (isAdminLike) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  if (path === "/reset-password" || path === "/reset-password/change") {
    return res;
  }

  if (isAdminLike) {
    return res;
  }

  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/bestellung", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};