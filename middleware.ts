import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ✅ Erweiterte Public-Routen + startsWith kompatibel
const publicRoutes = [
  "/login",
  "/reset-password",
  "/reset-password/change",
  "/favicon.ico"
]

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Session holen
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user ?? null
  const path = req.nextUrl.pathname

  // ⭐ Jetzt mit startsWith statt includes
  const isPublic = publicRoutes.some(route => path.startsWith(route))

  // --------------------
  // 1) Nicht eingeloggt
  // --------------------
  if (!user) {
    if (isPublic) return res
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // --------------------
  // 2) Rolle bestimmen
  // --------------------
  const role = user.user_metadata?.role ?? "dealer"

  // --------------------
  // 3) ADMIN BYPASS
  // --------------------
  if (role === "admin") {
    if (path === "/login") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    return res
  }

  // --------------------
  // 4) Dealer-Restriktionen
  // --------------------
  if (path === "/login") {
    return NextResponse.redirect(new URL("/bestellung", req.url))
  }

  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/bestellung", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth).*)",
  ],
}
