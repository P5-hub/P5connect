"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  FolderKanban,
  Headphones,
  Gift,
  HandCoins,
} from "lucide-react";

export default function HändlerLanding({ dealer }: { dealer: any }) {
  const router = useRouter();

  const sections = [
    {
      title: "Verkauf melden",
      description: "Schnell und einfach Verkaufszahlen einreichen",
      icon: ShoppingCart,
      action: () => router.push("/verkauf"),
    },
    {
      title: "Projektanfrage",
      description: "Individuelle Projektanfragen einreichen",
      icon: FolderKanban,
      action: () => router.push("/projekt"),
    },
    {
      title: "Bestellung zum Bestpreis",
      description: "Produkte direkt zum Bestpreis bestellen",
      icon: Gift,
      action: () => router.push("/bestellung"),
    },
    {
      title: "Support",
      description: "Sell-Out Support, Events und Werbekosten melden",
      icon: Headphones,
      action: () => router.push("/support"),
    },
    {
      title: "Cashback Promotion",
      description: "Teilnahme an Cashback Aktionen",
      icon: HandCoins,
      action: () => router.push("/cashback"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Willkommen {dealer?.name ?? "Händler"} beim SONY P5connect Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <section.icon className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              <Button
                onClick={section.action}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Öffnen
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
