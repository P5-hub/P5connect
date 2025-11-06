
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer"; // ✅ korrigiert
import { sendMail } from "@/lib/mailer";
import { assertAdminOrThrow } from "@/lib/adminGuard";

export async function POST(req: Request) {
  // ðŸ”’ Admin-Zugriff prüfen
  try {
    await assertAdminOrThrow();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId fehlt" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  // @ts-ignore – Typisierung von Supabase-Views ist fehlerhaft
  const { data, error } = await supabase
    .from("bestellungen_view")
    .select(`
      *,
      dealers ( email, mail_kam, distributor_id ),
      distributors ( email )
    `)
    .eq("submission_id", submissionId)
    .single();

  const row: any = data;
  if (error || !row) {
    console.error("❌ Fehler beim Laden der Bestellung:", error);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // ðŸ”¹ Empfänger bestimmen
  const recipients = [
    row.dealers?.email,       // Händler
    row.dealers?.mail_kam,    // KAM
    row.distributors?.email,  // Distributor (BG)
  ].filter(Boolean);

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Keine gültigen E-Mail-Empfänger gefunden" },
      { status: 400 }
    );
  }

  // ðŸ”¹ Mailinhalt für Ablehnung
  const subject = `❌ Bestellung abgelehnt – ${row.dealer_name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Guten Tag ${row.dealer_name},</p>
      <p>Leider müssen wir Ihnen mitteilen, dass Ihre Bestellung <strong>#${row.submission_id}</strong> abgelehnt wurde.</p>
      <p><b>Produkte:</b> ${row.product_list || "-"}</p>
      <p>Für Rückfragen steht Ihnen Ihr Ansprechpartner gerne zur Verfügung.</p>
      <p style="margin-top: 15px;">Mit freundlichen Grüssen,<br/>Ihr P5connect-Team</p>
    </div>
  `;

  // ðŸ”¹ Mail senden
  const result = await sendMail({ to: recipients, subject, html });

  // ðŸ”¹ Status auf "rejected" setzen
  await (supabase as any)
    .from("submissions")
    .update({ status: "rejected" })
    .eq("submission_id", submissionId);


  return NextResponse.json(result);
}

