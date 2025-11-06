import PDFDocument from "pdfkit";
import path from "node:path";
import fs from "node:fs";

export interface PDFDocOptions {
  margin?: number;
}

/**
 * Sucht im Projektverzeichnis nach Font-Dateien.
 */
function findFontFile(candidates: string[]): string | null {
  for (const file of candidates) {
    const p = path.join(process.cwd(), "public", "fonts", file);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Erzeugt ein robustes PDF-Dokument mit automatischer Font-Erkennung.
 * 
 * - sucht Inter-Regular/Bold im /public/fonts/
 * - fällt auf Arial.ttf zurück, falls vorhanden
 * - nutzt intern Helvetica als letzte Rettung (keine Datei nötig)
 */
export function createPDFDocument(options: PDFDocOptions = {}) {
  const regularPath =
    findFontFile(["Inter-Regular.ttf", "Inter_18pt-Regular.ttf"]) ||
    findFontFile(["Arial.ttf"]);
  const boldPath =
    findFontFile(["Inter-Bold.ttf", "Inter_18pt-Bold.ttf"]) ||
    findFontFile(["Arial-Bold.ttf"]);

  const useFallback = !regularPath || !boldPath;
  const fallbackFont = "Helvetica";

  const doc = new PDFDocument({
    margin: options.margin ?? 42,
    autoFirstPage: false,
    font: regularPath || fallbackFont,
  });

  // Nur registrieren, wenn Datei existiert
  if (!useFallback) {
    doc.registerFont("Body", regularPath!);
    doc.registerFont("BodyBold", boldPath!);
  }

  // Seite erzeugen und Standard-Font setzen
  doc.addPage();
  doc.font(useFallback ? fallbackFont : "Body");

  // Debug-Ausgabe für Logs (optional)
  if (useFallback) {
    console.warn("[PDF] Fonts not found – using built-in Helvetica fallback.");
  } else {
    console.log("[PDF] Using custom fonts:", { regularPath, boldPath });
  }

  return { doc, useFallback, regularPath, boldPath };
}
