"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface GuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: GuardProps) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/login");
        return;
      }

      const role = data.user.app_metadata?.role;
      const isAdminLike = role === "admin" || role === "superadmin";

      if (!isAdminLike) {
        router.push("/bestellung");
        return;
      }

      setReady(true);
    }

    check();
  }, [router, supabase]);

  if (!ready) return <div className="p-6 text-center">Loading…</div>;

  return <>{children}</>;
}