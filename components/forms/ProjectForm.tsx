"use client";

import { useState } from "react";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductList from "@/components/ProductList";
import ProductCardProject from "@/components/ProductCardProject";
import CartProject from "@/components/CartProject";
import {
  Building,
  PartyPopper,
  Tag,
  Home,
  Landmark,
  BriefcaseBusiness,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProjectForm() {
  const dealer = useDealer();
  const { t } = useI18n();
  const [cart, setCart] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState({
    type: "",
    name: "",
    customer: "",
    location: "",
    start: "",
    end: "",
    comment: "",
  });

  const handleAddToCart = (product: any) => {
    setCart((prev) => [...prev, product]);
  };

  const handleSuccess = () => {
    setDetails({
      type: "",
      name: "",
      customer: "",
      location: "",
      start: "",
      end: "",
      comment: "",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50/40">
        <CardContent className="space-y-3">
          {/* 🏗️ Projekt-Typ */}
          <div className="flex gap-2 flex-wrap justify-start">
            {[
              { key: "hotel", label: t("project.type.hotel"), icon: Building },
              { key: "event", label: t("project.type.event"), icon: PartyPopper },
              { key: "aktion", label: t("project.type.aktion"), icon: Tag },
              { key: "wohn", label: t("project.type.wohn"), icon: Home },
              { key: "public", label: t("project.type.public"), icon: Landmark },
              { key: "business", label: t("project.type.business"), icon: BriefcaseBusiness },
            ].map((opt) => (
              <Button
                key={opt.key}
                type="button"
                onClick={() => setDetails((d) => ({ ...d, type: opt.key }))}
                variant={details.type === opt.key ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1 ${
                  details.type === opt.key
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "text-purple-700 border-purple-300 hover:bg-purple-50"
                }`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </Button>
            ))}
          </div>

          {/* 🏗️ Projektfelder */}
          <Input
            placeholder={t("project.name")}
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
          />
          <Input
            placeholder={t("project.customer")}
            value={details.customer}
            onChange={(e) => setDetails({ ...details, customer: e.target.value })}
          />
          <Input
            placeholder={t("project.location")}
            value={details.location}
            onChange={(e) => setDetails({ ...details, location: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={details.start}
              onChange={(e) => setDetails({ ...details, start: e.target.value })}
            />
            <Input
              type="date"
              value={details.end}
              onChange={(e) => setDetails({ ...details, end: e.target.value })}
            />
          </div>

          <Input
            placeholder={t("project.comment")}
            value={details.comment}
            onChange={(e) => setDetails({ ...details, comment: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* 🛍️ Produktliste (Toolbar & Filter automatisch mit Übersetzung) */}
      <ProductList
        CardComponent={ProductCardProject}
        cardProps={{ onAddToCart: handleAddToCart }}
      />

      {/* 🧾 Warenkorb */}
      <CartProject
        dealer={dealer}
        cart={cart}
        setCart={setCart}
        onSuccess={handleSuccess}
        open={open}
        setOpen={setOpen}
        details={details}
      />
    </div>
  );
}
