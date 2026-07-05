export type DealerPricingGroupLike = {
  pricing_group_id?: number | null;
  code?: string | null;
  name?: string | null;
};

export type BestpriceFactorResult = {
  groupCode: string;
  groupName: string;
  discountPercent: number;
  factor: number;
};

const MWST_FACTOR = 1.081;

const BESTPRICE_FACTORS_BY_GROUP_CODE: Record<
  string,
  {
    discountPercent: number;
    factor: number;
  }
> = {
  p5_partner: {
    discountPercent: 22,
    factor: 0.78,
  },
  pro_audio: {
    discountPercent: 16,
    factor: 0.84,
  },
  pro_photo: {
    discountPercent: 16,
    factor: 0.84,
  },
  hybrid: {
    discountPercent: 10,
    factor: 0.9,
  },
  offline_retail: {
    discountPercent: 16,
    factor: 0.84,
  },
  online_retail: {
    discountPercent: 6,
    factor: 0.94,
  },
  standard: {
    discountPercent: 16,
    factor: 0.84,
  },
};

const DEFAULT_BESTPRICE_FACTOR: BestpriceFactorResult = {
  groupCode: "standard",
  groupName: "Standard",
  discountPercent: 16,
  factor: 0.84,
};

const round2 = (value: number) => Number(value.toFixed(2));

export function getBestpriceFactorForGroupCode(
  groupCode: string | null | undefined,
  groupName?: string | null
): BestpriceFactorResult {
  const code = String(groupCode ?? "").trim().toLowerCase();

  const config = BESTPRICE_FACTORS_BY_GROUP_CODE[code];

  if (!config) {
    return DEFAULT_BESTPRICE_FACTOR;
  }

  return {
    groupCode: code,
    groupName: groupName || code,
    discountPercent: config.discountPercent,
    factor: config.factor,
  };
}

export function getBestpriceFactorFromDealerGroups(
  dealerGroups: DealerPricingGroupLike[] | null | undefined
): BestpriceFactorResult {
  if (!dealerGroups || dealerGroups.length === 0) {
    return DEFAULT_BESTPRICE_FACTOR;
  }

  const validGroups = dealerGroups
    .map((group) =>
      getBestpriceFactorForGroupCode(group.code, group.name)
    )
    .filter((group) => group.factor > 0);

  if (validGroups.length === 0) {
    return DEFAULT_BESTPRICE_FACTOR;
  }

  // Falls ein Händler aus irgendeinem Grund mehrere Gruppen hat:
  // nimm den besten Satz für den Händler, also den tiefsten Faktor.
  return validGroups.sort((a, b) => a.factor - b.factor)[0];
}

export function calcBestpriceEkFromMarketPrice({
  marketPriceGross,
  factor,
}: {
  marketPriceGross: number;
  factor: number;
}) {
  if (!marketPriceGross || marketPriceGross <= 0) return 0;

  return round2((marketPriceGross / MWST_FACTOR) * factor);
}

export function parseMoneyInput(value: string) {
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getBestpriceMwstFactor() {
  return MWST_FACTOR;
}