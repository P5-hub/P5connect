const fs = require("fs");
const path = require("path");

const patterns = [
  /Ã./g,   // falsch encodierte Umlaute
  /â./g,   // typisches falsches UTF-8 zu Latin1 Mapping
  /�/g,    // unbekannte Ersatzzeichen
  /¤/g,    // Euro-Zeichen-Fehler
];

const exts = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".html", ".txt"];
let foundCount = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let issues = [];

  for (const regex of patterns) {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      issues.push(`${regex} (${matches.length} Treffer)`);
    }
  }

  if (issues.length > 0) {
    foundCount++;
    console.log(`⚠️  Problematische Zeichen in: ${filePath}`);
    for (const issue of issues) console.log("   →", issue);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", "dist", "out"].includes(file)) {
        walk(filePath);
      }
    } else if (exts.includes(path.extname(file))) {
      checkFile(filePath);
    }
  }
}

console.log("🔍 Prüfe Projekt auf Encoding-Probleme...");
walk(process.cwd());
if (foundCount === 0) {
  console.log("✅ Alles sauber – keine kaputten Zeichen gefunden!");
} else {
  console.log(`⚠️  ${foundCount} Datei(en) mit möglichen Encoding-Problemen gefunden.`);
}
