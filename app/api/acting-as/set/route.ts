import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { dealer_id } = await req.json();

    if (!dealer_id) {
      return NextResponse.json(
        { error: "dealer_id fehlt" },
        { status: 400 }
      );
    }

    const res = NextResponse.json(
      { success: true, acting_dealer_id: dealer_id },
      { status: 200 }
    );

    // Cookie 24h gültig
    res.cookies.set("acting_dealer_id", dealer_id.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Unerwarteter Fehler" },
      { status: 500 }
    );
  }
}
