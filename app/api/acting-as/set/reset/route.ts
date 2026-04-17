import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { dealerId } = await req.json();

    if (!dealerId) {
      return NextResponse.json({ error: "dealerId fehlt" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set("acting_dealer_id", String(dealerId), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: "Fehler beim Setzen" }, { status: 500 });
  }
}