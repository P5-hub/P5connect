import Link from "next/link";

export type PendingEntry = {
  id: string | number;
  typ: string;
  title: string;
  created_at: string;
};

export default function PendingItem({ entry }: { entry: PendingEntry }) {
  // Alle realen Typvarianten abfangen
  const normalized = entry.typ.toLowerCase();

  const mapHref: Record<string, string> = {
    bestellung: "/admin/bestellungen",
    bestellungen: "/admin/bestellungen",

    projekt: "/admin/projekte",
    projekts: "/admin/projekte",
    projekte: "/admin/projekte",

    support: "/admin/support",

    promotion: "/admin/promotions",
    promotions: "/admin/promotions",

    sofortrabatt: "/admin/sofortrabatt",

    cashback: "/admin/cashback",
    cashbacks: "/admin/cashback",

    monatsaktion: "/admin/aktionen",
    monatsaktionen: "/admin/aktionen",
  };

  const href = mapHref[normalized] ?? "#";

  return (
    <Link
      href={href}
      className="block px-3 py-2 border-b last:border-none hover:bg-gray-50 rounded transition"
    >
      <div className="flex justify-between text-sm font-medium text-gray-800">
        <span>{entry.title}</span>
        <span className="text-[10px] text-gray-500">
          {new Date(entry.created_at).toLocaleString("de-CH")}
        </span>
      </div>

      <div className="text-xs text-gray-600 capitalize">
        Typ: {entry.typ}
      </div>
    </Link>
  );
}
