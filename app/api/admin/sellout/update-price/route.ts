import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: "Missing Supabase environment variables" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const body = await req.json();

        const itemId = Number(body?.item_id);
        const price = Number(body?.preis);

        if (!itemId || Number.isNaN(itemId)) {
            return NextResponse.json(
                { error: "Missing or invalid item_id" },
                { status: 400 }
            );
        }

        if (Number.isNaN(price) || price < 0) {
            return NextResponse.json(
                { error: "Missing or invalid price" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("submission_items")
            .update({
                preis: price,
                updated_at: new Date().toISOString(),
            })
            .eq("item_id", itemId)
            .select(
                "item_id, submission_id, product_id, ean, sony_article, product_name, menge, preis"
            )
            .single();

        if (error) {
            console.error("Sell-out price update error:", error);

            return NextResponse.json(
                { error: "Price update failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            item: data,
        });
    } catch (error) {
        console.error("Sell-out price update route error:", error);

        return NextResponse.json(
            { error: "Unexpected server error" },
            { status: 500 }
        );
    }
}