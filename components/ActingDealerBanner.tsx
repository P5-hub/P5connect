"use client";

import { useEffect, useState } from "react";

export default function ActingDealerBanner() {
  const [dealerId, setDealerId] = useState<number | null>(null);
  const [dealerName, setDealerName] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + name + "=([^;]*)")
      );
      return match ? decodeURIComponent(match[1]) : null;
    };

    const id = getCookie("acting_dealer_id");
    const name = getCookie("acting_dealer_name");

    if (id) setDealerId(Number(id));
    if (name) setDealerName(name);
  }, []);

  if (!dealerId) return null;

  const handleReset = async () => {
    await fetch("/api/acting-as/reset", {
      method: "POST",
    });

    window.location.reload();
  };

  return (
    <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 flex items-center justify-between text-sm">
      <div>
        <strong>🟡 Händlermodus aktiv:</strong>{" "}
        {dealerName ? `${dealerName} (#${dealerId})` : `ID ${dealerId}`}
      </div>

      <button
        onClick={handleReset}
        className="ml-4 px-3 py-1 bg-yellow-300 hover:bg-yellow-400 rounded text-sm font-medium"
      >
        Beenden
      </button>
    </div>
  );
}