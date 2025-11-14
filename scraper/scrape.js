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
  digitec: (ean) => `https://www.digitec.ch/de/search?q=${ean}`,
  mediamarkt: (ean) => `https://www.mediamarkt.ch/de/search.html?query=${ean}`,
  interdiscount: (ean) => `https://www.interdiscount.ch/de/search?s=${ean}`,
  fnac: (ean) => `https://www.fnac.ch/SearchResult/ResultList.aspx?Search=${ean}`,
  brack: (ean) => `https://www.brack.ch/search?q=${ean}`,
  fust: (ean) => `https://www.fust.ch/de/searchresult.html?q=${ean}`,
};

// -----------------------------------------------------
// 💰 Shop-spezifische Price-Selectors (mehrere pro Shop)
// → Das sind Heuristiken, können bei Bedarf angepasst werden
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: [
    ".dg-product-price strong",          // Produkt-Detailseite
    ".sc-product-card__price strong",    // Suchresultat-Karten
  ],
  mediamarkt: [
    ".product-price .price__value",      // Detailseite
    ".price .price__value",              // Fallback
  ],
  interdiscount: [
    "[data-test='product-price']",       // Detailseite (React)
    ".productTile .price",               // Suchkarte
  ],
  fnac: [
    ".f-priceBox-price",
    ".priceBox-price",
  ],
  brack: [
    ".product-price__price",             // Detailseite
    ".price-tag strong",                 // Fallback
  ],
  fust: [
    ".productTile .price strong",        // Karte
    ".price strong",
  ],
};

// -----------------------------------------------------
// 🔍 Extract number from any text (z.B. "CHF 499.00")
// -----------------------------------------------------
function extractPrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/\s/g, "");
  const regex = /(\d{2,5}[.,]\d{2})/;
  const match = cleaned.match(regex);
  if (!match) return null;
  return parseFloat(match[1].replace(",", "."));
}

// -----------------------------------------------------
// 🧠 Retry wrapper (3 attempts)
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
// 🕷 Scrape Shop
// 1. Seite laden
// 2. Mehrere Selector probieren
// 3. Fallback: Body-Scan + Logging
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

  // etwas weniger auffällig: keine Bilder
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "media", "font"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await retry(async () => {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  });

  let price = null;

  // 1) Versuche die Liste der bekannten Selector nacheinander
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const raw = await page.$eval(
        selector,
        (el) => el.textContent || el.innerText || ""
      );
      price = extractPrice(raw);
      if (price != null) {
        console.log(`   ✅ ${shop} selector match "${selector}" → ${price} CHF`);
        break;
      } else {
        console.log(
          `   ⚠️ ${shop} selector "${selector}" gefunden, aber kein Preis extrahiert`
        );
      }
    } catch {
      // Selector nicht gefunden → nächsten probieren
      continue;
    }
  }

  // 2) Fallback: Body-Scan – aber mit Warnung
  if (!price) {
    const body = await page.content();
    const fallbackPrice = extractPrice(body);
    if (fallbackPrice) {
      console.log(
        `   ⚠️ ${shop} Fallback-Preis aus Body für EAN ${ean}: ${fallbackPrice} CHF (prüfen!)`
      );
      price = fallbackPrice;
    } else {
      console.log(
        `   ❌ ${shop} – kein Preis gefunden für EAN ${ean}, Screenshot wird gespeichert`
      );
      await page.screenshot({ path: `error_${shop}_${ean}.png`, fullPage: true });
    }
  }

  await page.close();
  return { price, url };
}

// -----------------------------------------------------
// 📦 Laden der Produkte aus Supabase
// → nur EANs, die gesetzt sind
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
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json;
}

// -----------------------------------------------------
// 💾 Preis speichern
// -----------------------------------------------------
async function savePrice(entry) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/market_prices`, {
    method: "POST",
    headers: {
      apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(entry),
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("❌ Save error:", res.status, text);
  }
}

// -----------------------------------------------------
// 🚀 Main Job
// -----------------------------------------------------
(async () => {
  console.log("🚀 Starting Puppeteer market price scraping job...");

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
    console.log(`📦 Loaded ${products.length} products from Supabase`);

    for (const product of products) {
      const ean = product.ean;
      if (!ean) continue;

      console.log(`\n🔎 Produkt ${product.product_id} – EAN ${ean}`);

      for (const shop of Object.keys(SHOPS)) {
        try {
          console.log(`🛒  Scraping ${shop} for EAN ${ean}`);
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
          console.log(`   ❌ Error for ${shop}/${ean}:`, err.message);
        }
      }
    }

    console.log("\n🏁 Done!");
  } catch (err) {
    console.error("💥 Fatal error in scraping job:", err);
  } finally {
    await browser.close();
  }
})();
