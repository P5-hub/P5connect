import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* --------------------------------------------------
   🔐 Supabase Service Client (SERVER ONLY)
-------------------------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* --------------------------------------------
   🧠 Rollen-Erkennung
-------------------------------------------- */
function getProductRole(item: any): "tv" | "soundbar" | "sub" | null {
  const c = (item.category || "").toLowerCase();
  if (c.includes("tv")) return "tv";
  if (c.includes("soundbar")) return "soundbar";
  if (c.includes("sub")) return "sub";
  return null;
}

/* --------------------------------------------
   💰 Rabattberechnung
-------------------------------------------- */
function calculateRabatt(items: any[]) {
  const roles = items.map(getProductRole);

  const tvCount = roles.filter((r) => r === "tv").length;
  const soundbarCount = roles.filter((r) => r === "soundbar").length;
  const subCount = roles.filter((r) => r === "sub").length;

  if (tvCount !== 1) {
    throw new Error("Genau ein TV ist erforderlich");
  }
  if (soundbarCount > 1 || subCount > 1) {
    throw new Error("Maximal eine Soundbar und ein Subwoofer erlaubt");
  }

  let rabattLevel: 1 | 2 | 3 = 1;
  if (soundbarCount === 1 && subCount === 1) rabattLevel = 3;
  else if (soundbarCount === 1) rabattLevel = 2;

  const tvItem = items.find((i) => getProductRole(i) === "tv");
  if (!tvItem) throw new Error("TV nicht gefunden");

  let rabattBetrag = 0;
  if (rabattLevel === 1)
    rabattBetrag = Number(tvItem.sofortrabatt_amount || 0);
  if (rabattLevel === 2)
    rabattBetrag = Number(tvItem.sofortrabatt_double_amount || 0);
  if (rabattLevel === 3)
    rabattBetrag = Number(tvItem.sofortrabatt_triple_amount || 0);

  return { rabattLevel, rabattBetrag };
}

/* --------------------------------------------
   🚀 POST Handler (FormData + Upload)
-------------------------------------------- */
export async function POST(req: Request) {
  try {
    console.log("🔥 SOFORTRABATT ROUTE HIT");

    const formData = await req.formData();

    const dealer_id = Number(formData.get("dealer_id"));
    const itemsRaw = formData.get("items");
    const invoice = formData.get("invoice") as File | null;

    console.log("dealer_id:", dealer_id);
    console.log("items raw:", itemsRaw);
    console.log("invoice:", invoice);

    if (!dealer_id || !itemsRaw || !invoice) {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    const items = JSON.parse(itemsRaw as string);
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items müssen ein Array sein" },
        { status: 400 }
      );
    }

    /* --------------------------------------------------
       📎 Datei korrekt in Buffer umwandeln (WICHTIG!)
    -------------------------------------------------- */
    const arrayBuffer = await invoice.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📦 Upload size:", buffer.length);

    const filePath = `${dealer_id}/sofort-${Date.now()}-${invoice.name}`;

    const { error: uploadError } = await supabase.storage
      .from("sofortrabatt-invoices")
      .upload(filePath, buffer, {
        contentType: invoice.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      throw uploadError;
    }

    /* --------------------------------------------------
       💰 Rabatt berechnen
    -------------------------------------------------- */
    const { rabattLevel, rabattBetrag } = calculateRabatt(items);

    /* --------------------------------------------------
       🧾 Claim speichern
    -------------------------------------------------- */
    const { error: insertError } = await supabase
      .from("sofortrabatt_claims")
      .insert([
        {
          dealer_id,
          rabatt_level: rabattLevel,
          rabatt_betrag: rabattBetrag,
          invoice_file_url: filePath,
          status: "pending",
          products: items.map((i) => ({
            product_name: i.product_name,
            ean: i.ean,
            category: i.category || i.gruppe,
            qty: 1,
          })),
          comment: `Rabatt-Level ${rabattLevel}`,
        },
      ]);

    if (insertError) {
      console.error("❌ DB insert error:", insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("❌ Sofortrabatt Error:", e);
    return NextResponse.json(
      { error: e.message || "Unbekannter Fehler" },
      { status: 400 }
    );
  }
}
