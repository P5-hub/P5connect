// scraper/scrape.js
import puppeteer from "puppeteer";

// -----------------------------------------------------
// 🔧 User Agents
// -----------------------------------------------------
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const USER_AGENTS = [CHROME_UA];

// -----------------------------------------------------
// 🛒 SHOPS – Suchseiten
// -----------------------------------------------------
const SHOPS = {
  digitec: (ean) =>
    `https://www.digitec.ch/de/search?q=${encodeURIComponent(ean)}`,
  mediamarkt: (ean) =>
    `https://www.mediamarkt.ch/de/search.html?query=${encodeURIComponent(
      ean,
    )}`,
  interdiscount: (ean) =>
    `https://www.interdiscount.ch/de/search?s=${encodeURIComponent(ean)}`,
  fnac: (ean) =>
    `https://www.fnac.ch/SearchResult/ResultList.aspx?Search=${encodeURIComponent(
      ean,
    )}`,
  brack: (ean) => `https://www.brack.ch/search?q=${encodeURIComponent(ean)}`,
  fust: (ean) =>
    `https://www.fust.ch/de/searchresult.html?q=${encodeURIComponent(ean)}`,
};

// -----------------------------------------------------
// 💰 Preis-Selektoren
// -----------------------------------------------------
const PRICE_SELECTORS = {
  digitec: [
    "span[data-testid='product-price']",
    ".sc-d0a80c58-0",
    ".sc-d0a80c58-2",
    ".sc-8d3d65ab-0",
    "[data-ga-label='product-price']",
  ],
  mediamarkt: [".sc-94eb08bc-0.kjXYoV", ".price__value", "[itemprop=price]"],
  interdiscount: [".inline-flex", "[data-test='product-price']", ".price__digit"],
  fnac: [".f-faPriceBox__price", ".userPrice", ".priceBox-price"],
  brack: [".bpaYB7Nv", ".product-price__price"],
  fust: [".price__price", ".product-detail-price", ".price strong"],
};

// -----------------------------------------------------
// 🔍 Preis extrahieren
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

  let m = cleaned.match(/(\d+)\.-/);
  if (m) return parseFloat(m[1]);

  m = cleaned.match(/(\d+)-/);
  if (m) return parseFloat(m[1]);

  m = cleaned.match(/(\d+[.,]\d{2})/);
  if (m) return parseFloat(m[1].replace(",", "."));

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
      (nodes) => nodes.map((n) => n.textContent),
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
      } catch {
        // JSON parse error – ignorieren
      }
    }
  } catch {
    // keine ld+json scripts
  }

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
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
    }
  }
  throw lastErr;
}

// -----------------------------------------------------
// 🕷 Generisches Shop-scraping (alle außer digitec)
// -----------------------------------------------------
async function scrapeShop(browser, shop, ean) {
  const url = SHOPS[shop](ean);
  const selectors = PRICE_SELECTORS[shop];

  const page = await browser.newPage();

  await page.setUserAgent(
    USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  );

  await page.setExtraHTTPHeaders({
    "accept-language": "de-CH,de;q=0.9",
  });

  // Hier lassen wir die Request-Interception bewusst drin
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.resourceType() === "image" || req.resourceType() === "font")
      req.abort();
    else req.continue();
  });

  await retry(async () => {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 65000,
    });
  });

  // 1) JSON-LD
  let jsonPrice = await extractJSONLDPrice(page);
  if (jsonPrice) {
    let p = extractPrice(String(jsonPrice));
    if (p != null) {
      await page.close();
      return { price: p, url };
    }
  }

  // 2) Selektoren
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 3000 });
      const raw = await page.$eval(
        sel,
        (el) => el.innerText || el.textContent,
      );
      const p = extractPrice(raw);
      if (p != null) {
        await page.close();
        return { price: p, url };
      }
    } catch {
      // Selector nicht gefunden – nächster
    }
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
// 🕷 Digitec: Puppeteer + HTTP-Fallback
// -----------------------------------------------------

// 1) Puppeteer-Variante (gehärtet gegen Anti-Bot / HTTP2)
async function scrapeDigitecWithPuppeteer(browser, ean) {
  const shop = "digitec";
  const url = SHOPS[shop](ean);
  const selectors = PRICE_SELECTORS[shop];

  const page = await browser.newPage();

  await page.setUserAgent(CHROME_UA);

  await page.setExtraHTTPHeaders({
    "accept-language": "de-CH,de;q=0.9",
    "sec-ch-ua": `"Chromium";v="124", "Not:A-Brand";v="99"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
  });

  // WICHTIG: keine Request-Interception bei digitec
  await retry(async () => {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 65000,
    });
  });

  let jsonPrice = await extractJSONLDPrice(page);
  if (jsonPrice) {
    let p = extractPrice(String(jsonPrice));
    if (p != null) {
      await page.close();
      return { price: p, url };
    }
  }

  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 3000 });
      const raw = await page.$eval(
        sel,
        (el) => el.innerText || el.textContent,
      );
      const p = extractPrice(raw);
      if (p != null) {
        await page.close();
        return { price: p, url };
      }
    } catch {
      // ignorieren
    }
  }

  const fallbackText = await page.content();
  const fallbackPrice = extractPrice(fallbackText);

  await page.close();

  return {
    price: fallbackPrice ?? null,
    url,
  };
}

// 2) HTTP-Fallback ohne Puppeteer
async function scrapeDigitecHTTPFallback(ean) {
  const shop = "digitec";
  const url = SHOPS[shop](ean);

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": CHROME_UA,
        "accept-language": "de-CH,de;q=0.9",
      },
    });

    const html = await res.text();
    const price = extractPrice(html);

    return { price: price ?? null, url };
  } catch (err) {
    console.error("   ❌ Digitec HTTP-Fallback Error:", err.message);
    return { price: null, url };
  }
}

// Kombinierte Digitec-Funktion:
async function scrapeDigitec(browser, ean) {
  try {
    const res = await scrapeDigitecWithPuppeteer(browser, ean);
    if (res.price != null) return res;

    console.log("   ℹ Digitec Puppeteer lieferte keinen Preis, HTTP-Fallback...");
    return await scrapeDigitecHTTPFallback(ean);
  } catch (err) {
    if (
      String(err.message || "").includes("ERR_HTTP2_PROTOCOL_ERROR") ||
      String(err.message || "").includes("net::ERR")
    ) {
      console.log(
        "   ℹ Digitec HTTP2/Netzwerkproblem – versuche HTTP-Fallback ohne Browser...",
      );
      return await scrapeDigitecHTTPFallback(ean);
    }
    throw err;
  }
}

// -----------------------------------------------------
// 📦 Produkte von Supabase laden
// -----------------------------------------------------
async function fetchProducts() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ FATAL: SUPABASE_URL oder SERVICE_ROLE_KEY fehlt!");
    process.exit(1);
  }

  const res = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/products?select=product_id,ean&ean=not.is.null`,
    {
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `fetchProducts failed: ${res.status} ${res.statusText} – ${text}`,
    );
  }

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
    },
  );

  let updated = [];
  try {
    updated = await updateRes.json();
  } catch {
    // PATCH ohne Body
  }

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
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-http2", // wichtig für digitec
      "--disable-features=NetworkService",
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
          let result;

          if (shop === "digitec") {
            result = await scrapeDigitec(browser, p.ean);
          } else {
            result = await scrapeShop(browser, shop, p.ean);
          }

          const { price, url } = result;

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
