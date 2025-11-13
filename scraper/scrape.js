// scraper/scrape.js
import puppeteer from "puppeteer";

// -----------------------------------------------------
// 🔧 Random User Agents (Anti-Bot)
// -----------------------------------------------------
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17 Safari/605.1.15"
];

// -----------------------------------------------------
// 🛒 SHOPS – echte Produktseiten oder Suche
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
// 💰 Shop-spezifische Price-Selectors
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: ".product__price-container .product__price",
  mediamarkt: ".Price price-format",
  interdiscount: "[data-testid='product-price']",
  fnac: ".f-priceBox-price",
  brack: ".product__price .amount",
  fust: ".price strong",
};

// -----------------------------------------------------
// 🔍 Extract number from any text
// -----------------------------------------------------
function extractPrice(text) {
  const regex = /(\d{2,5}[.,]\d{2})/;
  const match = text.replace(/\s/g, "").match(regex);
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
// -----------------------------------------------------
async function scrapeShop(browser, shop, ean) {
  const url = SHOPS[shop](ean);
  const selector = PRICE_SELECTORS[shop];
  const page = await browser.newPage();

  await page.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);

  await retry(async () => {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  });

  let price = null;

  if (selector) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const raw = await page.$eval(selector, (el) => el.innerText);
      price = extractPrice(raw);
    } catch {
      // fallback to text search
      const body = await page.content();
      price = extractPrice(body);
    }
  }

  if (!price) {
    // screenshot for debugging
    await page.screenshot({ path: `error_${shop}_${ean}.png` });
  }

  await page.close();
  return { price, url };
}

// -----------------------------------------------------
// 📦 Laden der Produkte aus Supabase
// -----------------------------------------------------
async function fetchProducts() {
  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/products?select=product_id,ean`,
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
  await fetch(`${process.env.SUPABASE_URL}/rest/v1/market_prices`, {
    method: "POST",
    headers: {
      apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(entry),
  });
}

// -----------------------------------------------------
// 🚀 Main Job
// -----------------------------------------------------
(async () => {
  console.log("🚀 Starting advanced Puppeteer scraping job...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const products = await fetchProducts();
  console.log(`📦 Loaded ${products.length} products`);

  for (const product of products) {
    const ean = product.ean;
    if (!ean) continue;

    for (const shop of Object.keys(SHOPS)) {
      try {
        console.log(`🛒 Scraping ${shop} for ${ean}`);

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

        console.log(`✔ ${shop}: ${price} CHF`);
      } catch (err) {
        console.log(`❌ Error for ${shop}/${ean}:`, err.message);
      }
    }
  }

  await browser.close();
  console.log("🏁 Done!");
})();
