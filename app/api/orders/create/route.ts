import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

export async function POST(req: NextRequest) {
  try {
    const auth = await getApiDealerContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { ctx, user } = auth;

    if (!ctx.effectiveDealerId) {
      return NextResponse.json(
        { error: "No effective dealer context found" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const submissionPayload = body?.submissionPayload;
    const itemPayloads = body?.itemPayloads;

    if (!submissionPayload || typeof submissionPayload !== "object") {
      return NextResponse.json(
        { error: "Missing submissionPayload" },
        { status: 400 }
      );
    }

    if (!Array.isArray(itemPayloads) || itemPayloads.length === 0) {
      return NextResponse.json(
        { error: "Missing itemPayloads" },
        { status: 400 }
      );
    }

    const isAdmin = ctx.role === "admin";

    const sanitizedSubmissionPayload = {
      ...submissionPayload,
      dealer_id: ctx.effectiveDealerId,
      is_admin_order: isAdmin,
      created_by_admin_user_id: isAdmin ? user.id : null,
    };

    const adminSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminSupabase.rpc(
      "create_order_with_campaign_guard",
      {
        p_submission: sanitizedSubmissionPayload,
        p_items: itemPayloads,
      }
    );

    if (error) {
      console.error("RPC create_order_with_campaign_guard failed:", error);
      return NextResponse.json(
        { error: error.message || "RPC failed" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, message: "Unknown RPC response" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Order create failed", err);
    return NextResponse.json(
      { error: err?.message ?? "Order create failed" },
      { status: 500 }
    );
  }
}