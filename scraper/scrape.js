// scraper/scrape.js
import puppeteer from "puppeteer";

// -----------------------------------------------------
// 🔧 Random User Agents
// -----------------------------------------------------
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
];

// -----------------------------------------------------
// 🛒 Shop URLs
// -----------------------------------------------------
const SHOPS = {
  digitec: (ean) => `https://www.digitec.ch/de/search?q=${encodeURIComponent(ean)}`,
  mediamarkt: (ean) => `https://www.mediamarkt.ch/de/search.html?query=${encodeURIComponent(ean)}`,
  interdiscount: (ean) => `https://www.interdiscount.ch/de/search?s=${encodeURIComponent(ean)}`,
  fnac: (ean) => `https://www.fnac.ch/SearchResult/ResultList.aspx?Search=${encodeURIComponent(ean)}`,
  brack: (ean) => `https://www.brack.ch/search?q=${encodeURIComponent(ean)}`,
  fust: (ean) => `https://www.fust.ch/de/searchresult.html?q=${encodeURIComponent(ean)}`,
};

// -----------------------------------------------------
// 💰 Preis-Selektoren (final, geprüft – aus deinen Screenshots)
// -----------------------------------------------------
const PRICE_SELECTORS = {
  // DIGITEC
  digitec: [
    "button.yKEoTuX6",     // <button class="yKEoTuX6"><span>CHF</span> 2066.95 </button>
    ".dg-product-price strong",
    ".sc-product-card__price strong",
  ],

  // MEDIAMARKT
  mediamarkt: [
    "[data-test='branded-price-whole-value']", // PREIS z.B.: CHF 3799.
    ".sc-94eb08bc-0",                          // Klassenschlüssel aus Screenshot
    ".price__value",
  ],

  // INTERDISCOUNT
  interdiscount: [
    ".inline-flex",                 // z.B. 1’749.<sub>95</sub>
    "[data-test='product-price']",
  ],

  // FNAC
  fnac: [
    ".f-faPriceBox__price",         // z.B. 2'299.-
    ".userPrice",
  ],

  // BRACK
  brack: [
    ".bpaYB7Nv",                    // 639.00
    ".bpaOuDN",
  ],

  // FUST
  fust: [
    ".price__price",                // 599.90
    ".product-header__price",
  ],
};

// -----------------------------------------------------
// 🔍 Preis-Extraktion
// -----------------------------------------------------
function extractPrice(text) {
  if (!text) return null;

  let cleaned = text
    .toString()
    .replace(/\s+/g, "")
    .replace(/'/g, "")
    .replace(/CHF/gi, "")
    .replace(/Fr\./gi, "")
    .replace(/[–-]/g, "") // Entfernt .– oder .-
    .trim();

  // 1) finden von xx.xx oder xx,xx
  let m = cleaned.match(/(\d+[.,]\d{2})/);
  if (m) return parseFloat(m[1].replace(",", "."));

  // 2) reine Zahl 2–6 Stellen
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
      (nodes) => nodes.map((n) => n.textContent)
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
// 🧠 Retry
// -----------------------------------------------------
async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;  // <--- FIXED
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));
    }
  }
}



// -----------------------------------------------------
// 🕷 Shop-Scraper
// -----------------------------------------------------
async function scrapeShop(browser, shop, ean) {
  const url = SHOPS[shop](ean);
  const selectors = PRICE_SELECTORS[shop];

  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "media", "font"].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await retry(async () =>
    page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })
  );

  // 1) JSON-LD
  const jsonPrice = await extractJSONLDPrice(page);
  if (jsonPrice) {
    const p = extractPrice(String(jsonPrice));
    if (p) {
      await page.close();
      return { price: p, url };
    }
  }

  // 2) CSS Selektoren
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 4000 });

      const raw = await page.$eval(sel, (el) => el.innerText || el.textContent);
      const p = extractPrice(raw);

      if (p != null) {
        await page.close();
        return { price: p, url };
      }
    } catch {}
  }

  // 3) Body Scan
  const body = await page.content();
  const fallback = extractPrice(body);

  await page.close();
  return { price: fallback ?? null, url };
}

// -----------------------------------------------------
// 📦 Produkte laden
// -----------------------------------------------------
async function fetchProducts() {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/products?select=product_id,ean&ean=not.is.null`,
    {
      headers: { apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY },
    }
  );

  return res.json();
}

// -----------------------------------------------------
// 💾 Preis speichern
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

  const updated = await updateRes.json().catch(() => []);

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
// 🚀 Main Runner
// -----------------------------------------------------
(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const products = await fetchProducts();
  console.log(`📦 Loaded ${products.length} products.`);

  for (const product of products) {
    const ean = product.ean;
    console.log(`\n🔎 Produkt ${product.product_id} – EAN ${ean}`);

    for (const shop of Object.keys(SHOPS)) {
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
    }
  }

  await browser.close();
})();
