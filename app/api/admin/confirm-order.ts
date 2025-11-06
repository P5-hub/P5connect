import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendMail } from "@/lib/mailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { submissionId } = req.body;
  if (!submissionId) {
    return res.status(400).json({ error: "submissionId fehlt" });
  }

  const supabase = getSupabaseServer();


  try {
    const { data: submission, error } = await supabase
      .from("submissions")
      .select(
        `
        submission_id,
        dealer:dealers(name, dealer_id, email),
        distributor:distributors(name, email_order),
        submission_items(
          menge,
          preis,
          product:products(product_name, sony_article, ean)
        )
      `
      )
      .eq("submission_id", submissionId)
      .single<any>(); // ðŸ‘ˆ Typ erzwingen, um TS-"never"-Fehler zu verhindern


    if (error || !submission) {
      console.error(error);
      return res.status(404).json({ error: "Submission nicht gefunden" });
    }

    const dealer = submission.dealer;
    const distributor = submission.distributor;

    const subject = `Neue Bestellung von ${dealer?.name ?? "Unbekannt"}`;
    const body = `
      <h2>Bestellung #${submission.submission_id}</h2>
      <p><b>Dealer:</b> ${dealer?.name ?? "-"} (${dealer?.dealer_id})</p>
      <p><b>Produkte:</b></p>
      <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th>Artikel</th>
            <th>Name</th>
            <th>EAN</th>
            <th>Menge</th>
            <th>Preis (CHF)</th>
          </tr>
        </thead>
        <tbody>
          ${submission.submission_items
            .map((i:any) => `
            <tr>
              <td>${i.product?.sony_article ?? "-"}</td>
              <td>${i.product?.product_name ?? "Unbekannt"}</td>
              <td>${i.product?.ean ?? "-"}</td>
              <td style="text-align:right">${i.menge}</td>
              <td style="text-align:right">${i.preis?.toFixed(2) ?? "0.00"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    const recipient = distributor?.email_order || dealer?.email;
    if (!recipient) {
      return res
        .status(400)
        .json({ error: "Kein Empfänger für Bestellung gefunden" });
    }

    await sendMail({
      to: [recipient],
      subject,
      html: body,
    });

    await (supabase as any)
      .from("submissions")
      .update({ status: "sent" })
      .eq("submission_id", submissionId);



    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Fehler beim Versand:", err);
    return res.status(500).json({ error: "Interner Fehler" });
  }
}

