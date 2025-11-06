import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import fs from "fs";
import { config } from "dotenv";
config({ path: ".env.local" }); // <-- ganz wichtig



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Key für Upload
const supabase = createClient(supabaseUrl, supabaseKey);

const bucket = "product-images";

async function run() {
  // 1. Produkte laden
  const { data: products, error } = await supabase
    .from("products")
    .select("product_id, sony_article, product_image_url");

  if (error) throw error;

  for (const product of products) {
    try {
      if (!product.product_image_url) continue;

      const res = await fetch(product.product_image_url);
      if (!res.ok) {
        console.log(`❌ Bild nicht ladbar: ${product.product_image_url}`);
        continue;
      }

      const buffer = await res.arrayBuffer();
      const filename = `${product.sony_article || product.product_id}.jpg`;

      // 2. Hochladen in Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, Buffer.from(buffer), {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;

      // 3. Datenbank aktualisieren
      await supabase
        .from("products")
        .update({ product_image_url: publicUrl })
        .eq("product_id", product.product_id);

      console.log(`✅ ${filename} → ${publicUrl}`);
    } catch (err) {
      console.error("Fehler bei", product.product_image_url, err.message);
    }
  }
}

run();
