"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface GuardProps {
  children: ReactNode;
}

export default function DealerGuard({ children }: GuardProps) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata?.role;

      if (role !== "dealer") router.push("/admin");
      else setReady(true);
    }
    check();
  }, []);

  if (!ready) return <div className="p-6 text-center">Loading…</div>;

  return <>{children}</>;
}
