import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

// ⚙️ Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ nur im Backend verwenden!
);

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchSonyImages(ean: string) {
  const searchUrl = `https://www.sony.ch/de/search?query=${ean}`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
  );

  console.log(`🔍 Suche nach EAN: ${ean}`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  // ✅ Cookie Banner akzeptieren
  try {
    await page.click("#onetrust-accept-btn-handler", { timeout: 3000 });
    console.log("✅ Cookie Banner akzeptiert");
  } catch {
    console.log("ℹ️ Kein Cookie Banner sichtbar");
  }

  // ➡️ Erstes Produkt öffnen
  let href;
  try {
    await page.waitForSelector(".product-card a", { timeout: 5000 });
    href = await page.$eval(".product-card a", (a) => a.href);
    console.log("➡️ Öffne Produktseite:", href);

    await page.goto(href, { waitUntil: "networkidle2" });
    await sleep(2000);
  } catch {
    console.error(`❌ Kein Produkt gefunden für EAN ${ean}`);
    await browser.close();
    return null;
  }

  // 📸 Bilder extrahieren
  const images = await page.evaluate(() => {
    const urls: string[] = [];
    document.querySelectorAll("img, source").forEach((el) => {
      const src = el.src || el.srcset || el.getAttribute("data-src");
      if (src && src.includes("sony.scene7.com/is/image/sonyglobalsolutions/")) {
        urls.push(src);
      }
    });
    return urls;
  });

  await browser.close();

  // Filter nur Produktbilder
  const filtered = [...new Set(images)].filter(
    (src) =>
      !src.toLowerCase().includes("logo") &&
      !src.toLowerCase().includes("footer") &&
      !src.toLowerCase().includes("icon") &&
      !src.toLowerCase().includes("payment")
  );

  if (filtered.length === 0) {
    console.log(`⚠️ Keine Bilder gefunden für EAN ${ean}`);
    return null;
  }

  const bestImage = filtered[0];
  console.log(`✅ Bild gefunden: ${bestImage}`);

  // 🔄 Supabase Update
  const { error } = await supabase
    .from("products")
    .update({ product_image_url: bestImage })
    .eq("ean", ean);

  if (error) {
    console.error("❌ Fehler beim Update in Supabase:", error.message);
    return null;
  }

  console.log(`📦 Supabase aktualisiert für EAN ${ean}`);
  return bestImage;
}

// ▶️ Test mit Beispiel-EAN
const ean = "27242930605";
fetchSonyImages(ean).then((img) => {
  if (img) {
    console.log("🎉 Fertig:", img);
  }
});
