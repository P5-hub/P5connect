import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* --------------------------------------------------
   🔐 Supabase Service Client (SERVER ONLY)
-------------------------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "sofortrabatt-invoices";

/* --------------------------------------------
   🧠 Rollen-Erkennung
-------------------------------------------- */
function getProductRole(item: any): "tv" | "soundbar" | "sub" | null {
  const c = (item.category || item.gruppe || "").toLowerCase();
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

  if (tvCount !== 1) throw new Error("Genau ein TV ist erforderlich");
  if (soundbarCount > 1 || subCount > 1)
    throw new Error("Maximal eine Soundbar und ein Subwoofer erlaubt");

  let rabattLevel: 1 | 2 | 3 = 1;
  if (soundbarCount === 1 && subCount === 1) rabattLevel = 3;
  else if (soundbarCount === 1) rabattLevel = 2;

  const tvItem = items.find((i) => getProductRole(i) === "tv");
  if (!tvItem) throw new Error("TV nicht gefunden");

  let rabattBetrag = 0;
  if (rabattLevel === 1) rabattBetrag = Number(tvItem.sofortrabatt_amount || 0);
  if (rabattLevel === 2)
    rabattBetrag = Number(tvItem.sofortrabatt_double_amount || 0);
  if (rabattLevel === 3)
    rabattBetrag = Number(tvItem.sofortrabatt_triple_amount || 0);

  return { rabattLevel, rabattBetrag };
}

/* --------------------------------------------
   🚀 POST Handler (FormData + Multi Upload)
-------------------------------------------- */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const dealer_id = Number(formData.get("dealer_id"));
    const itemsRaw = formData.get("items");

    // ✅ Multi Files: cart sendet "files"
    const filesRaw = formData.getAll("files") as unknown[];

    if (!dealer_id || !itemsRaw) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const items = JSON.parse(itemsRaw as string);
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items müssen ein Array sein" }, { status: 400 });
    }

    const files = filesRaw
      .filter((f) => f && typeof f !== "string")
      .map((f) => f as File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Bitte mindestens eine Rechnung hochladen" }, { status: 400 });
    }

    // 1) Upload alle Files
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const safeName = file.name.replace(/[^\w.\-()]+/g, "_");
      const filePath = `${dealer_id}/sofort-${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        // optional cleanup: bereits hochgeladene löschen
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(BUCKET).remove(uploadedPaths);
        }
        throw uploadError;
      }

      uploadedPaths.push(filePath);
    }

    // 2) Rabatt berechnen
    const { rabattLevel, rabattBetrag } = calculateRabatt(items);

    // 3) Claim speichern
    const { error: insertError } = await supabase.from("sofortrabatt_claims").insert([
      {
        dealer_id,
        rabatt_level: rabattLevel,
        rabatt_betrag: rabattBetrag,

        // ✅ WICHTIG: wir speichern jetzt ALLE Paths als JSON string
        invoice_file_url: JSON.stringify(uploadedPaths),

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
      // Cleanup Storage bei DB Fehler
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
      throw insertError;
    }

    return NextResponse.json({ success: true, files: uploadedPaths });
  } catch (e: any) {
    console.error("❌ Sofortrabatt Error:", e);
    return NextResponse.json({ error: e.message || "Unbekannter Fehler" }, { status: 400 });
  }
}