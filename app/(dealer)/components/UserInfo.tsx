"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type UserMeta = {
  dealer_id?: string;
  login_nr?: string;
  role?: string;
  store_name?: string;
};

export default function UserInfo() {
  const supabase = createClient();
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserMeta(user.user_metadata as UserMeta);
      }
    };

    loadUser();
  }, [supabase]);

  if (!userMeta) {
    return null; // nichts anzeigen, wenn nicht geladen
  }

  return (
    <div className="text-sm text-gray-200">
      Eingeloggt als{" "}
      <span className="font-semibold">{userMeta.store_name ?? "Unbekannt"}</span>{" "}
      ({userMeta.role === "admin" ? "Admin" : "Händler"})
    </div>
  );
}


