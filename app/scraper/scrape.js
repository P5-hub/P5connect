import puppeteer from "puppeteer";

const SHOPS = {
  digitec: (ean) => `https://www.digitec.ch/de/search?q=${ean}`,
  mediamarkt: (ean) => `https://www.mediamarkt.ch/de/search.html?query=${ean}`,
  interdiscount: (ean) => `https://www.interdiscount.ch/de/search?s=${ean}`,
  fnac: (ean) => `https://www.fnac.ch/SearchResult/ResultList.aspx?Search=${ean}`,
  brack: (ean) => `https://www.brack.ch/search?q=${ean}`,
  fust: (ean) => `https://www.fust.ch/de/searchresult.html?q=${ean}`,
};

// Extract first price-like value
function extractPrice(text) {
  const regex = /(\d{2,4}[.,]\d{2})/;
  const match = text.replace(/\s/g, "").match(regex);
  if (!match) return null;
  return parseFloat(match[1].replace(",", "."));
}

async function scrapeShop(page, shop, ean) {
  const url = SHOPS[shop](ean);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

  const content = await page.content();

  const price = extractPrice(content);
  return { price, url };
}

async function fetchProducts() {
  // Load products from Supabase
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/products?select=product_id,ean`, {
    headers: { apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
  });
  return res.json();
}

async function savePrice(entry) {
  await fetch(`${process.env.SUPABASE_URL}/rest/v1/market_prices`, {
    method: "POST",
    headers: {
      apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify(entry)
  });
}

(async () => {
  console.log("🚀 Starting Puppeteer scraping job...");

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
  );

  const products = await fetchProducts();
  console.log(`📦 Loaded ${products.length} products`);

  for (const product of products) {
    const ean = product.ean;
    if (!ean) continue;

    for (const shop of Object.keys(SHOPS)) {
      try {
        console.log(`🛒 Scraping ${shop} for ${ean}`);
        const { price, url } = await scrapeShop(page, shop, ean);

        await savePrice({
          shop,
          product_id: product.product_id,
          product_ean: ean,
          price,
          currency: "CHF",
          source_url: url,
          fetched_at: new Date().toISOString()
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
