import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Wichtig: Service Role Key (nicht Anon!)
);

async function syncDealersToAuth() {
  // 1. Alle Händler holen
  const { data: dealers, error } = await supabase
    .from("dealers")
    .select("dealer_id, login_nr, password_plain, role, store_name");

  if (error) {
    console.error("Fehler beim Laden der Dealers:", error);
    return;
  }

  for (const dealer of dealers || []) {
    if (!dealer.password_plain) {
      console.log(`⚠️ Dealer ${dealer.login_nr} hat kein Passwort, übersprungen`);
      continue;
    }

    const email = `${dealer.login_nr}@p5.local`;

    // 2. Prüfen, ob User schon existiert
    const { data: existingUser, error: getUserError } =
      await supabase.auth.admin.listUsers();

    if (getUserError) {
      console.error("Fehler beim Laden der User:", getUserError);
      continue;
    }

    const userExists = existingUser.users.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      console.log(`✅ User für ${dealer.login_nr} existiert schon`);
      continue;
    }

    // 3. Neuen Auth-User erstellen
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password: dealer.password_plain,
      email_confirm: true,
      user_metadata: {
        dealer_id: dealer.dealer_id,
        login_nr: dealer.login_nr,
        role: dealer.role || "dealer",
        store_name: dealer.store_name || "",
      },
    });

    if (createError) {
      console.error(`❌ Fehler beim Erstellen von ${dealer.login_nr}:`, createError);
    } else {
      console.log(`🎉 User erstellt für Dealer ${dealer.login_nr} (${email})`);
    }
  }
}

syncDealersToAuth();
