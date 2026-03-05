// 오픈마켓 수수료 계산 엔진
// 모든 금액은 원(₩) 단위, Math.floor로 원 단위 절사

import {
  SMARTSTORE,
  COUPANG,
  ELEVENST,
  GMARKET,
  type CategoryKey,
  type SmartStoreTier,
  type SmartStoreSource,
  type CoupangMode,
  type FulfillmentSize,
  type MarketKey,
} from "@/data/marketFees";
import {
  sanitizeSmartStoreInput,
  sanitizeCoupangInput,
  sanitizeSimpleMarketInput,
  sanitizeCompareCalcInput,
  sanitizeMonthlyQty,
} from "@/lib/validators";

// 마켓별 수수료 계산 결과 (개별 항목 분리)
export interface FeeBreakdown {
  marketKey: MarketKey;
  totalFee: number;      // 총 수수료 (원)
  totalFeeRate: number;  // 총 수수료율 (0~1)
  netProfit: number;     // 순이익 (판매가 - 수수료)
  items: FeeItem[];      // 수수료 항목별 내역
}

export interface FeeItem {
  label: string;
  amount: number;
  rate?: number;  // 해당 항목의 요율 (표시용)
}

// 스마트스토어 계산 입력
export interface SmartStoreInput {
  price: number;
  shippingFee: number;
  tier: SmartStoreTier;
  source: SmartStoreSource;
}

// 쿠팡 계산 입력
export interface CoupangInput {
  price: number;
  category: CategoryKey;
  mode: CoupangMode;
  fulfillmentSize: FulfillmentSize;
}

// 11번가/G마켓 계산 입력
export interface SimpleMarketInput {
  price: number;
  shippingFee: number;
  category: CategoryKey;
}

// 전체 비교 입력
export interface CompareInput {
  price: number;
  shippingFee: number;
  category: CategoryKey;
  smartstoreTier: SmartStoreTier;
  smartstoreSource: SmartStoreSource;
  coupangMode: CoupangMode;
  fulfillmentSize: FulfillmentSize;
}

// 스마트스토어 수수료 계산
export function calcSmartStore(input: SmartStoreInput): FeeBreakdown {
  const { price, shippingFee, tier, source } = sanitizeSmartStoreInput(input);
  const items: FeeItem[] = [];

  // 1. 주문관리 수수료 (상품가에 대해)
  const orderFeeRate = SMARTSTORE.orderFee[tier];
  const orderFee = Math.floor(price * orderFeeRate);
  items.push({ label: "주문관리 수수료", amount: orderFee, rate: orderFeeRate });

  // 2. 판매 수수료 (VAT 별도이므로 ×1.1)
  const saleFeeRate = SMARTSTORE.saleFee[source];
  const saleFeeWithVat = saleFeeRate * 1.1;
  const saleFee = Math.floor(price * saleFeeWithVat);
  items.push({ label: "판매 수수료", amount: saleFee, rate: saleFeeWithVat });

  // 3. 배송비 주문관리 수수료 (배송비 × 주문관리 요율)
  const shippingOrderFee = Math.floor(shippingFee * orderFeeRate);
  if (shippingOrderFee > 0) {
    items.push({ label: "배송비 수수료", amount: shippingOrderFee, rate: orderFeeRate });
  }

  const totalFee = items.reduce((sum, item) => sum + item.amount, 0);
  const totalFeeRate = price > 0 ? totalFee / price : 0;

  return {
    marketKey: "smartstore",
    totalFee,
    totalFeeRate,
    netProfit: price - totalFee,
    items,
  };
}

// 쿠팡 수수료 계산
export function calcCoupang(input: CoupangInput): FeeBreakdown {
  const { price, category, mode, fulfillmentSize } = sanitizeCoupangInput(input);
  const items: FeeItem[] = [];

  // 1. 카테고리별 판매 수수료
  const categoryFeeRate = COUPANG.categoryFee[category];
  const categoryFee = Math.floor(price * categoryFeeRate);
  items.push({ label: "판매 수수료", amount: categoryFee, rate: categoryFeeRate });

  // 2. 로켓그로스 물류비 (건당 고정)
  if (mode === "rocketGrowth") {
    const fulfillmentFee = COUPANG.fulfillmentFee[fulfillmentSize];
    items.push({ label: "물류비", amount: fulfillmentFee });
  }

  const totalFee = items.reduce((sum, item) => sum + item.amount, 0);
  const totalFeeRate = price > 0 ? totalFee / price : 0;

  return {
    marketKey: "coupang",
    totalFee,
    totalFeeRate,
    netProfit: price - totalFee,
    items,
  };
}

// 11번가 수수료 계산
export function calcElevenSt(input: SimpleMarketInput): FeeBreakdown {
  const { price, shippingFee, category } = sanitizeSimpleMarketInput(input);
  const items: FeeItem[] = [];

  // 1. 카테고리별 판매 수수료
  const categoryFeeRate = ELEVENST.categoryFee[category];
  const categoryFee = Math.floor(price * categoryFeeRate);
  items.push({ label: "판매 수수료", amount: categoryFee, rate: categoryFeeRate });

  // 2. 배송비 수수료 (유료배송 시 3.3%)
  const shippingFeeAmount = Math.floor(shippingFee * ELEVENST.shippingFeeRate);
  if (shippingFeeAmount > 0) {
    items.push({ label: "배송비 수수료", amount: shippingFeeAmount, rate: ELEVENST.shippingFeeRate });
  }

  const totalFee = items.reduce((sum, item) => sum + item.amount, 0);
  const totalFeeRate = price > 0 ? totalFee / price : 0;

  return {
    marketKey: "elevenst",
    totalFee,
    totalFeeRate,
    netProfit: price - totalFee,
    items,
  };
}

// G마켓/옥션 수수료 계산
export function calcGmarket(input: SimpleMarketInput): FeeBreakdown {
  const { price, shippingFee, category } = sanitizeSimpleMarketInput(input);
  const items: FeeItem[] = [];

  // 1. 카테고리별 판매 수수료
  const categoryFeeRate = GMARKET.categoryFee[category];
  const categoryFee = Math.floor(price * categoryFeeRate);
  items.push({ label: "판매 수수료", amount: categoryFee, rate: categoryFeeRate });

  // 2. 배송비 수수료 (유료배송 시 3.3%)
  const shippingFeeAmount = Math.floor(shippingFee * GMARKET.shippingFeeRate);
  if (shippingFeeAmount > 0) {
    items.push({ label: "배송비 수수료", amount: shippingFeeAmount, rate: GMARKET.shippingFeeRate });
  }

  const totalFee = items.reduce((sum, item) => sum + item.amount, 0);
  const totalFeeRate = price > 0 ? totalFee / price : 0;

  return {
    marketKey: "gmarket",
    totalFee,
    totalFeeRate,
    netProfit: price - totalFee,
    items,
  };
}

// 4개 마켓 한번에 비교 계산
export function calcAllMarkets(input: CompareInput): FeeBreakdown[] {
  const {
    price,
    shippingFee,
    category,
    smartstoreTier,
    smartstoreSource,
    coupangMode,
    fulfillmentSize,
  } = sanitizeCompareCalcInput(input);

  return [
    calcSmartStore({ price, shippingFee, tier: smartstoreTier, source: smartstoreSource }),
    calcCoupang({ price, category, mode: coupangMode, fulfillmentSize }),
    calcElevenSt({ price, shippingFee, category }),
    calcGmarket({ price, shippingFee, category }),
  ];
}

// 가장 유리한 마켓 찾기
export function findBestMarket(results: FeeBreakdown[]): FeeBreakdown | null {
  if (results.length === 0) return null;
  return results.reduce((best, current) =>
    current.netProfit > best.netProfit ? current : best
  );
}

// 월간/연간 시뮬레이션
export interface MonthlySimResult {
  marketKey: MarketKey;
  monthlyFee: number;
  monthlyProfit: number;
  annualFee: number;
  annualDiff: number;  // 최저 마켓 대비 차이 (양수 = 더 비쌈)
}

export function calcMonthlySim(
  results: FeeBreakdown[],
  monthlyQty: number
): MonthlySimResult[] {
  const validatedQty = sanitizeMonthlyQty(monthlyQty);
  const simResults = results.map((r) => ({
    marketKey: r.marketKey,
    monthlyFee: r.totalFee * validatedQty,
    monthlyProfit: r.netProfit * validatedQty,
    annualFee: r.totalFee * validatedQty * 12,
    annualDiff: 0,
  }));

  // 최저 연 수수료 기준으로 차이 계산
  const minAnnualFee = Math.min(...simResults.map((s) => s.annualFee));
  for (const sim of simResults) {
    sim.annualDiff = sim.annualFee - minAnnualFee;
  }

  return simResults;
}
