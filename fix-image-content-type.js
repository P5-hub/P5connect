import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { config } from "dotenv";

config({ path: ".env.local" }); // falls deine Keys dort liegen

// ⚠️ Service Role Key nutzen, nicht den Public Key!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const bucket = "product-images";
const tmpDir = "./tmp_images";

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

async function run() {
  console.log("🔍 Lade Bilderliste aus Supabase…");
  const { data: list, error } = await supabase.storage.from(bucket).list("", { limit: 1000 });
  if (error) throw error;

  for (const file of list) {
    const filename = file.name;
    const filePath = path.join(tmpDir, filename);

    try {
      console.log(`➡️ Prüfe ${filename}…`);

      // Datei herunterladen
      const { data, error: dlError } = await supabase.storage
        .from(bucket)
        .download(filename);

      if (dlError) {
        console.error(`❌ Download fehlgeschlagen: ${filename}`, dlError.message);
        continue;
      }

      const arrayBuffer = await data.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

      // Content-Type prüfen (nur grob anhand Magics)
      const header = Buffer.from(arrayBuffer).toString("hex", 0, 4);
      const isJPEG = header.startsWith("ffd8"); // JPEG Magic Number
      const contentType = isJPEG ? "image/jpeg" : "application/octet-stream";

      if (contentType !== "image/jpeg") {
        console.warn(`⚠️ ${filename} scheint KEIN echtes JPEG zu sein.`);
      }

      // Datei mit korrektem Content-Type zurückspielen
      const { error: upError } = await supabase.storage
        .from(bucket)
        .upload(filename, fs.readFileSync(filePath), {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (upError) {
        console.error(`❌ Fehler beim Re-Upload von ${filename}:`, upError.message);
      } else {
        console.log(`✅ ${filename} neu hochgeladen mit image/jpeg`);
      }
    } catch (err) {
      console.error(`❌ Fehler bei ${filename}:`, err.message);
    }
  }

  console.log("🎉 Fix abgeschlossen!");
}

run();
