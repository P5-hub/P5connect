"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeftRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ActingDealerBanner() {
  const router = useRouter();
  const supabase = createClient();

  const [dealerId, setDealerId] = useState<number | null>(null);
  const [dealerName, setDealerName] = useState<string | null>(null);
  const [canSeeBanner, setCanSeeBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + name + "=([^;]*)")
      );
      return match ? decodeURIComponent(match[1]) : null;
    };

    const load = async () => {
      try {
        const id = getCookie("acting_dealer_id");
        const name = getCookie("acting_dealer_name");

        if (!id) {
          setCanSeeBanner(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          setCanSeeBanner(false);
          setLoading(false);
          return;
        }

        const role = data.user.app_metadata?.role ?? null;
        const isAdmin = role === "admin" || role === "superadmin";

        if (!isAdmin) {
          setCanSeeBanner(false);
          setLoading(false);
          return;
        }

        setDealerId(Number(id));
        setDealerName(name);
        setCanSeeBanner(true);
      } catch {
        setCanSeeBanner(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  const handleReset = async () => {
    try {
      await fetch("/api/acting-as/reset", {
        method: "POST",
      });

      const returnPath =
        sessionStorage.getItem("admin_return_path") || "/admin";

      router.push(returnPath);
      router.refresh();
    } catch {
      router.push("/admin");
      router.refresh();
    }
  };

  if (loading || !canSeeBanner || !dealerId) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm before:absolute before:top-0 before:left-0 before:h-[2px] before:w-full before:bg-blue-600">
      <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
        
        <div className="flex min-w-0 items-center gap-3">
          
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Acting Mode aktiv
            </div>
            <div className="truncate text-sm text-gray-800 sm:text-[15px]">
              <span className="font-semibold text-gray-900">
                Admin agiert als Händler:
              </span>{" "}
              {dealerName ? `${dealerName} (#${dealerId})` : `ID ${dealerId}`}
            </div>
          </div>

        </div>

        <button
          onClick={handleReset}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-100 hover:shadow"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">Zurück zum Admin</span>
          <span className="sm:hidden">Zurück</span>
        </button>

      </div>
    </div>
  );
}