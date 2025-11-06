import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { sendMail } from "@/lib/mailer";
import { assertAdminOrThrow } from "@/lib/adminGuard";

export async function POST(req: Request) {
  // 🔒 Admin prüfen
  try {
    await assertAdminOrThrow();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId fehlt" }, { status: 400 });
  }

  // 🧠 Supabase-Server-Client
  const supabase = getSupabaseServer();


  // @ts-ignore – Supabase-Typisierung buggt hier
  // 🔹 Bestellung + Händler + Distributor abrufen
  const { data, error } = await supabase
    // @ts-ignore – Typprüfung deaktiviert, zur Laufzeit korrekt
    .from("bestellungen_view")
    .select(`
      *,
      dealers ( email, mail_kam, distributor_id ),
      distributors ( email )
    `)
    .eq("submission_id", submissionId)
    .single();

  const row: any = data; // 👈 hier der entscheidende Trick



  if (error || !row) {
    console.error("❌ Fehler beim Laden der Bestellung:", error);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // 🔹 Empfänger bestimmen
  const recipients = [
    row.dealers?.email,      // Händler
    row.dealers?.mail_kam,   // KAM
    row.distributors?.email, // Distributor (BG)
  ].filter(Boolean);

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Keine gültigen E-Mail-Empfänger gefunden" },
      { status: 400 }
    );
  }

  // 🔹 Mailinhalt aufbauen
  const subject = `✅ Bestellung bestätigt – ${row.dealer_name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Guten Tag ${row.dealer_name},</p>
      <p>Ihre Bestellung wurde bestätigt.</p>
      <p><b>Produkte:</b> ${row.product_list || "-"}</p>
      <p style="margin-top: 15px;">Freundliche Grüsse,<br/>Ihr P5connect-Team</p>
    </div>
  `;

  // 🔹 Mail senden
  const result = await sendMail({ to: recipients, subject, html });

  // 🔹 Status der Bestellung auf "sent" setzen
  await (supabase as any)
    .from("submissions")
    .update({ status: "sent" })
    .eq("submission_id", submissionId);


  return NextResponse.json(result);
}
