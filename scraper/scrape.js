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
// 💰 Shop-spezifische Preis-Selectoren (mehrere Varianten)
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: [
    ".dg-product-price strong",
    ".sc-product-card__price strong",
  ],
  mediamarkt: [
    ".product-price .price__value",
    ".price .price__value",
  ],
  interdiscount: [
    "[data-test='product-price']",
    ".productTile .price",
  ],
  fnac: [
    ".f-priceBox-price",
    ".priceBox-price",
  ],
  brack: [
    ".product-price__price",
    ".price-tag strong",
  ],
  fust: [
    ".productTile .price strong",
    ".price strong",
  ],
};

// -----------------------------------------------------
// 🔍 Preis extrahieren
// -----------------------------------------------------
function extractPrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/\s/g, "");
  const match = cleaned.match(/(\d{2,5}[.,]\d{2})/);
  if (!match) return null;
  return parseFloat(match[1].replace(",", "."));
}

// -----------------------------------------------------
// 🧠 Retry (bis zu 3 Versuche)
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
  const url = SHOPS[shop](ean);
  const selectors = PRICE_SELECTORS[shop] || [];
  const page = await browser.newPage();

  await page.setUserAgent(
    USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  );

  // Bilder/Fonts blockieren (viel schneller & weniger Ban)
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

  // 1) Selector-Liste testen
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const raw = await page.$eval(selector, (el) => el.textContent || "");
      const extracted = extractPrice(raw);

      if (extracted != null) {
        console.log(`   ✅ ${shop} → Selector "${selector}" fand: ${extracted} CHF`);
        price = extracted;
        break;
      }
    } catch {
      continue;
    }
  }

  // 2) Fallback: Body-Scan
  if (!price) {
    const body = await page.content();
    const fallbackPrice = extractPrice(body);
    if (fallbackPrice) {
      console.log(
        `   ⚠️ ${shop} Fallback-Preis für EAN ${ean}: ${fallbackPrice} CHF`
      );
      price = fallbackPrice;
    } else {
      console.log(`   ❌ ${shop} – kein Preis gefunden für ${ean}`);
      await page.screenshot({
        path: `error_${shop}_${ean}.png`,
        fullPage: true,
      });
    }
  }

  await page.close();
  return { price, url };
}

// -----------------------------------------------------
// 📦 Produkte laden
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
    throw new Error(`Failed to fetch products: ${res.status}`);
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
      },
      body: JSON.stringify(entry),
    }
  );

  const updateJson = await updateRes.json().catch(() => []);

  // 2) Wenn keine existierende Zeile → INSERT
  if (!Array.isArray(updateJson) || updateJson.length === 0) {
    console.log(`   ↳ No row found → inserting new entry`);

    await fetch(`${process.env.SUPABASE_URL}/rest/v1/market_prices`, {
      method: "POST",
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
  }
}

// -----------------------------------------------------
// 🚀 Main Job
// -----------------------------------------------------
(async () => {
  console.log("🚀 Starting improved Puppeteer scraping job...");

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
