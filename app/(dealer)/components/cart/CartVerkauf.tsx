"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function CartVerkauf() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");
  const { t } = useI18n();

  const { state, getItems, clearCart, closeCart } = useCart();

  const items = getItems("verkauf");
  const open = state.open && state.currentForm === "verkauf";

  const [dealer, setDealer] = useState<any>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadDealer = async () => {
      if (!dealerIdFromUrl) {
        setLoadingDealer(false);
        return;
      }

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("dealer_id", dealerIdFromUrl)
        .single();

      if (error || !data) {
        toast.error(t("sales.errors.dealerLoadFailed"));
        setLoadingDealer(false);
        return;
      }

      setDealer(data);
      setLoadingDealer(false);
    };

    loadDealer();
  }, [dealerIdFromUrl, supabase, t]);

  const [sonyShareQty, setSonyShareQty] = useState<number>(30);
  const [sonyShareRevenue, setSonyShareRevenue] = useState<number>(30);

  const [calendarWeek] = useState<number>(() => {
    const date = new Date();
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

    return Math.ceil(
      (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
    );
  });

  const stockTotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.stock_quantity ?? item.stockQuantity ?? 0),
    0
  );

  const salesTotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.quantity ?? item.menge ?? 0),
    0
  );

  const submitSales = async () => {
    if (!dealer?.dealer_id) {
      toast.error(t("sales.errors.noDealer"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("sales.errors.emptyCart"));
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await fetch("/api/verkauf-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealer_id: dealer.dealer_id,
          items,
          calendar_week: calendarWeek,
          sony_share_qty: sonyShareQty,
          sony_share_revenue: sonyShareRevenue,
          stock_total: stockTotal,
        }),
      });

      if (!res.ok) {
        throw new Error(t("sales.page.serverError"));
      }

      setSuccess(true);
      toast.success(t("sales.page.saved"));
      clearCart("verkauf");
    } catch (err: any) {
      toast.error(t("sales.page.saveError"), {
        description: err?.message || t("sales.page.serverError"),
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingDealer) {
    return <p className="p-4 text-gray-500">{t("sales.loading.dealer")}</p>;
  }

  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[650px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            {t("sales.cart.title")}
          </SheetTitle>
        </SheetHeader>

        {dealer && (
          <div className="mb-4 text-xs">
            <div className="font-semibold text-gray-800">
              {dealer.store_name ?? dealer.company_name ?? dealer.name}
            </div>

            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
              <div>
                {t("sales.cart.dealer.customerNo")}: <b>{dealer.login_nr}</b>
              </div>
              <div>
                {t("sales.cart.dealer.contact")}:{" "}
                <b>{dealer.contact_person}</b>
              </div>
              <div>
                {t("sales.cart.dealer.phone")}: <b>{dealer.phone}</b>
              </div>
              <div>
                {t("sales.cart.dealer.email")}: <b>{dealer.mail_dealer}</b>
              </div>
              <div>
                {t("sales.cart.dealer.city")}:{" "}
                <b>{[dealer.zip, dealer.city].filter(Boolean).join(" ")}</b>
              </div>
              <div>
                {t("sales.cart.dealer.kam")}: <b>{dealer.kam_name}</b>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
             {t("sales.cart.reportedProducts")}
          </div>

          {items.length === 0 ? (
            <div className="p-3 text-xs text-gray-500">
              {t("sales.errors.emptyCart")}
            </div>
          ) : (
            <div className="divide-y max-h-[320px] overflow-y-auto">
              {items.map((item: any, index: number) => {
                const quantity = Number(item.quantity ?? item.menge ?? 0);
                const stockQuantity = Number(
                  item.stock_quantity ?? item.stockQuantity ?? 0
                );
                const price = item.price ?? item.preis ?? null;

                return (
                  <div key={index} className="p-3 text-xs">
                    <div className="font-semibold text-gray-900">
                      {item.product_name || item.sony_article || "-"}
                    </div>

                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                      <div>
                        {t("sales.cart.item.ean")}: <b>{item.ean || "-"}</b>
                      </div>

                      <div>
                        {t("sales.cart.item.sale")}: <b>{quantity}</b>
                      </div>

                      <div>
                        {t("sales.cart.item.stock")}: <b>{stockQuantity}</b>
                      </div>

                      <div>
                        {t("sales.cart.item.price")}:{" "}
                        <b>
                          {price !== null && price !== undefined && price !== ""
                            ? `CHF ${Number(price).toFixed(2)}`
                            : "-"}
                        </b>
                      </div>

                      <div>
                        {t("sales.cart.item.serialNumber")}:{" "}
                        <b>{item.seriennummer || item.serial || "-"}</b>
                      </div>

                      <div>
                        {t("sales.cart.item.stockDate")}:{" "}
                        <b>{item.stock_date || item.stockDate || "-"}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {items.length > 0 && (
            <div className="bg-gray-50 px-3 py-2 text-xs text-gray-700 grid grid-cols-2 gap-2">
              <div>
                {t("sales.cart.totalSale")}: <b>{salesTotal}</b>
              </div>

              <div>
                {t("sales.cart.totalStock")}: <b>{stockTotal}</b>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-600">
              {t("sales.cart.sonyShareQty")}
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={sonyShareQty}
              onChange={(e) => setSonyShareQty(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">
              {t("sales.cart.sonyShareRevenue")}
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={sonyShareRevenue}
              onChange={(e) => setSonyShareRevenue(Number(e.target.value))}
            />
          </div>
        </div>

        <Button
          className="mt-auto bg-green-600 text-white"
          onClick={submitSales}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? t("sales.cart.saving") : t("sales.cart.submit")}
        </Button>

        {success && (
          <SheetClose asChild>
            <Button className="mt-4 w-full bg-green-700 text-white">
              {t("sales.cart.close")}
            </Button>
          </SheetClose>
        )}
      </SheetContent>
    </Sheet>
  );
}