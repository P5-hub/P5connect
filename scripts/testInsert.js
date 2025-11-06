import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Supabase-Client erstellen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("🔑 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("🔑 Role Key starts:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));

  const { data, error } = await supabase
    .from("sony_product_data")
    .insert({
      ean: "TEST-ROW",
      image_url: "https://example.com/test.jpg",
      updated_at: new Date()
    });

  console.log("Insert-Test Result:", { data, error });
}

main();
