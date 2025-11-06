import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("▶️ Test Sony Product Insert & Fetch...");

  const { data, error } = await supabase
    .from("sony_product_data")
    .upsert(
      {
        ean: "TEST-ROW",
        sku: "TEST-ROW", // 👈 sku = ean (einfach identisch setzen)
        image_url: "https://example.com/test.jpg",
        updated_at: new Date()
      },
      { onConflict: "ean" }   // Konflikte auf ean behandeln
    )
    .select();

  if (error) {
    console.error("❌ Upsert Error:", error);
  } else {
    console.log("✅ Upsert Success:", data);
  }
}

run();
