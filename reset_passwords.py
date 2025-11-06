import os
from supabase import create_client
from dotenv import load_dotenv

# 🔄 .env laden
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("❌ SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def reset_p5_passwords():
    page = 1
    per_page = 50
    updated_count = 0

    while True:
        # 🔹 Benutzer seitenweise laden
        users_resp = supabase.auth.admin.list_users(page=page, per_page=per_page)

        if not users_resp or len(users_resp) == 0:
            break

        print(f"📄 Seite {page}, {len(users_resp)} Benutzer gefunden")

        for user in users_resp:
            if not user.email or not user.email.endswith("@p5.local"):
                continue  # ❌ andere User überspringen

            print(f"🔄 Setze Passwort für: {user.email}")

            res = supabase.auth.admin.update_user_by_id(
                user.id,
                {"password": "sonyP5!"}
            )

            if hasattr(res, "user") and res.user:
                print(f"✅ Passwort gesetzt für {user.email}")
                updated_count += 1
            else:
                print(f"❌ Fehler bei {user.email}, Antwort: {res}")

        page += 1

    print(f"\n🎉 Fertig! {updated_count} Passwörter für @p5.local gesetzt.")


if __name__ == "__main__":
    reset_p5_passwords()
