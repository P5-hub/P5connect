// scraper/scrape.js
import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fetch from "node-fetch";

puppeteerExtra.use(StealthPlugin());

// -----------------------------------------------------
// 🔧 User Agents
// -----------------------------------------------------
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const USER_AGENTS = [CHROME_UA];

// -----------------------------------------------------
// 🛒 Shops: URLs
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
// 💰 Preis-Selektoren (2025)
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: [
    "span[data-testid='product-price']",
    "[data-ga-label='product-price']",
    ".sc-8d3d65ab-0",
  ],
  mediamarkt: [
    "meta[itemprop='price']",
    "span[class*='Price_']",
  ],
  interdiscount: [
    "[data-test='product-price']",
    ".price__digit",
  ],
  fnac: [
    "span[itemprop='price']",
    ".userPrice",
  ],
  brack: [
    "span[data-testid='price']",
    ".product-price__price",
  ],
  fust: [
    ".price__price",
    ".product-detail-price",
    ".price strong",
  ],
};

// -----------------------------------------------------
// 🧠 Preis-Parser
// -----------------------------------------------------
function extractPrice(str) {
  if (!str) return null;

  let cleaned = str
    .replace(/[^\d.,-]/g, "")
    .replace(",", ".");

  let m;

  m = cleaned.match(/(\d+\.\d{2})/);
  if (m) return parseFloat(m[1]);

  m = cleaned.match(/(\d+)\.-/);
  if (m) return parseFloat(m[1]);

  m = cleaned.match(/(\d+)/);
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
        const j = JSON.parse(txt);
        const cand = [
          j?.offers?.price,
          j?.offers?.lowPrice,
          j?.price,
        ];
        for (const c of cand) {
          const price = extractPrice(String(c));
          if (price != null) return price;
        }
      } catch {}
    }
  } catch {}
  return null;
}

// -----------------------------------------------------
// Retry
// -----------------------------------------------------
async function retry(fn, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw last;
}

// -----------------------------------------------------
// Generic Shop Scraper
// -----------------------------------------------------
async function scrapeShop(browser, shop, ean) {
  const url = SHOPS[shop](ean);
  const selectors = PRICE_SELECTORS[shop];

  const page = await browser.newPage();
  await page.setUserAgent(CHROME_UA);

  await page.setExtraHTTPHeaders({
    "accept-language": "de-CH,de;q=0.9",
  });

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "font", "media"].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await retry(() =>
    page.goto(url, { waitUntil: "domcontentloaded", timeout: 55000 })
  );

  const jsonPrice = await extractJSONLDPrice(page);
  if (jsonPrice != null) {
    await page.close();
    return { price: jsonPrice, url };
  }

  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 2000 });
      const raw = await page.$eval(sel, (el) => el.textContent);
      const p = extractPrice(raw);
      if (p != null) {
        await page.close();
        return { price: p, url };
      }
    } catch {}
  }

  const fallback = extractPrice(await page.content());

  await page.close();
  return { price: fallback ?? null, url };
}

// -----------------------------------------------------
// Digitec Scraper
// -----------------------------------------------------
async function scrapeDigitec(browser, ean) {
  const url = SHOPS.digitec(ean);

  const page = await browser.newPage();
  await page.setUserAgent(CHROME_UA);

  await retry(() =>
    page.goto(url, { waitUntil: "networkidle2", timeout: 55000 })
  );

  const json = await extractJSONLDPrice(page);
  if (json != null) {
    await page.close();
    return { price: json, url };
  }

  for (const sel of PRICE_SELECTORS.digitec) {
    try {
      await page.waitForSelector(sel, { timeout: 2000 });
      const raw = await page.$eval(sel, (el) => el.textContent);
      const p = extractPrice(raw);
      if (p != null) {
        await page.close();
        return { price: p, url };
      }
    } catch {}
  }

  await page.close();

  // HTTP fallback
  const res = await fetch(url, {
    headers: { "user-agent": CHROME_UA },
  });
  const html = await res.text();
  const p = extractPrice(html);

  return { price: p ?? null, url };
}

// -----------------------------------------------------
// Produkte holen
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
// Preis speichern
// -----------------------------------------------------
async function savePrice(entry) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/market_prices`;

  const update = await fetch(
    `${url}?shop=eq.${entry.shop}&product_ean=eq.${entry.product_ean}`,
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

  try {
    const updated = await update.json();
    if (Array.isArray(updated) && updated.length > 0) return;
  } catch {}

  await fetch(url, {
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
// MAIN
// -----------------------------------------------------
(async () => {
  console.log("🚀 Starting market price scraper...");

  const browser = await puppeteerExtra.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-http2",
      "--disable-gpu",
    ],
  });

  try {
    const products = await fetchProducts();
    console.log(`📦 Loaded ${products.length} products`);

    for (const p of products) {
      console.log(`\n🔎 Produkt ${p.product_id} (EAN ${p.ean})`);

      for (const shop of Object.keys(SHOPS)) {
        console.log(`🛒 Scraping ${shop}...`);

        try {
          const result =
            shop === "digitec"
              ? await scrapeDigitec(browser, p.ean)
              : await scrapeShop(browser, shop, p.ean);

          await savePrice({
            shop,
            product_id: p.product_id,
            product_ean: p.ean,
            price: result.price,
            currency: "CHF",
            source_url: result.url,
            fetched_at: new Date().toISOString(),
          });

          console.log(`   ✔ ${shop}: ${result.price} CHF`);
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
