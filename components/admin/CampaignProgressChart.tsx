"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Row = {
  menge: number | null;
  preis: number | null;
  submission: {
    datum: string | null;
    created_at: string | null;
    status: string | null;
  } | null;
};

type Props = {
  rows: Row[];
  startDate?: string | null;
  endDate?: string | null;
  target?: number | null;
};

function formatCHF(value: number) {
  return value.toLocaleString("de-CH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function CampaignProgressChart({
  rows,
  startDate,
  endDate,
  target,
}: Props) {
  // ================= GROUP BY DAY =================
  const map = new Map<string, number>();

  rows
    .filter((r) => r.submission?.status === "approved")
    .forEach((r) => {
      const date =
        r.submission?.datum ||
        r.submission?.created_at?.slice(0, 10);

      if (!date) return;

      const revenue =
        Number(r.menge ?? 0) * Number(r.preis ?? 0);

      map.set(date, (map.get(date) || 0) + revenue);
    });

  // ================= SORT + CUMULATE =================
  const sorted = [...map.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  let running = 0;

  const data = sorted.map(([date, value]) => {
    running += value;

    return {
      date,
      daily: Math.round(value),
      cumulative: Math.round(running),
    };
  });

  const total = running;

  // ================= KPIs =================
  const progress = target ? (total / target) * 100 : null;

  const daysLeft =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  const remaining = target ? Math.max(0, target - total) : null;

  const perDay =
    remaining && daysLeft ? remaining / daysLeft : null;

  // ================= UI =================
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded-xl bg-gray-50">
          <div className="text-xs text-gray-500">Umsatz total</div>
          <div className="text-lg font-semibold">
            {formatCHF(total)} CHF
          </div>
        </div>

        {target && (
          <div className="p-3 border rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">Ziel</div>
            <div className="text-lg font-semibold">
              {formatCHF(target)} CHF
            </div>
          </div>
        )}

        {progress !== null && (
          <div className="p-3 border rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">Fortschritt</div>
            <div className="text-lg font-semibold">
              {progress.toFixed(1)} %
            </div>
          </div>
        )}

        {perDay && (
          <div className="p-3 border rounded-xl bg-gray-50">
            <div className="text-xs text-gray-500">
              nötig / Tag
            </div>
            <div className="text-lg font-semibold">
              {formatCHF(perDay)} CHF
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80 w-full bg-white border rounded-xl p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />
            <YAxis />

            <Tooltip
              formatter={(value: any) =>
                `${formatCHF(value)} CHF`
              }
            />

            <Line
              type="monotone"
              dataKey="daily"
              stroke="#3b82f6"
              name="Täglich"
            />

            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#10b981"
              strokeWidth={2}
              name="Kumuliert"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}