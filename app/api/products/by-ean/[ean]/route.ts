import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();

  try {
    const body = await req.json();
    const {
      dealer_id,
      items,
      sony_share = 100,
      kommentar = null,
    }: {
      dealer_id?: number | string;
      items?: any[];
      sony_share?: number;
      kommentar?: string | null;
    } = body;

    // 🔹 Eingaben prüfen
    const dealerIdNum = Number(dealer_id);
    if (!dealer_id || !Number.isFinite(dealerIdNum)) {
      return NextResponse.json({ error: "dealer_id fehlt oder ungültig" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keine Verkaufsdaten erhalten" }, { status: 400 });
    }

    console.log("🟢 Upload erhalten:", {
      dealer_id: dealerIdNum,
      sony_share,
      kommentar,
      items_count: items.length,
    });

    // 🧩 Typdefinition für SubmissionInsert
    type SubmissionInsert = {
      dealer_id: number;
      typ: "order" | "project" | "bestellung" | "support" | "cashback"; // ✅ laut Schema
      kommentar?: string | null;
      sony_share?: number | null;
      created_at?: string;
    };

    // 1️⃣ Neue Submission anlegen (Kopf)
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .insert([
        {
          dealer_id: dealerIdNum,
          typ: "order", // ✅ laut Typdefinition erlaubt
          kommentar,
          sony_share,
          created_at: new Date().toISOString(),
        } satisfies SubmissionInsert,
      ])
      .select("submission_id")
      .single();

    if (subErr || !submission) {
      console.error("❌ Fehler beim Erstellen der Submission:", subErr);
      return NextResponse.json(
        { error: "Fehler beim Erstellen der Submission", details: subErr?.message },
        { status: 500 }
      );
    }

    const submission_id = submission.submission_id;

    // 2️⃣ Alle EANs sammeln (nur eindeutige & gültige)
    const eans = [
      ...new Set(
        items
          .map((i: any) => i.ean || i.barcode)
          .filter((ean: string | null | undefined) => !!ean && ean.length > 5)
      ),
    ];

    // 3️⃣ Produktnamen in einem Schritt aus product_view laden
    let productMap: Record<string, string> = {};
    if (eans.length > 0) {
      const { data: productData, error: productErr } = await supabase
        .from("product_view")
        .select("ean, product_name")
        .in("ean", eans);

      if (productErr) {
        console.error("⚠️ Fehler beim Abrufen der Produktnamen:", productErr);
      }

      productMap = Object.fromEntries(
        (productData || []).map((p) => [p.ean, p.product_name])
      );
    }

    // 4️⃣ Items vorbereiten mit zugewiesenem Produktnamen
    const nowISO = new Date().toISOString();
    const cleanedItems = items.map((item: any) => {
      const ean = item.ean || item.barcode || null;
      const menge = parseInt(item.menge || item.quantity || "1", 10);
      const preis = parseFloat(item.price || item.preis || "0");

      return {
        submission_id,
        ean,
        product_name: ean && productMap[ean] ? productMap[ean] : "Unbekannt",
        menge: Number.isFinite(menge) ? menge : 1,
        preis: Number.isFinite(preis) ? preis : 0,
        serial: item.serial || null,
        datum: item.date || item.datum || nowISO.split("T")[0],
        created_at: nowISO,
      };
    });

    // 5️⃣ Insert in submission_items
    const { data, error } = await supabase
      .from("submission_items")
      .insert(cleanedItems)
      .select("item_id");

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json(
        { error: "Fehler beim Speichern der Verkaufsdaten", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${data?.length || 0} Verkaufszeilen erfolgreich gespeichert.`);

    return NextResponse.json({
      success: true,
      submission_id,
      inserted: data?.length || 0,
      message: `${data?.length || 0} Verkaufszeilen gespeichert.`,
    });
  } catch (err: any) {
    console.error("❌ API Fehler:", err);
    return NextResponse.json(
      { error: err?.message || "Unbekannter Serverfehler" },
      { status: 500 }
    );
  }
}
