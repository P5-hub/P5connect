const fs = require("fs");
const path = require("path");

// ✅ Ersetzungen: typische UTF-8 ↔ Latin1 Fehler + Sonderzeichen + Emojis
const replacements = {
  // --- Umlaute & Akzente ---
  "Ã¤": "ä",
  "Ã¶": "ö",
  "Ã¼": "ü",
  "Ã„": "Ä",
  "Ã–": "Ö",
  "Ãœ": "Ü",
  "ÃŸ": "ß",
  "Ã©": "é",
  "Ãè": "è",
  "Ãê": "ê",
  "Ãá": "á",
  "Ãà": "à",
  "Ãâ": "â",
  "Ãç": "ç",
  "Ã´": "ô",
  "Ã²": "ò",
  "Ãº": "ú",
  "Ã¹": "ù",
  "Ãª": "ê",
  "Ã­": "í",

  // --- Typische Sonderzeichen ---
  "â€“": "–", // en dash
  "â€”": "—", // em dash
  "â€¢": "•", // bullet
  "â€ž": "„", // deutsches öffnendes Anführungszeichen
  "â€œ": "“", // engl. öffnendes Anführungszeichen
  "â€": "”", // engl. schließendes Anführungszeichen
  "â€˜": "‘", // einfach öffnend
  "â€™": "’", // einfach schließend
  "â€¦": "…", // Auslassungspunkte …
  "â„¢": "™", // Trademark
  "âˆž": "∞", // Unendlichkeitszeichen
  "âˆ†": "∆", // Delta
  "âˆ’": "−", // Minus (mathematisch)
  "â‰ˆ": "≈", // ungefähr gleich
  "â‰¤": "≤", // kleiner gleich
  "â‰¥": "≥", // größer gleich
  "â³": "⏳", // Sanduhr

  // --- Emoji-/Symbol-Fixes ---
  "âœ…": "✅", // grüner Haken
  "âŒ": "❌", // rotes Kreuz
  "ðŸš€": "🚀", // Rakete
  "ðŸ‘": "👍", // Daumen hoch
  "ðŸ’¥": "💥", // Explosion
  "ðŸ“": "📋", // Clipboard
  "ðŸš§": "🚧", // Baustelle
  "ðŸ§µ": "🧵", // Faden (Thread)
  "â›„": "⚗️", // Laborgerät / Chemie-Symbol
  "â›„ï¸": "⚗️", // Variante mit Variation Selector
  "ðŸ˜Š": "😊", // Lächeln
  "ðŸ˜„": "😄", // breites Lächeln
  "ðŸ˜‚": "😂", // lachend mit Tränen
  "ðŸ¤™": "🤘", // Rock-Hand
  "ðŸ‘Œ": "👌", // OK-Handzeichen
  "ðŸ‘¯": "👯", // Tanzende
  "ðŸ’¯": "💯", // 100 Punkte
  "ðŸŽ‰": "🎉", // Konfetti

  // --- Überflüssige oder fehlerhafte Steuerzeichen ---
  "Â": "",
  "¤": "€",
  "�": "", // schwarzes Diamant-Fragezeichen entfernen
};

// Dateiendungen, die geprüft werden sollen
const exts = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".txt"];
const skipDirs = ["node_modules", ".next", "dist", "out"];

// --- Einzeldatei prüfen & korrigieren ---
function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let newContent = content;

  for (const [wrong, right] of Object.entries(replacements)) {
    newContent = newContent.replace(new RegExp(wrong, "g"), right);
  }

  if (newContent !== content) {
    fs.writeFileSync(filePath + ".bak", content, "utf8"); // Backup anlegen
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(`✅ Fixed: ${filePath}`);
  }
}

// --- Ordner rekursiv durchsuchen ---
function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!skipDirs.includes(file)) walk(filePath);
    } else if (exts.includes(path.extname(file))) {
      fixFile(filePath);
    }
  }
}

// --- Start ---
console.log("🔧 Fixing encoding issues...");
walk(process.cwd());
console.log("🎉 Done! All replacements completed.");
