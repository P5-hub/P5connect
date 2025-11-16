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
// (aktuell alle als Suche implementiert)
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
// 💰 Shop-spezifische Preis-Selectoren (Heuristik)
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: [
    ".dg-product-price strong",
    ".product__price-container .product__price",
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
// 🔍 Preis aus Text extrahieren – NUR, wenn CHF/Fr vorkommt
// -----------------------------------------------------
function extractPriceFromText(text) {
  if (!text) return null;

  const cleaned = text.replace(/\s+/g, " ");

  // 1) CHF / Fr.- Varianten
  const currencyRegex = /(?:CHF|Fr\.?|SFr\.?)\s*([\d'’_ ]{1,6}[.,]\d{2})/i;
  const m1 = cleaned.match(currencyRegex);
  if (m1) {
    const num = m1[1].replace(/['’_ ]/g, "");
    const value = parseFloat(num.replace(",", "."));
    if (Number.isFinite(value)) return value;
  }

  // 2) Fallback NUR, wenn wirklich nichts gefunden
  //    → optional, kann man auch komplett deaktivieren
  const genericRegex = /([\d]{2,5}[.,]\d{2})/;
  const m2 = cleaned.match(genericRegex);
  if (m2) {
    const value = parseFloat(m2[1].replace(",", "."));
    if (Number.isFinite(value)) {
      // Sicherheitscheck: unrealistisch kleine/grosse Werte rausfiltern
      if (value < 5 || value > 50000) return null;
      return value;
    }
  }

  return null;
}

// -----------------------------------------------------
// 📦 JSON-LD auslesen und Preis darin suchen
// -----------------------------------------------------
async function extractPriceFromJSONLD(page) {
  try {
    const jsonStrings = await page.$$eval(
      'script[type="application/ld+json"]',
      (nodes) => nodes.map((n) => n.textContent || "")
    );

    for (const raw of jsonStrings) {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        continue;
      }

      const candidates = [];

      const collect = (obj) => {
        if (!obj || typeof obj !== "object") return;

        if (obj.price) candidates.push(obj.price);
        if (obj.offers?.price) candidates.push(obj.offers.price);
        if (obj.offers?.lowPrice) candidates.push(obj.offers.lowPrice);
        if (Array.isArray(obj.offers)) {
          for (const o of obj.offers) {
            if (o.price) candidates.push(o.price);
            if (o.lowPrice) candidates.push(o.lowPrice);
          }
        }

        for (const v of Object.values(obj)) {
          if (typeof v === "object") collect(v);
        }
      };

      collect(data);

      const parsed = candidates
        .map((c) => parseFloat(String(c).replace(",", ".")))
        .filter((n) => Number.isFinite(n));

      if (parsed.length > 0) {
        // Nimm den kleinsten sinnvollen Preis (meistens Produktpreis, nicht UVP-Bundles)
        const price = Math.min(...parsed);
        if (price >= 5 && price <= 50000) {
          return price;
        }
      }
    }
  } catch (err) {
    console.log("   ⚠️ JSON-LD parse error:", err.message);
  }

  return null;
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
  const buildUrl = SHOPS[shop];
  if (!buildUrl) {
    console.log(`⚠️ Unbekannter Shop: ${shop}`);
    return { price: null, url: null };
  }

  const url = buildUrl(ean);
  const selectors = PRICE_SELECTORS[shop] || [];
  const page = await browser.newPage();

  await page.setUserAgent(
    USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  );

  // Request-Interception: nur Bilder/Fonts blocken
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "media", "font"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await retry(async () => {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
  });

  let price = null;

  // 1) JSON-LD (strukturierte Daten)
  price = await extractPriceFromJSONLD(page);
  if (price != null) {
    console.log(`   ✅ ${shop} JSON-LD Preis: ${price} CHF`);
  }

  // 2) Falls noch kein Preis: Selektoren versuchen
  if (price == null && selectors.length > 0) {
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const raw = await page.$eval(
          selector,
          (el) => el.textContent || el.innerText || ""
        );
        const p = extractPriceFromText(raw);
        if (p != null) {
          console.log(
            `   ✅ ${shop} Selector "${selector}" → ${p} CHF`
          );
          price = p;
          break;
        } else {
          console.log(
            `   ⚠️ ${shop} Selector "${selector}" gefunden, aber kein gültiger CHF-Preis`
          );
        }
      } catch {
        // Selector nicht gefunden → weiter
        continue;
      }
    }
  }

  // 3) Letzter Fallback: Gesamten Body scannen (sehr vorsichtig)
  if (price == null) {
    const bodyText = await page.evaluate(() => document.body.innerText || "");
    const fallback = extractPriceFromText(bodyText);
    if (fallback != null) {
      console.log(
        `   ⚠️ ${shop} Fallback-Preis aus Body für ${ean}: ${fallback} CHF (prüfen!)`
      );
      price = fallback;
    } else {
      console.log(
        `   ❌ ${shop} – kein Preis gefunden für ${ean}, Screenshot wird gespeichert`
      );
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
// 📦 Produkte aus Supabase laden (nur mit EAN)
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

  return res.json();
}

// -----------------------------------------------------
// 💾 Preis speichern (Upsert: PATCH → ggf. POST)
// -----------------------------------------------------
async function savePrice(entry) {
  // 1) Erst Update versuchen
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

  let updateJson = [];
  try {
    updateJson = await updateRes.json();
  } catch {
    updateJson = [];
  }

  // 2) Wenn keine Row aktualisiert wurde → Insert
  if (!Array.isArray(updateJson) || updateJson.length === 0) {
    console.log(`   ↳ No existing row → inserting new entry`);
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
      const text = await insertRes.text();
      console.log("   ❌ Insert error:", insertRes.status, text);
    }
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
