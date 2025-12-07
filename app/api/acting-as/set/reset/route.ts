import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Cookie löschen
  res.cookies.set("acting_dealer_id", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
  });

  return res;
}
