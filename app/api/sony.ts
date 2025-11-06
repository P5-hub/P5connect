import type { NextApiRequest, NextApiResponse } from "next";
import { scrapeSonyProduct } from "@/lib/sonyScraper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sku } = req.query;

  if (!sku || typeof sku !== "string") {
    return res.status(400).json({ error: "SKU fehlt" });
  }

  try {
    const data = await scrapeSonyProduct(sku);
    res.status(200).json(data);
  } catch (err: any) {
    console.error("Sony API Error:", err);
    res.status(500).json({ error: "Produktinfos konnten nicht geladen werden." });
  }
}
