"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { HandCoins, PlusCircle } from "lucide-react";

export default function ProductCardSupportCost({
  onAddToCart,
}: {
  onAddToCart: (item: any) => void;
}) {
  const { t } = useI18n();
  const [type, setType] = useState<string>("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);
  const [comment, setComment] = useState("");

  const toInt = (v: any) => (Number.isFinite(+v) ? Math.max(0, Math.round(+v)) : 0);

  const handleAdd = () => {
    if (!name.trim() || !type) return;

    onAddToCart?.({
      product_id: `cost_${Date.now()}`,
      product_name: name,
      sony_article: type,
      ean: null,
      quantity: toInt(quantity),
      supportbetrag: toInt(amount),
      comment,
      type: "manual_cost",
    });

    setName("");
    setType("");
    setQuantity(1);
    setAmount(0);
    setComment("");
  };

  return (
    <Card className="border-amber-300 bg-amber-50/30 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold text-amber-800 leading-tight">
            {t("support.customcost.title", { defaultValue: "Individuelle Support-Anfrage" })}
          </h3>
          <PlusCircle className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-xs text-amber-700 mt-1">
          {t("support.customcost.subtitle", {
            defaultValue: "Wählen Sie die Art des Supports und fügen Sie Details hinzu",
          })}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Auswahltyp */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            {t("support.customcost.type", { defaultValue: "Art des Supports" })}
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue
                placeholder={t("support.customcost.select", {
                  defaultValue: "Bitte Art des Supports auswählen",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="werbung">
                {t("support.type.werbung", { defaultValue: "Werbekostenbeteiligung" })}
              </SelectItem>
              <SelectItem value="event">
                {t("support.type.event", { defaultValue: "Eventbeteiligung / Open Days" })}
              </SelectItem>
              <SelectItem value="sonstiges">
                {t("support.type.sonstiges", { defaultValue: "Sonstiges" })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Beschreibung */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            {t("support.customcost.name", { defaultValue: "Beschreibung" })}
          </label>
          <Input
            type="text"
            placeholder={t("support.customcost.placeholder", {
              defaultValue: "z. B. Plakataktion, Roadshow, Messebeteiligung...",
            })}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Menge und Betrag */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t("support.quantity", { defaultValue: "Menge" })}
            </label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(toInt(e.target.value))}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t("support.amountperunit", { defaultValue: "Supportbetrag pro Stück (CHF)" })}
            </label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(toInt(e.target.value))}
              className="text-center"
            />
          </div>
        </div>

        {/* Kommentar */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            {t("support.comment", { defaultValue: "Kommentar / Details" })}
          </label>
          <Textarea
            placeholder={t("support.comment.placeholder", {
              defaultValue: "Fügen Sie zusätzliche Informationen hinzu...",
            })}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          onClick={handleAdd}
          disabled={!name.trim() || !type}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
        >
          <HandCoins className="w-4 h-4" />
          {t("support.add", { defaultValue: "Hinzufügen" })}
        </Button>
      </CardFooter>
    </Card>
  );
}
