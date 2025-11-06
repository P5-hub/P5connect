import "dotenv/config";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔎 Hilfsfunktion: Produktinfos scrapen
async function scrapeSonyProduct(ean) {
  const url = `https://www.sony.ch/de/bravia/products/bravia-9?sku=${ean}`;
  console.log(`🔎 Scrape ${url}`);

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.error(`❌ Fehler beim Abruf ${ean}:`, res.status);
    return null;
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Name
  const name = $("h1, .product-title").first().text().trim() || null;

  // Beschreibung
  const description = $(".product-description, .intro-text").first().text().trim() || null;

  // Features
  const features = [];
  $(".feature, .product-feature").each((i, el) => {
    const title = $(el).find("h3, .feature-title").text().trim();
    const desc = $(el).find("p").text().trim();
    if (title || desc) {
      features.push({ title, desc });
    }
  });

  // Erstes Bild
  let img = $("img").first().attr("src");
  if (img && !img.startsWith("http")) {
    img = "https://www.sony.ch" + img;
  }

  return { name, description, features, image: img, url };
}

// 🔧 Hilfsfunktion: Upload zu Supabase Storage
async function uploadToStorage(ean, imageUrl) {
  if (!imageUrl) return null;
  console.log(`⬆️ Lade Bild für ${ean} hoch: ${imageUrl}`);

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error(`❌ Konnte Bild nicht laden: ${res.status}`);
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const fileName = `${ean}.jpg`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("❌ Upload-Fehler:", error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error("❌ Upload Exception:", err);
    return null;
  }
}

// 🚀 Hauptjob
async function run() {
  // 1. Hole alle EANs aus products
  const { data: products, error } = await supabase.from("products").select("ean");
  if (error) {
    console.error("❌ Fehler products:", error.message);
    return;
  }

  for (const p of products) {
    const ean = p.ean;
    console.log(`\n➡️ Verarbeite ${ean}`);

    // 2. Scrape Produktinfos
    const productData = await scrapeSonyProduct(ean);
    if (!productData) {
      console.log(`⚠️ Keine Infos für ${ean}`);
      continue;
    }

    // 3. Bild in Supabase hochladen
    const publicUrl = await uploadToStorage(ean, productData.image);

    // 4. DB updaten – sku = ean
    const { error: upsertError } = await supabase.from("sony_product_data").upsert(
      {
        ean,
        sku: ean, // 👈 Pflichtfeld: setzen wir gleich = ean
        name: productData.name,
        description: productData.description,
        features: productData.features,
        image_url: publicUrl,
        updated_at: new Date(),
      },
      { onConflict: "ean" }
    );

    if (upsertError) {
      console.error("❌ Upsert-Fehler:", upsertError.message);
    } else {
      console.log(`✅ Gespeichert: ${ean} (${productData.name})`);
    }
  }
}

run().then(() => console.log("🎉 Fertig!"));
