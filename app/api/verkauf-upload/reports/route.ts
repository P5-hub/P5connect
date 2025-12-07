import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * GET /api/verkaufsreport?format=json|csv
 */
export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = await getSupabaseServer();

  // 🔒 Auth prüfen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  // Query parameter
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";

  // 📊 Daten aus der View holen
  const { data, error } = await supabase
    .from("verkaufsreport_view")
    .select("*")
    .order("gesamtumsatz", { ascending: false });

  if (error) {
    console.error("❌ Fehler beim Abruf der Daten:", error);
    return NextResponse.json({ error: "Datenbankfehler." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "Keine Verkaufsdaten vorhanden." },
      { status: 200 }
    );
  }

  // ======================================================
  // 📄 CSV Export
  // ======================================================
  if (format === "csv") {
    try {
      // Excel verträgt ; als Trennzeichen besser
      const separator = ";";

      const fields = [
        "dealer_id",
        "haendlername",
        "store_name",
        "city",
        "plz",
        "kam_name",
        "anzahl_meldungen",
        "total_stueck",
        "sony_umsatz",
        "avg_sony_share",
        "gesamtumsatz",
        "sony_umsatzanteil_prozent",
        "letzter_verkauf",
      ];

      // Header-Zeile
      const header = fields.join(separator);

      // Datenzeilen sauber escapen
      const rows = data.map((row: any) =>
        fields
          .map((f) => {
            const value = row[f] ?? "";
            // Alle ; escapen + Strings in Quotes
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(separator)
      );

      const csvContent = [header, ...rows].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            "attachment; filename=verkaufsreport.csv",
        },
      });
    } catch (err) {
      console.error("❌ CSV-Fehler:", err);
      return NextResponse.json(
        { error: "Fehler beim Erstellen der CSV." },
        { status: 500 }
      );
    }
  }

  // ======================================================
  // JSON Standard Response
  // ======================================================
  return NextResponse.json(data, { status: 200 });
}
