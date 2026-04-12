"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Search,
  Copy,
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
  dealer_id: string;
  target_value: string;
  target_unit: TargetUnit;
  current_value: string;
};

type BonusTierRow = {
  dealer_id: string;
  tier_level: string;
  threshold_value: string;
  bonus_type: BonusType;
  bonus_value: string;
  label: string;
};

function emptyCampaignProduct(): CampaignProductRow {
  return {
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
    dealer_id: "",
    target_value: "",
    target_unit: "qty",
    current_value: "0",
  };
}

function emptyBonusTier(): BonusTierRow {
  return {
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

export default function PromotionsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [dealers, setDealers] = useState<DealerOption[]>([]);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CampaignType | "alle">("alle");
  const [statusFilter, setStatusFilter] = useState<"alle" | "aktiv" | "inaktiv">("alle");

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

  const [campaignProducts, setCampaignProducts] = useState<CampaignProductRow[]>([
    emptyCampaignProduct(),
  ]);
  const [dealerTargets, setDealerTargets] = useState<DealerTargetRow[]>([]);
  const [bonusTiers, setBonusTiers] = useState<BonusTierRow[]>([]);

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      description: "",
      campaign_type: "promotion",
      start_date: "",
      end_date: "",
      active: true,
      allow_display_orders: false,
    });
    setCampaignProducts([emptyCampaignProduct()]);
    setDealerTargets([]);
    setBonusTiers([]);
    setMessage(null);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: campaignsData, error: campaignsError },
        { data: productsData, error: productsError },
        { data: dealersData, error: dealersError },
      ] = await Promise.all([
        supabase
          .from("campaigns")
          .select(
            "campaign_id, code, name, description, campaign_type, start_date, end_date, active, allow_display_orders, created_at"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("product_id, product_name, brand, ean, category, gruppe")
          .eq("active", true)
          .order("product_name", { ascending: true }),
        supabase
          .from("dealers")
          .select("dealer_id, name, email")
          .order("name", { ascending: true }),
      ]);

      if (campaignsError) throw campaignsError;
      if (productsError) throw productsError;
      if (dealersError) throw dealersError;

      setCampaigns((campaignsData ?? []) as CampaignRow[]);
      setProducts((productsData ?? []) as ProductOption[]);
      setDealers((dealersData ?? []) as DealerOption[]);
    } catch (error) {
      console.error("❌ Fehler beim Laden:", error);
      setMessage({
        type: "error",
        text: t("adminPromotions.messages.loadError"),
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
      prev.length === 1 ? [emptyCampaignProduct()] : prev.filter((_, i) => i !== index)
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
    if (!form.name.trim()) return t("adminPromotions.validation.nameRequired");
    if (!form.start_date) return t("adminPromotions.validation.startDateRequired");
    if (!form.end_date) return t("adminPromotions.validation.endDateRequired");
    if (form.end_date < form.start_date) {
      return t("adminPromotions.validation.endBeforeStart");
    }

    const selectedProducts = campaignProducts.filter((p) => p.product_id);
    if (selectedProducts.length === 0) {
      return t("adminPromotions.validation.productRequired");
    }

    const ids = selectedProducts.map((p) => p.product_id);
    if (new Set(ids).size !== ids.length) {
      return t("adminPromotions.validation.duplicateProduct");
    }

    const filledTargets = dealerTargets.filter((row) => row.dealer_id || row.target_value);
    for (const row of filledTargets) {
      if (!row.dealer_id) return t("adminPromotions.validation.targetDealerMissing");
      if (toRequiredNumber(row.target_value) == null) {
        return t("adminPromotions.validation.targetValueInvalid");
      }
    }

    const targetDealerIds = filledTargets.map((row) => row.dealer_id);
    if (new Set(targetDealerIds).size !== targetDealerIds.length) {
      return t("adminPromotions.validation.targetDealerDuplicate");
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
      if (!row.tier_level) return t("adminPromotions.validation.tierLevelMissing");
      if (toRequiredNumber(row.threshold_value) == null) {
        return t("adminPromotions.validation.thresholdInvalid");
      }
      if (toRequiredNumber(row.bonus_value) == null) {
        return t("adminPromotions.validation.bonusValueInvalid");
      }
    }

    const tierKeys = filledTiers.map(
      (row) => `${row.dealer_id || "global"}__${row.tier_level}`
    );
    if (new Set(tierKeys).size !== tierKeys.length) {
      return t("adminPromotions.validation.duplicateTier");
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
    let newCampaignId: number | null = null;

    try {
      const { data: campaignInsert, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          code: form.code.trim() || null,
          name: form.name.trim(),
          description: form.description.trim() || null,
          campaign_type: form.campaign_type,
          start_date: form.start_date,
          end_date: form.end_date,
          active: form.active,
          allow_display_orders: form.allow_display_orders,
        })
        .select("campaign_id")
        .single();

      if (campaignError) throw campaignError;

      newCampaignId = campaignInsert.campaign_id;

      const productPayload = campaignProducts
        .filter((row) => row.product_id)
        .map((row) => ({
          campaign_id: newCampaignId,
          product_id: Number(row.product_id),
          active: row.active,
          pricing_mode: row.pricing_mode,
          messe_price_netto: toNullableNumber(row.messe_price_netto),
          display_discount_percent: toNullableNumber(row.display_discount_percent),
          display_price_netto: toNullableNumber(row.display_price_netto),
          bonus_relevant: row.bonus_relevant,
          max_qty_per_dealer: toNullableNumber(row.max_qty_per_dealer),
          max_total_qty_per_dealer: toNullableNumber(row.max_total_qty_per_dealer),
          max_display_qty_per_dealer: toNullableNumber(row.max_display_qty_per_dealer),
          max_messe_qty_per_dealer: toNullableNumber(row.max_messe_qty_per_dealer),
          notes: row.notes.trim() || null,
        }));

      if (productPayload.length > 0) {
        const { error } = await supabase.from("campaign_products").insert(productPayload);
        if (error) throw error;
      }

      const targetPayload = dealerTargets
        .filter((row) => row.dealer_id && row.target_value)
        .map((row) => ({
          campaign_id: newCampaignId,
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
          campaign_id: newCampaignId,
          dealer_id: row.dealer_id ? Number(row.dealer_id) : null,
          tier_level: Number(row.tier_level),
          threshold_value: Number(row.threshold_value.replace(",", ".")),
          bonus_type: row.bonus_type,
          bonus_value: Number(row.bonus_value.replace(",", ".")),
          label: row.label.trim() || null,
        }));

      if (tierPayload.length > 0) {
        const { error } = await supabase.from("campaign_bonus_tiers").insert(tierPayload);
        if (error) throw error;
      }

      setMessage({
        type: "success",
        text: t("adminPromotions.messages.saveSuccess"),
      });

      resetForm();
      await loadAll();
    } catch (error: any) {
      console.error("❌ Fehler beim Speichern:", error);

      if (newCampaignId) {
        await supabase.from("campaigns").delete().eq("campaign_id", newCampaignId);
      }

      setMessage({
        type: "error",
        text: error?.message || t("adminPromotions.messages.saveError"),
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaignActive = async (campaignId: number, nextValue: boolean) => {
    try {
      setActionLoadingId(campaignId);

      const { error } = await supabase
        .from("campaigns")
        .update({ active: nextValue })
        .eq("campaign_id", campaignId);

      if (error) throw error;

      setCampaigns((prev) =>
        prev.map((row) =>
          row.campaign_id === campaignId ? { ...row, active: nextValue } : row
        )
      );

      setMessage({
        type: "success",
        text: nextValue
          ? t("adminPromotions.messages.activated")
          : t("adminPromotions.messages.deactivated"),
      });
    } catch (error) {
      console.error("❌ Fehler beim Statuswechsel:", error);
      setMessage({
        type: "error",
        text: t("adminPromotions.messages.statusChangeError"),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const duplicateCampaign = async (campaignId: number) => {
    try {
      setActionLoadingId(campaignId);
      setMessage(null);

      const [
        { data: campaignData, error: campaignError },
        { data: productsData, error: productsError },
        { data: targetsData, error: targetsError },
        { data: tiersData, error: tiersError },
      ] = await Promise.all([
        supabase
          .from("campaigns")
          .select("*")
          .eq("campaign_id", campaignId)
          .single(),
        supabase
          .from("campaign_products")
          .select("*")
          .eq("campaign_id", campaignId),
        supabase
          .from("campaign_dealer_targets")
          .select("*")
          .eq("campaign_id", campaignId),
        supabase
          .from("campaign_bonus_tiers")
          .select("*")
          .eq("campaign_id", campaignId),
      ]);

      if (campaignError) throw campaignError;
      if (productsError) throw productsError;
      if (targetsError) throw targetsError;
      if (tiersError) throw tiersError;

      const original = campaignData as any;

      const duplicateCode = original.code
        ? `${original.code}-COPY-${Date.now()}`
        : null;

      const { data: insertedCampaign, error: insertCampaignError } = await supabase
        .from("campaigns")
        .insert({
          code: duplicateCode,
          name: `${original.name} (${t("adminPromotions.labels.copy")})`,
          description: original.description,
          campaign_type: original.campaign_type,
          start_date: original.start_date,
          end_date: original.end_date,
          active: false,
          allow_display_orders: original.allow_display_orders,
        })
        .select("campaign_id")
        .single();

      if (insertCampaignError) throw insertCampaignError;

      const newCampaignId = insertedCampaign.campaign_id;

      if ((productsData ?? []).length > 0) {
        const productPayload = (productsData ?? []).map((row: any) => ({
          campaign_id: newCampaignId,
          product_id: row.product_id,
          active: row.active,
          pricing_mode: row.pricing_mode,
          messe_price_netto: row.messe_price_netto,
          display_discount_percent: row.display_discount_percent,
          display_price_netto: row.display_price_netto,
          bonus_relevant: row.bonus_relevant,
          max_qty_per_dealer: row.max_qty_per_dealer,
          max_total_qty_per_dealer: row.max_total_qty_per_dealer,
          max_display_qty_per_dealer: row.max_display_qty_per_dealer,
          max_messe_qty_per_dealer: row.max_messe_qty_per_dealer,
          notes: row.notes,
        }));

        const { error } = await supabase.from("campaign_products").insert(productPayload);
        if (error) throw error;
      }

      if ((targetsData ?? []).length > 0) {
        const targetPayload = (targetsData ?? []).map((row: any) => ({
          campaign_id: newCampaignId,
          dealer_id: row.dealer_id,
          target_value: row.target_value,
          target_unit: row.target_unit,
          current_value: row.current_value ?? 0,
        }));

        const { error } = await supabase
          .from("campaign_dealer_targets")
          .insert(targetPayload);
        if (error) throw error;
      }

      if ((tiersData ?? []).length > 0) {
        const tierPayload = (tiersData ?? []).map((row: any) => ({
          campaign_id: newCampaignId,
          dealer_id: row.dealer_id,
          tier_level: row.tier_level,
          threshold_value: row.threshold_value,
          bonus_type: row.bonus_type,
          bonus_value: row.bonus_value,
          label: row.label,
        }));

        const { error } = await supabase.from("campaign_bonus_tiers").insert(tierPayload);
        if (error) throw error;
      }

      setMessage({
        type: "success",
        text: t("adminPromotions.messages.duplicateSuccess"),
      });

      await loadAll();
    } catch (error: any) {
      console.error("❌ Fehler beim Duplizieren:", error);
      setMessage({
        type: "error",
        text: error?.message || t("adminPromotions.messages.duplicateError"),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteCampaign = async (campaignId: number, name: string) => {
    const confirmed = window.confirm(
      t("adminPromotions.messages.confirmDelete", { name })
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(campaignId);
      setMessage(null);

      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("campaign_id", campaignId);

      if (error) throw error;

      setCampaigns((prev) => prev.filter((row) => row.campaign_id !== campaignId));

      setMessage({
        type: "success",
        text: t("adminPromotions.messages.deleteSuccess"),
      });
    } catch (error: any) {
      console.error("❌ Fehler beim Löschen:", error);
      setMessage({
        type: "error",
        text: error?.message || t("adminPromotions.messages.deleteError"),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesSearch =
        !q ||
        [
          campaign.campaign_id,
          campaign.code,
          campaign.name,
          campaign.description,
          campaign.campaign_type,
          campaign.start_date,
          campaign.end_date,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesType =
        typeFilter === "alle" || campaign.campaign_type === typeFilter;

      const matchesStatus =
        statusFilter === "alle" ||
        (statusFilter === "aktiv" && campaign.active) ||
        (statusFilter === "inaktiv" && !campaign.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [campaigns, searchQuery, typeFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {t("adminPromotions.page.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("adminPromotions.page.description")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetForm}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("adminPromotions.actions.reset")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? t("adminPromotions.actions.saving")
              : t("adminPromotions.actions.save")}
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

      <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
        <h3 className="text-base font-semibold mb-4">
          {t("adminPromotions.sections.masterData")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("adminPromotions.fields.code")}
            </label>
            <Input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder={t("adminPromotions.placeholders.code")}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("adminPromotions.fields.name")} *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t("adminPromotions.placeholders.name")}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("adminPromotions.fields.type")} *
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
              <option value="promotion">{t("adminPromotions.types.promotion")}</option>
              <option value="messe">{t("adminPromotions.types.messe")}</option>
              <option value="monatsaktion">{t("adminPromotions.types.monatsaktion")}</option>
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
              {t("adminPromotions.fields.active")}
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
              {t("adminPromotions.fields.allowDisplay")}
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("adminPromotions.fields.startDate")} *
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
              {t("adminPromotions.fields.endDate")} *
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
              {t("adminPromotions.fields.description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder={t("adminPromotions.placeholders.description")}
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
        title={t("adminPromotions.sections.products")}
      />

      <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">
            {t("adminPromotions.sections.dealerTargets")}
          </h3>
          <Button variant="outline" onClick={addDealerTarget}>
            <Plus className="w-4 h-4 mr-2" />
            {t("adminPromotions.actions.addTarget")}
          </Button>
        </div>

        {dealerTargets.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("adminPromotions.empty.noDealerTargets")}
          </p>
        ) : (
          <div className="space-y-3">
            {dealerTargets.map((row, index) => (
              <div
                key={`${row.dealer_id}-${index}`}
                className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-3 rounded-xl border border-gray-200 p-4 bg-gray-50"
              >
                <div className="xl:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.dealer")}
                  </label>
                  <select
                    value={row.dealer_id}
                    onChange={(e) =>
                      updateDealerTarget(index, "dealer_id", e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">{t("adminPromotions.select.pleaseChoose")}</option>
                    {dealers.map((d) => (
                      <option key={d.dealer_id} value={d.dealer_id}>
                        {d.name} {d.email ? `(${d.email})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.targetValue")}
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
                    {t("adminPromotions.fields.unit")}
                  </label>
                  <select
                    value={row.target_unit}
                    onChange={(e) =>
                      updateDealerTarget(index, "target_unit", e.target.value as TargetUnit)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="qty">{t("adminPromotions.units.qty")}</option>
                    <option value="revenue">{t("adminPromotions.units.revenue")}</option>
                    <option value="points">{t("adminPromotions.units.points")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.currentValue")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={row.current_value}
                      onChange={(e) =>
                        updateDealerTarget(index, "current_value", e.target.value)
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
            {t("adminPromotions.sections.bonusTiers")}
          </h3>
          <Button variant="outline" onClick={addBonusTier}>
            <Plus className="w-4 h-4 mr-2" />
            {t("adminPromotions.actions.addBonusTier")}
          </Button>
        </div>

        {bonusTiers.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("adminPromotions.empty.noBonusTiers")}
          </p>
        ) : (
          <div className="space-y-3">
            {bonusTiers.map((row, index) => (
              <div
                key={`${row.dealer_id}-${row.tier_level}-${index}`}
                className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 rounded-xl border border-gray-200 p-4 bg-gray-50"
              >
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.dealerOptional")}
                  </label>
                  <select
                    value={row.dealer_id}
                    onChange={(e) =>
                      updateBonusTier(index, "dealer_id", e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">{t("adminPromotions.labels.global")}</option>
                    {dealers.map((d) => (
                      <option key={d.dealer_id} value={d.dealer_id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.tierLevel")}
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
                    {t("adminPromotions.fields.threshold")}
                  </label>
                  <Input
                    value={row.threshold_value}
                    onChange={(e) =>
                      updateBonusTier(index, "threshold_value", e.target.value)
                    }
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.bonusType")}
                  </label>
                  <select
                    value={row.bonus_type}
                    onChange={(e) =>
                      updateBonusTier(index, "bonus_type", e.target.value as BonusType)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="amount">{t("adminPromotions.bonusTypes.amount")}</option>
                    <option value="percent">{t("adminPromotions.bonusTypes.percent")}</option>
                    <option value="credit">{t("adminPromotions.bonusTypes.credit")}</option>
                    <option value="gift">{t("adminPromotions.bonusTypes.gift")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    {t("adminPromotions.fields.bonusValue")}
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
                    {t("adminPromotions.fields.label")}
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

      <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">
              {t("adminPromotions.sections.existingCampaigns")}
            </h3>
            <Button variant="outline" onClick={loadAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("adminPromotions.actions.reload")}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("adminPromotions.placeholders.search")}
                className="pl-9"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CampaignType | "alle")}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="alle">{t("adminPromotions.filters.allTypes")}</option>
              <option value="promotion">{t("adminPromotions.types.promotion")}</option>
              <option value="messe">{t("adminPromotions.types.messe")}</option>
              <option value="monatsaktion">{t("adminPromotions.types.monatsaktion")}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "alle" | "aktiv" | "inaktiv")}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="alle">{t("adminPromotions.filters.allStatuses")}</option>
              <option value="aktiv">{t("adminPromotions.filters.active")}</option>
              <option value="inaktiv">{t("adminPromotions.filters.inactive")}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">
            {t("adminPromotions.loading.campaigns")}
          </p>
        ) : filteredCampaigns.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("adminPromotions.empty.noCampaigns")}
          </p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.campaign_id}
                className="p-4 rounded-2xl border border-gray-200 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        #{campaign.campaign_id} – {campaign.name}
                      </h4>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          campaign.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {campaign.active
                          ? t("adminPromotions.badges.active")
                          : t("adminPromotions.badges.inactive")}
                      </span>

                      <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700">
                        {campaign.campaign_type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {campaign.code || t("adminPromotions.labels.noCode")}
                    </p>

                    {campaign.description && (
                      <p className="text-sm text-gray-700 mt-2">{campaign.description}</p>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      {campaign.start_date} {t("adminPromotions.labels.to")} {campaign.end_date}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t("adminPromotions.labels.displayOrders")}:{" "}
                      {campaign.allow_display_orders
                        ? t("adminPromotions.labels.yes")
                        : t("adminPromotions.labels.no")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant={campaign.active ? "outline" : "default"}
                      onClick={() =>
                        toggleCampaignActive(campaign.campaign_id, !campaign.active)
                      }
                      disabled={actionLoadingId === campaign.campaign_id}
                    >
                      {campaign.active
                        ? t("adminPromotions.actions.deactivate")
                        : t("adminPromotions.actions.activate")}
                    </Button>

                    <Link href={`/admin/promotions/${campaign.campaign_id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Pencil className="w-4 h-4 mr-2" />
                        {t("adminPromotions.actions.edit")}
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => duplicateCampaign(campaign.campaign_id)}
                      disabled={actionLoadingId === campaign.campaign_id}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t("adminPromotions.actions.duplicate")}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => deleteCampaign(campaign.campaign_id, campaign.name)}
                      disabled={actionLoadingId === campaign.campaign_id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("adminPromotions.actions.delete")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}