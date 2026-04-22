import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rawDealerId = body?.dealer_id ?? body?.dealerId;
    const dealerId = Number(rawDealerId);

    const dealerName =
      typeof body?.dealer_name === "string"
        ? body.dealer_name
        : typeof body?.dealerName === "string"
        ? body.dealerName
        : "";

    if (!Number.isFinite(dealerId) || dealerId <= 0) {
      return NextResponse.json(
        { error: "dealer_id fehlt oder ist ungültig" },
        { status: 400 }
      );
    }

    const res = NextResponse.json(
      {
        success: true,
        acting_dealer_id: dealerId,
        acting_dealer_name: dealerName || null,
      },
      { status: 200 }
    );

    res.cookies.set("acting_dealer_id", String(dealerId), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });

    res.cookies.set("acting_dealer_name", dealerName, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Unerwarteter Fehler" },
      { status: 500 }
    );
  }
}