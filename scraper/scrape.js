// scraper/scrape.js
import puppeteer from "puppeteer";

// -----------------------------------------------------
// 🔧 Random User Agents (Anti-Bot)
// -----------------------------------------------------
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
];

// -----------------------------------------------------
// 🛒 SHOPS – Such- oder Produkt-URLs
// -----------------------------------------------------
const SHOPS = {
  digitec: (ean) =>
    `https://www.digitec.ch/de/search?q=${encodeURIComponent(ean)}`,
  mediamarkt: (ean) =>
    `https://www.mediamarkt.ch/de/search.html?query=${encodeURIComponent(
      ean
    )}`,
  interdiscount: (ean) =>
    `https://www.interdiscount.ch/de/search?s=${encodeURIComponent(ean)}`,
  fnac: (ean) =>
    `https://www.fnac.ch/SearchResult/ResultList.aspx?Search=${encodeURIComponent(
      ean
    )}`,
  brack: (ean) => `https://www.brack.ch/search?q=${encodeURIComponent(ean)}`,
  fust: (ean) =>
    `https://www.fust.ch/de/searchresult.html?q=${encodeURIComponent(ean)}`,
};

// -----------------------------------------------------
// 💰 Shop-spezifische Preis-Selectoren (mehrere Varianten)
// -----------------------------------------------------
const PRICE_SELECTORS = {
  // Klassen basieren auf deinem aktuellen Digitec-HTML
  digitec: [
    "button.yKEoTuX6", // Hauptpreis-Button: <button class="yKEoTuX6"><span>CHF</span>3520.–</button>
    "span.yAa8UXh + *", // Knoten direkt hinter dem CHF-Span
    ".product__price",
    ".dg-product-price strong",
    ".sc-product-card__price strong",
  ],
  mediamarkt: [
    ".price .price__value",
    ".ProductPrice_productPrice__value",
    "[itemprop=price]",
  ],
  interdiscount: [
    "[data-test='product-price']",
    ".productTile .price",
    ".price__digit",
  ],
  fnac: [".f-priceBox-price", ".priceBox-price", ".userPrice"],
  brack: [".product-price__price", ".Price_price__value", ".price-tag strong"],
  fust: [".productTile .price strong", ".product-detail-price strong", ".price strong"],
};

// -----------------------------------------------------
// 🔍 Preis extrahieren (sehr tolerant)
// erkennt z.B. 3520.–, 1’299.–, CHF 249.–, 249.90, 249,90
// -----------------------------------------------------
function extractPrice(text) {
  if (!text) return null;

  let cleaned = text
    .toString()
    .replace(/\s+/g, "")
    .replace(/'/g, "") // 1'299.– -> 1299.–
    .replace(/CHF/gi, "")
    .replace(/Fr\./gi, "")
    .trim();

  // 1) 3520.– oder 1299.–
  let m = cleaned.match(/(\d+)\.–/);
  if (m) return parseFloat(m[1] + ".00");

  // 2) 3520.- oder 1299.- (falls Shop - statt – nutzt)
  m = cleaned.match(/(\d+)\.-/);
  if (m) return parseFloat(m[1] + ".00");

  // 3) 1234.56 oder 1234,56
  m = cleaned.match(/(\d+[.,]\d{2})/);
  if (m) return parseFloat(m[1].replace(",", "."));

  // 4) reine Zahl 2–6 Stellen (z.B. 999 oder 1299)
  m = cleaned.match(/(\d{2,6})/);
  if (m) return parseFloat(m[1]);

  return null;
}

// -----------------------------------------------------
// 🧠 JSON-LD Price Extractor (für alle Shops)
// -----------------------------------------------------
async function extractJSONLDPrice(page) {
  try {
    const scripts = await page.$$eval(
      'script[type="application/ld+json"]',
      (nodes) => nodes.map((n) => n.textContent)
    );

    for (const txt of scripts) {
      try {
        const json = JSON.parse(txt);

        // Direktes Offer-Objekt
        if (json?.offers?.price) return json.offers.price;
        if (json?.offers?.lowPrice) return json.offers.lowPrice;
        if (json?.price) return json.price;

        // JSON-LD als Array
        if (Array.isArray(json)) {
          for (const item of json) {
            if (item?.offers?.price) return item.offers.price;
            if (item?.offers?.lowPrice) return item.offers.lowPrice;
            if (item?.price) return item.price;
          }
        }
      } catch {
        // JSON-Parse-Fehler ignorieren
      }
    }
  } catch {}

  return null;
}

// -----------------------------------------------------
// 🧠 Retry (bis zu 3 Versuche mit Backoff)
// -----------------------------------------------------
async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
    }
  }
}

// -----------------------------------------------------
// 🕷 Shop scrapen
// -----------------------------------------------------
async function scrapeShop(browser, shop, ean) {
  const buildUrl = SHOPS[shop];
  if (!buildUrl) {
    console.log(`⚠️ Unknown shop: ${shop}`);
    return { price: null, url: null };
  }

  const url = buildUrl(ean);
  const selectors = PRICE_SELECTORS[shop] || [];
  const page = await browser.newPage();

  await page.setUserAgent(
    USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  );

  // Bilder/Fonts blocken → schneller & weniger auffällig
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "media", "font"].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await retry(async () => {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  });

  let price = null;

  // 1) JSON-LD first
  const jsonPrice = await extractJSONLDPrice(page);
  if (jsonPrice != null) {
    price = extractPrice(String(jsonPrice));
    if (price != null) {
      console.log(`   📦 JSON-LD → ${price} CHF`);
      await page.close();
      return { price, url };
    }
  }

  // 2) CSS-Selector nacheinander probieren
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 4000 });
      const raw = await page.$eval(
        sel,
        (el) => el.innerText || el.textContent || ""
      );
      const p = extractPrice(raw);
      if (p != null) {
        price = p;
        console.log(`   🔍 Selector ${sel} → ${price} CHF`);
        await page.close();
        return { price, url };
      } else {
        console.log(
          `   ⚠️ Selector ${sel} gefunden, aber kein Preis extrahiert`
        );
      }
    } catch {
      // Selector nicht gefunden → nächster
      continue;
    }
  }

  // 3) Fallback: Body-Scan (nur als letztes Mittel)
  const body = await page.content();
  const fallback = extractPrice(body);

  if (fallback != null) {
    price = fallback;
    console.log(`   ⚠️ Fallback price → ${price} CHF (prüfen!)`);
  } else {
    console.log(`   ❌ No price found for ${shop}/${ean}`);
  }

  await page.close();
  return { price, url };
}

// -----------------------------------------------------
// 📦 Produkte laden (nur mit gesetzter EAN)
// -----------------------------------------------------
async function fetchProducts() {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/products?select=product_id,ean&ean=not.is.null`,
    {
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch products: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// -----------------------------------------------------
// 💾 Preis speichern (Upsert: Update → Insert)
// -----------------------------------------------------
async function savePrice(entry) {
  // 1) UPDATE versuchen
  const updateRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/market_prices?shop=eq.${entry.shop}&product_ean=eq.${entry.product_ean}`,
    {
      method: "PATCH",
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(entry),
    }
  );

  let updatedRows = [];
  try {
    updatedRows = await updateRes.json();
  } catch {
    updatedRows = [];
  }

  if (Array.isArray(updatedRows) && updatedRows.length > 0) {
    // ✔ Update hat geklappt
    return;
  }

  // 2) Wenn keine bestehende Zeile → INSERT
  console.log(`   ↳ No row found → inserting new entry`);

  const insertRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/market_prices`,
    {
      method: "POST",
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    }
  );

  if (!insertRes.ok) {
    const txt = await insertRes.text().catch(() => "");
    console.error(
      `   ❌ Insert failed (${insertRes.status}): ${insertRes.statusText} ${txt}`
    );
  }
}

// -----------------------------------------------------
// 🚀 Main Job
// -----------------------------------------------------
(async () => {
  console.log("🚀 Starting improved Puppeteer scraping job...");

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    const products = await fetchProducts();
    console.log(`📦 Loaded ${products.length} products.`);

    for (const product of products) {
      const ean = product.ean;
      if (!ean) continue;

      console.log(`\n🔎 Produkt ${product.product_id} – EAN ${ean}`);

      for (const shop of Object.keys(SHOPS)) {
        try {
          console.log(`🛒 Scraping ${shop}...`);
          const { price, url } = await scrapeShop(browser, shop, ean);

          await savePrice({
            shop,
            product_id: product.product_id,
            product_ean: ean,
            price,
            currency: "CHF",
            source_url: url,
            fetched_at: new Date().toISOString(),
          });

          console.log(`   ✔ Saved: ${shop} → ${price} CHF`);
        } catch (err) {
          console.log(`   ❌ Error at ${shop}/${ean}:`, err.message);
        }
      }
    }

    console.log("\n🏁 Done!");
  } catch (err) {
    console.error("💥 Fatal scraper error:", err);
  } finally {
    await browser.close();
  }
})();
