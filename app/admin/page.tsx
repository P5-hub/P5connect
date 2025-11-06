"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import BestellungenDashboard from "@/components/admin/BestellungenDashboard";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Hauptinhalt: Bestellungen */}
      <Card className="shadow-sm border rounded-2xl">
        <CardHeader className="border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Bestellungen verwalten
          </h2>
        </CardHeader>
        <CardContent>
          <BestellungenDashboard />
        </CardContent>
      </Card>
    </div>
  );
}
