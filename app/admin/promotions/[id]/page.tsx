"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import CampaignProductEditor, {
  type CampaignProductRow,
  type PricingMode,
  type ProductOption,
} from "@/components/admin/CampaignProductEditor";
import { useI18n } from "@/lib/i18n/I18nProvider";

type CampaignType = "messe" | "monatsaktion" | "promotion";
type TargetUnit = "qty" | "revenue" | "points";
type BonusType = "amount" | "percent" | "credit" | "gift";

type CampaignRow = {
  campaign_id: number;
  code: string | null;
  name: string;
  description: string | null;
  campaign_type: CampaignType;
  start_date: string;
  end_date: string;
  active: boolean;
  allow_display_orders: boolean;
  created_at: string;
};

type DealerOption = {
  dealer_id: number;
  name: string;
  email: string | null;
};

type DealerTargetRow = {
  local_id: string;
  dealer_id: string;
  target_value: string;
  target_unit: TargetUnit;
  current_value: string;
};

type BonusTierRow = {
  local_id: string;
  dealer_id: string;
  tier_level: string;
  threshold_value: string;
  bonus_type: BonusType;
  bonus_value: string;
  label: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyCampaignProduct(): CampaignProductRow {
  return {
    local_id: uid(),
    product_id: "",
    active: true,
    pricing_mode: "messe",
    messe_price_netto: "",
    display_discount_percent: "",
    display_price_netto: "",
    bonus_relevant: true,
    max_qty_per_dealer: "",
    max_total_qty_per_dealer: "",
    max_display_qty_per_dealer: "",
    max_messe_qty_per_dealer: "",
    notes: "",
  };
}

function emptyDealerTarget(): DealerTargetRow {
  return {
    local_id: uid(),
    dealer_id: "",
    target_value: "",
    target_unit: "qty",
    current_value: "0",
  };
}

function emptyBonusTier(): BonusTierRow {
  return {
    local_id: uid(),
    dealer_id: "",
    tier_level: "",
    threshold_value: "",
    bonus_type: "amount",
    bonus_value: "",
    label: "",
  };
}

function toNullableNumber(value: string): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

function toRequiredNumber(value: string): number | null {
  const parsed = Number((value || "").replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

function numberToInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export default function PromotionDetailPage() {
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useI18n();

  const campaignId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [dealers, setDealers] = useState<DealerOption[]>([]);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    campaign_type: "promotion" as CampaignType,
    start_date: "",
    end_date: "",
    active: true,
    allow_display_orders: false,
  });

  const [originalForm, setOriginalForm] = useState({
    code: "",
    name: "",
    description: "",
    campaign_type: "promotion" as CampaignType,
    start_date: "",
    end_date: "",
    active: true,
    allow_display_orders: false,
  });

  const [campaignProducts, setCampaignProducts] = useState<CampaignProductRow[]>(
    [emptyCampaignProduct()]
  );
  const [dealerTargets, setDealerTargets] = useState<DealerTargetRow[]>([]);
  const [bonusTiers, setBonusTiers] = useState<BonusTierRow[]>([]);

  const loadAll = useCallback(async () => {
    if (!campaignId || Number.isNaN(campaignId)) {
      setMessage({
        type: "error",
        text: t("adminPromotionDetail.page.invalidId"),
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const [
        { data: campaignData, error: campaignError },
        { data: productsData, error: productsError },
        { data: dealersData, error: dealersError },
        { data: campaignProductsData, error: campaignProductsError },
        { data: dealerTargetsData, error: dealerTargetsError },
        { data: bonusTiersData, error: bonusTiersError },
      ] = await Promise.all([
        supabase
          .from("campaigns")
          .select(
            "campaign_id, code, name, description, campaign_type, start_date, end_date, active, allow_display_orders, created_at"
          )
          .eq("campaign_id", campaignId)
          .single(),
        supabase
          .from("products")
          .select("product_id, product_name, brand, ean, category, gruppe")
          .eq("active", true)
          .order("product_name", { ascending: true }),
        supabase
          .from("dealers")
          .select("dealer_id, name, email")
          .order("name", { ascending: true }),
        supabase
          .from("campaign_products")
          .select(
            "id, product_id, active, pricing_mode, messe_price_netto, display_discount_percent, display_price_netto, bonus_relevant, max_qty_per_dealer, max_total_qty_per_dealer, max_display_qty_per_dealer, max_messe_qty_per_dealer, notes"
          )
          .eq("campaign_id", campaignId)
          .order("id", { ascending: true }),
        supabase
          .from("campaign_dealer_targets")
          .select("id, dealer_id, target_value, target_unit, current_value")
          .eq("campaign_id", campaignId)
          .order("id", { ascending: true }),
        supabase
          .from("campaign_bonus_tiers")
          .select(
            "id, dealer_id, tier_level, threshold_value, bonus_type, bonus_value, label"
          )
          .eq("campaign_id", campaignId)
          .order("tier_level", { ascending: true }),
      ]);

      if (campaignError) throw campaignError;
      if (productsError) throw productsError;
      if (dealersError) throw dealersError;
      if (campaignProductsError) throw campaignProductsError;
      if (dealerTargetsError) throw dealerTargetsError;
      if (bonusTiersError) throw bonusTiersError;

      const campaign = campaignData as CampaignRow;

      const loadedForm = {
        code: campaign.code || "",
        name: campaign.name || "",
        description: campaign.description || "",
        campaign_type: campaign.campaign_type,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        active: campaign.active,
        allow_display_orders: campaign.allow_display_orders,
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm);
      setProducts((productsData ?? []) as ProductOption[]);
      setDealers((dealersData ?? []) as DealerOption[]);

      const mappedCampaignProducts: CampaignProductRow[] =
        (campaignProductsData ?? []).map((row: any) => ({
          local_id: uid(),
          product_id: row.product_id ? String(row.product_id) : "",
          active: row.active ?? true,
          pricing_mode: (row.pricing_mode || "messe") as PricingMode,
          messe_price_netto: numberToInput(row.messe_price_netto),
          display_discount_percent: numberToInput(row.display_discount_percent),
          display_price_netto: numberToInput(row.display_price_netto),
          bonus_relevant: row.bonus_relevant ?? true,
          max_qty_per_dealer: numberToInput(row.max_qty_per_dealer),
          max_total_qty_per_dealer: numberToInput(row.max_total_qty_per_dealer),
          max_display_qty_per_dealer: numberToInput(
            row.max_display_qty_per_dealer
          ),
          max_messe_qty_per_dealer: numberToInput(row.max_messe_qty_per_dealer),
          notes: row.notes || "",
        })) || [];

      setCampaignProducts(
        mappedCampaignProducts.length > 0
          ? mappedCampaignProducts
          : [emptyCampaignProduct()]
      );

      const mappedDealerTargets: DealerTargetRow[] =
        (dealerTargetsData ?? []).map((row: any) => ({
          local_id: uid(),
          dealer_id: row.dealer_id ? String(row.dealer_id) : "",
          target_value: numberToInput(row.target_value),
          target_unit: (row.target_unit || "qty") as TargetUnit,
          current_value: numberToInput(row.current_value ?? 0),
        })) || [];

      setDealerTargets(mappedDealerTargets);

      const mappedBonusTiers: BonusTierRow[] =
        (bonusTiersData ?? []).map((row: any) => ({
          local_id: uid(),
          dealer_id: row.dealer_id ? String(row.dealer_id) : "",
          tier_level: numberToInput(row.tier_level),
          threshold_value: numberToInput(row.threshold_value),
          bonus_type: (row.bonus_type || "amount") as BonusType,
          bonus_value: numberToInput(row.bonus_value),
          label: row.label || "",
        })) || [];

      setBonusTiers(mappedBonusTiers);
    } catch (error) {
      console.error("❌ Fehler beim Laden:", error);
      setMessage({
        type: "error",
        text: t("adminPromotionDetail.messages.loadError"),
      });
    } finally {
      setLoading(false);
    }
  }, [campaignId, supabase, t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetForm = () => {
    setForm(originalForm);
    loadAll();
    setMessage(null);
  };

  const addCampaignProduct = () =>
    setCampaignProducts((prev) => [...prev, emptyCampaignProduct()]);

  const updateCampaignProduct = (
    index: number,
    field: keyof CampaignProductRow,
    value: string | boolean
  ) => {
    setCampaignProducts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeCampaignProduct = (index: number) => {
    setCampaignProducts((prev) =>
      prev.length === 1
        ? [emptyCampaignProduct()]
        : prev.filter((_, i) => i !== index)
    );
  };

  const addDealerTarget = () =>
    setDealerTargets((prev) => [...prev, emptyDealerTarget()]);

  const updateDealerTarget = (
    index: number,
    field: keyof DealerTargetRow,
    value: string
  ) => {
    setDealerTargets((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeDealerTarget = (index: number) => {
    setDealerTargets((prev) => prev.filter((_, i) => i !== index));
  };

  const addBonusTier = () =>
    setBonusTiers((prev) => [...prev, emptyBonusTier()]);

  const updateBonusTier = (
    index: number,
    field: keyof BonusTierRow,
    value: string
  ) => {
    setBonusTiers((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeBonusTier = (index: number) => {
    setBonusTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const validateBeforeSave = () => {
    if (!form.name.trim()) return t("adminPromotionDetail.validation.nameRequired");
    if (!form.start_date) {
      return t("adminPromotionDetail.validation.startDateRequired");
    }
    if (!form.end_date) return t("adminPromotionDetail.validation.endDateRequired");
    if (form.end_date < form.start_date) {
      return t("adminPromotionDetail.validation.endBeforeStart");
    }

    const selectedProducts = campaignProducts.filter((p) => p.product_id);
    if (selectedProducts.length === 0) {
      return t("adminPromotionDetail.validation.productRequired");
    }

    const productIds = selectedProducts.map((p) => p.product_id);
    if (new Set(productIds).size !== productIds.length) {
      return t("adminPromotionDetail.validation.duplicateProduct");
    }

    const filledTargets = dealerTargets.filter(
      (row) => row.dealer_id || row.target_value
    );
    for (const row of filledTargets) {
      if (!row.dealer_id) {
        return t("adminPromotionDetail.validation.targetDealerMissing");
      }
      if (toRequiredNumber(row.target_value) == null) {
        return t("adminPromotionDetail.validation.targetValueInvalid");
      }
    }

    const targetDealerIds = filledTargets.map((row) => row.dealer_id);
    if (new Set(targetDealerIds).size !== targetDealerIds.length) {
      return t("adminPromotionDetail.validation.targetDealerDuplicate");
    }

    const filledTiers = bonusTiers.filter(
      (row) =>
        row.dealer_id ||
        row.tier_level ||
        row.threshold_value ||
        row.bonus_value ||
        row.label
    );

    for (const row of filledTiers) {
      if (!row.tier_level) {
        return t("adminPromotionDetail.validation.tierLevelMissing");
      }
      if (toRequiredNumber(row.threshold_value) == null) {
        return t("adminPromotionDetail.validation.thresholdInvalid");
      }
      if (toRequiredNumber(row.bonus_value) == null) {
        return t("adminPromotionDetail.validation.bonusValueInvalid");
      }
    }

    const tierKeys = filledTiers.map(
      (row) => `${row.dealer_id || "global"}__${row.tier_level}`
    );
    if (new Set(tierKeys).size !== tierKeys.length) {
      return t("adminPromotionDetail.validation.duplicateTier");
    }

    return null;
  };

  const handleSave = async () => {
    setMessage(null);

    const validationError = validateBeforeSave();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);

    try {
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({
          code: form.code.trim() || null,
          name: form.name.trim(),
          description: form.description.trim() || null,
          campaign_type: form.campaign_type,
          start_date: form.start_date,
          end_date: form.end_date,
          active: form.active,
          allow_display_orders: form.allow_display_orders,
        })
        .eq("campaign_id", campaignId);

      if (campaignError) throw campaignError;

      const { error: deleteProductsError } = await supabase
        .from("campaign_products")
        .delete()
        .eq("campaign_id", campaignId);
      if (deleteProductsError) throw deleteProductsError;

      const { error: deleteTargetsError } = await supabase
        .from("campaign_dealer_targets")
        .delete()
        .eq("campaign_id", campaignId);
      if (deleteTargetsError) throw deleteTargetsError;

      const { error: deleteBonusError } = await supabase
        .from("campaign_bonus_tiers")
        .delete()
        .eq("campaign_id", campaignId);
      if (deleteBonusError) throw deleteBonusError;

      const productPayload = campaignProducts
        .filter((row) => row.product_id)
        .map((row) => ({
          campaign_id: campaignId,
          product_id: Number(row.product_id),
          active: row.active,
          pricing_mode: row.pricing_mode,
          messe_price_netto: toNullableNumber(row.messe_price_netto),
          display_discount_percent: toNullableNumber(
            row.display_discount_percent
          ),
          display_price_netto: toNullableNumber(row.display_price_netto),
          bonus_relevant: row.bonus_relevant,
          max_qty_per_dealer: toNullableNumber(row.max_qty_per_dealer),
          max_total_qty_per_dealer: toNullableNumber(
            row.max_total_qty_per_dealer
          ),
          max_display_qty_per_dealer: toNullableNumber(
            row.max_display_qty_per_dealer
          ),
          max_messe_qty_per_dealer: toNullableNumber(
            row.max_messe_qty_per_dealer
          ),
          notes: row.notes.trim() || null,
        }));

      if (productPayload.length > 0) {
        const { error } = await supabase
          .from("campaign_products")
          .insert(productPayload);
        if (error) throw error;
      }

      const targetPayload = dealerTargets
        .filter((row) => row.dealer_id && row.target_value)
        .map((row) => ({
          campaign_id: campaignId,
          dealer_id: Number(row.dealer_id),
          target_value: Number(row.target_value.replace(",", ".")),
          target_unit: row.target_unit,
          current_value: Number((row.current_value || "0").replace(",", ".")),
        }));

      if (targetPayload.length > 0) {
        const { error } = await supabase
          .from("campaign_dealer_targets")
          .insert(targetPayload);
        if (error) throw error;
      }

      const tierPayload = bonusTiers
        .filter((row) => row.tier_level && row.threshold_value && row.bonus_value)
        .map((row) => ({
          campaign_id: campaignId,
          dealer_id: row.dealer_id ? Number(row.dealer_id) : null,
          tier_level: Number(row.tier_level),
          threshold_value: Number(row.threshold_value.replace(",", ".")),
          bonus_type: row.bonus_type,
          bonus_value: Number(row.bonus_value.replace(",", ".")),
          label: row.label.trim() || null,
        }));

      if (tierPayload.length > 0) {
        const { error } = await supabase
          .from("campaign_bonus_tiers")
          .insert(tierPayload);
        if (error) throw error;
      }

      setMessage({
        type: "success",
        text: t("adminPromotionDetail.messages.saveSuccess"),
      });

      await loadAll();
    } catch (error: any) {
      console.error("❌ Fehler beim Speichern:", error);
      setMessage({
        type: "error",
        text: error?.message || t("adminPromotionDetail.messages.saveError"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!campaignId || Number.isNaN(campaignId)) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          {t("adminPromotionDetail.page.invalidId")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/promotions">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("adminPromotionDetail.actions.back")}
            </Button>
          </Link>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {t("adminPromotionDetail.page.title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("adminPromotionDetail.page.subtitle", { id: String(campaignId) })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={loading || saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("adminPromotionDetail.actions.reload")}
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? t("adminPromotionDetail.actions.saving")
              : t("adminPromotionDetail.actions.save")}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
          <p className="text-sm text-gray-500">
            {t("adminPromotionDetail.loading.campaign")}
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
            <h3 className="text-base font-semibold mb-4">
              {t("adminPromotionDetail.sections.masterData")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t("adminPromotionDetail.fields.code")}
                </label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder={t("adminPromotionDetail.placeholders.code")}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t("adminPromotionDetail.fields.name")} *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t("adminPromotionDetail.placeholders.name")}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t("adminPromotionDetail.fields.type")} *
                </label>
                <select
                  value={form.campaign_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      campaign_type: e.target.value as CampaignType,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="promotion">
                    {t("adminPromotions.types.promotion")}
                  </option>
                  <option value="messe">{t("adminPromotions.types.messe")}</option>
                  <option value="monatsaktion">
                    {t("adminPromotions.types.monatsaktion")}
                  </option>
                </select>
              </div>

              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, active: e.target.checked }))
                    }
                  />
                  {t("adminPromotionDetail.fields.active")}
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.allow_display_orders}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        allow_display_orders: e.target.checked,
                      }))
                    }
                  />
                  {t("adminPromotionDetail.fields.allowDisplay")}
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t("adminPromotionDetail.fields.startDate")} *
                </label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t("adminPromotionDetail.fields.endDate")} *
                </label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2 xl:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">
                  {t("adminPromotionDetail.fields.description")}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t("adminPromotionDetail.placeholders.description")}
                  className="w-full min-h-[42px] border rounded-md px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>
          </Card>

          <CampaignProductEditor
            products={products}
            rows={campaignProducts}
            onAdd={addCampaignProduct}
            onRemove={removeCampaignProduct}
            onUpdate={updateCampaignProduct}
            title={t("adminPromotionDetail.sections.products")}
          />

          <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">
                {t("adminPromotionDetail.sections.dealerTargets")}
              </h3>
              <Button variant="outline" onClick={addDealerTarget}>
                <Plus className="w-4 h-4 mr-2" />
                {t("adminPromotionDetail.actions.addTarget")}
              </Button>
            </div>

            {dealerTargets.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("adminPromotionDetail.empty.noDealerTargets")}
              </p>
            ) : (
              <div className="space-y-3">
                {dealerTargets.map((row, index) => (
                  <div
                    key={row.local_id}
                    className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-3 rounded-xl border border-gray-200 p-4 bg-gray-50"
                  >
                    <div className="xl:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.dealer")}
                      </label>
                      <select
                        value={row.dealer_id}
                        onChange={(e) =>
                          updateDealerTarget(index, "dealer_id", e.target.value)
                        }
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="">
                          {t("adminPromotionDetail.select.pleaseChoose")}
                        </option>
                        {dealers.map((d) => (
                          <option key={d.dealer_id} value={d.dealer_id}>
                            {d.name} {d.email ? `(${d.email})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.targetValue")}
                      </label>
                      <Input
                        value={row.target_value}
                        onChange={(e) =>
                          updateDealerTarget(index, "target_value", e.target.value)
                        }
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.unit")}
                      </label>
                      <select
                        value={row.target_unit}
                        onChange={(e) =>
                          updateDealerTarget(
                            index,
                            "target_unit",
                            e.target.value as TargetUnit
                          )
                        }
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="qty">{t("adminPromotions.units.qty")}</option>
                        <option value="revenue">
                          {t("adminPromotions.units.revenue")}
                        </option>
                        <option value="points">
                          {t("adminPromotions.units.points")}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.currentValue")}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={row.current_value}
                          onChange={(e) =>
                            updateDealerTarget(
                              index,
                              "current_value",
                              e.target.value
                            )
                          }
                          placeholder="0"
                        />
                        <Button
                          variant="ghost"
                          onClick={() => removeDealerTarget(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">
                {t("adminPromotionDetail.sections.bonusTiers")}
              </h3>
              <Button variant="outline" onClick={addBonusTier}>
                <Plus className="w-4 h-4 mr-2" />
                {t("adminPromotionDetail.actions.addBonusTier")}
              </Button>
            </div>

            {bonusTiers.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("adminPromotionDetail.empty.noBonusTiers")}
              </p>
            ) : (
              <div className="space-y-3">
                {bonusTiers.map((row, index) => (
                  <div
                    key={row.local_id}
                    className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 rounded-xl border border-gray-200 p-4 bg-gray-50"
                  >
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.dealerOptional")}
                      </label>
                      <select
                        value={row.dealer_id}
                        onChange={(e) =>
                          updateBonusTier(index, "dealer_id", e.target.value)
                        }
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="">
                          {t("adminPromotionDetail.select.global")}
                        </option>
                        {dealers.map((d) => (
                          <option key={d.dealer_id} value={d.dealer_id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.tierLevel")}
                      </label>
                      <Input
                        value={row.tier_level}
                        onChange={(e) =>
                          updateBonusTier(index, "tier_level", e.target.value)
                        }
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.threshold")}
                      </label>
                      <Input
                        value={row.threshold_value}
                        onChange={(e) =>
                          updateBonusTier(
                            index,
                            "threshold_value",
                            e.target.value
                          )
                        }
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.bonusType")}
                      </label>
                      <select
                        value={row.bonus_type}
                        onChange={(e) =>
                          updateBonusTier(
                            index,
                            "bonus_type",
                            e.target.value as BonusType
                          )
                        }
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="amount">
                          {t("adminPromotions.bonusTypes.amount")}
                        </option>
                        <option value="percent">
                          {t("adminPromotions.bonusTypes.percent")}
                        </option>
                        <option value="credit">
                          {t("adminPromotions.bonusTypes.credit")}
                        </option>
                        <option value="gift">
                          {t("adminPromotions.bonusTypes.gift")}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.bonusValue")}
                      </label>
                      <Input
                        value={row.bonus_value}
                        onChange={(e) =>
                          updateBonusTier(index, "bonus_value", e.target.value)
                        }
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        {t("adminPromotionDetail.fields.label")}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={row.label}
                          onChange={(e) =>
                            updateBonusTier(index, "label", e.target.value)
                          }
                          placeholder="Gold"
                        />
                        <Button
                          variant="ghost"
                          onClick={() => removeBonusTier(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}