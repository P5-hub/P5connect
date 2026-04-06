import { calcNettoUPE } from "@/lib/helpers/calcHelpers";

export type CampaignPriceMode = "standard" | "messe" | "display";

export type CampaignPriceInput = {
  upe_brutto: number;
  dealer_invoice_price?: number | null;
  vrg_amount?: number | null;
  mwst_rate?: number | null;
  mode: CampaignPriceMode;
  messe_price_netto?: number | null;
  display_factor_percent?: number | null;
};

export type CampaignPriceResult = {
  upe_netto_excl_vrg: number | null;
  display_price_netto: number | null;
  messe_price_netto: number | null;
  final_unit_price: number;
  display_discount_vs_hrp_percent: number | null;
};

const round2 = (value: number) => Number(value.toFixed(2));

export function calcCampaignPrice(
  input: CampaignPriceInput
): CampaignPriceResult {
  const vrgAmount = input.vrg_amount ?? 0;
  const hrp = input.dealer_invoice_price ?? null;

  const upe_netto_excl_vrg =
    input.upe_brutto > 0 ? calcNettoUPE(input.upe_brutto, vrgAmount) : null;

  const display_price_netto =
    input.display_factor_percent != null
      ? round2(input.upe_brutto * (input.display_factor_percent / 100))
      : null;

  const messe_price_netto =
    input.messe_price_netto != null
      ? round2(input.messe_price_netto)
      : null;

  let final_unit_price = hrp ?? 0;

  if (input.mode === "display" && display_price_netto != null) {
    final_unit_price = display_price_netto;
  }

  if (input.mode === "messe" && messe_price_netto != null) {
    final_unit_price = messe_price_netto;
  }

  const display_discount_vs_hrp_percent =
    display_price_netto != null && hrp != null && hrp > 0
      ? round2(((hrp - display_price_netto) / hrp) * 100)
      : null;

  return {
    upe_netto_excl_vrg,
    display_price_netto,
    messe_price_netto,
    final_unit_price,
    display_discount_vs_hrp_percent,
  };
}