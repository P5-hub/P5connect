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
// 🛒 SHOPS – Suchseiten
// -----------------------------------------------------
const SHOPS = {
  digitec: ean => `https://www.digitec.ch/de/search?q=${encodeURIComponent(ean)}`,
  mediamarkt: ean => `https://www.mediamarkt.ch/de/search.html?query=${encodeURIComponent(ean)}`,
  interdiscount: ean => `https://www.interdiscount.ch/de/search?s=${encodeURIComponent(ean)}`,
  fnac: ean => `https://www.fnac.ch/SearchResult/ResultList.aspx?Search=${encodeURIComponent(ean)}`,
  brack: ean => `https://www.brack.ch/search?q=${encodeURIComponent(ean)}`,
  fust: ean => `https://www.fust.ch/de/searchresult.html?q=${encodeURIComponent(ean)}`,
};

// -----------------------------------------------------
// 💰 Preis-Selektoren (alle durch Screenshots bestätigt)
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: [
    "button.yKEoTuX6",          // Button mit CHF 2066.95
    "strong.yKEoTuX6",          // alternative Struktur
    ".product__price",
  ],
  mediamarkt: [
    ".sc-94eb08bc-0.kjXYoV",    // CHF 3799.–
    ".price__value",
    "[itemprop=price]",
  ],
  interdiscount: [
    ".inline-flex",             // 1’749.- + <sub>95</sub>
    "[data-test='product-price']",
    ".price__digit",
  ],
  fnac: [
    ".f-faPriceBox__price",     // 2'299.-
    ".userPrice",
    ".priceBox-price",
  ],
  brack: [
    ".bpaYB7Nv",                // 639.00
    ".product-price__price",
  ],
  fust: [
    ".price__price",            // 599.90
    ".product-detail-price",
    ".price strong",
  ],
};

// -----------------------------------------------------
// 🔍 Preis extrahieren (sehr tolerant)
// -----------------------------------------------------
function extractPrice(text) {
  if (!text) return null;

  let cleaned = text
    .toString()
    .replace(/\s+/g, "")
    .replace(/CHF/gi, "")
    .replace(/Fr\./gi, "")
    .replace(/'/g, "")
    .replace(/–/g, "-")
    .trim();

  // 3520.– oder 1299.–
  let m = cleaned.match(/(\d+)\.-/);
  if (m) return parseFloat(m[1]);

  // 3520.- oder 1299.- oder 1299-
  m = cleaned.match(/(\d+)-/);
  if (m) return parseFloat(m[1]);

  // 1234.56 oder 1234,56
  m = cleaned.match(/(\d+[.,]\d{2})/);
  if (m) return parseFloat(m[1].replace(",", "."));

  // reine Zahl (2–6 Stellen)
  m = cleaned.match(/(\d{2,6})/);
  if (m) return parseFloat(m[1]);

  return null;
}

// -----------------------------------------------------
// 🧠 JSON-LD Price Extractor
// -----------------------------------------------------
async function extractJSONLDPrice(page) {
  try {
    const scripts = await page.$$eval(
      'script[type="application/ld+json"]',
      nodes => nodes.map(n => n.textContent)
    );

    for (const txt of scripts) {
      try {
        const json = JSON.parse(txt);

        if (json?.offers?.price) return json.offers.price;
        if (json?.offers?.lowPrice) return json.offers.lowPrice;
        if (json?.price) return json.price;

        if (Array.isArray(json)) {
          for (const item of json) {
            if (item?.offers?.price) return item.offers.price;
            if (item?.offers?.lowPrice) return item.offers.lowPrice;
            if (item?.price) return item.price;
          }
        }
      } catch {}
    }
  } catch {}

  return null;
}

// -----------------------------------------------------
// 🧠 Retry Helper
// -----------------------------------------------------
async function retry(fn, tries = 3) {
  let lastErr = null;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
    }
  }
  throw lastErr;
}

// -----------------------------------------------------
// 🕷 Shop scraping
// -----------------------------------------------------
async function scrapeShop(browser, shop, ean) {
  const url = SHOPS[shop](ean);
  const selectors = PRICE_SELECTORS[shop];

  const page = await browser.newPage();

  await page.setUserAgent(
    USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  );

  // Anti-Bot verbessern
  await page.setExtraHTTPHeaders({
    "accept-language": "de-CH,de;q=0.9",
  });

  // HTTP/2 / Digitec Fix
  await page.setRequestInterception(true);
  page.on("request", req => {
    if (req.resourceType() === "image" || req.resourceType() === "font")
      req.abort();
    else req.continue();
  });

  // Navigation robust
  await retry(async () => {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 65000,
    });
  });

  // Digitec: manchmal leitet Suche weiter → auf Produktseite warten
  if (shop === "digitec") {
    try {
      await page.waitForSelector("button.yKEoTuX6", { timeout: 3000 });
    } catch {}
  }

  // 1) JSON-LD
  let jsonPrice = await extractJSONLDPrice(page);
  if (jsonPrice) {
    let p = extractPrice(String(jsonPrice));
    if (p != null) {
      await page.close();
      return { price: p, url };
    }
  }

  // 2) Selektoren testen
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 3000 });
      const raw = await page.$eval(sel, el => el.innerText || el.textContent);
      const p = extractPrice(raw);
      if (p != null) {
        await page.close();
        return { price: p, url };
      }
    } catch {}
  }

  // 3) Body-Fallback
  const fallbackText = await page.content();
  const fallbackPrice = extractPrice(fallbackText);

  await page.close();

  return {
    price: fallbackPrice ?? null,
    url,
  };
}

// -----------------------------------------------------
// 📦 Produkte von Supabase laden
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
  return res.json();
}

// -----------------------------------------------------
// 💾 Preise speichern (Update oder Insert)
// -----------------------------------------------------
async function savePrice(entry) {
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

  let updated = [];
  try {
    updated = await updateRes.json();
  } catch {}

  if (Array.isArray(updated) && updated.length > 0) return;

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

// -----------------------------------------------------
// 🚀 MAIN
// -----------------------------------------------------
(async () => {
  console.log("🚀 Starting market price scraper...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const products = await fetchProducts();
    console.log(`📦 Loaded ${products.length} products`);

    for (const p of products) {
      console.log(`\n🔎 Produkt ${p.product_id} (EAN ${p.ean})`);
      for (const shop of Object.keys(SHOPS)) {
        console.log(`🛒 Scraping ${shop}...`);
        try {
          const { price, url } = await scrapeShop(browser, shop, p.ean);

          await savePrice({
            shop,
            product_id: p.product_id,
            product_ean: p.ean,
            price,
            currency: "CHF",
            source_url: url,
            fetched_at: new Date().toISOString(),
          });

          console.log(`   ✔ Saved ${shop}: ${price} CHF`);
        } catch (err) {
          console.log(`   ❌ ERROR ${shop}: ${err.message}`);
        }
      }
    }

    console.log("🏁 DONE");
  } catch (err) {
    console.error("💥 Fatal Error:", err);
  } finally {
    await browser.close();
  }
})();
