import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
console.log("🔍 SUPABASE_URL =", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("🔍 SERVICE_ROLE_KEY vorhanden?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("🔑 Key starts with:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0,10));



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // wichtig: Service Role für write
);

export async function scrapeAndCacheSony(sku) {
  const url = `https://www.sony.ch/de/bravia/products/bravia-9?sku=${sku}`;
  console.log("Lade:", url);

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }, // gegen 403
  });
  if (!res.ok) throw new Error(`Fehler beim Abruf: ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);

  const name = $("h1, .product-title").first().text().trim() || "Unbekannt";
  const description = $(".product-description, .intro-text").first().text().trim();

  let imageUrl = $("img").first().attr("src") || null;
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrl = "https://www.sony.ch" + imageUrl;
  }

  // In Supabase speichern (upsert = update oder insert)
  await supabase.from("sony_product_data").upsert({
    sku,
    name,
    description,
    image_url: imageUrl || "/fallback-logo.png",
    updated_at: new Date(),
  });

  return { sku, name, description, imageUrl };
}
export { scrapeAndCacheSony as scrapeSonyProduct };
