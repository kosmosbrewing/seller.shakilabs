// 2025.06 기준 오픈마켓 4개 수수료 데이터
// 마켓별 수수료 구조가 다르므로 타입을 분리

export type CategoryKey = "clothing" | "food" | "electronics" | "living" | "beauty";
export type SmartStoreTier = "micro" | "small" | "normal";
export type SmartStoreSource = "naverShopping" | "marketingLink";
export type CoupangMode = "marketplace" | "rocketGrowth";
export type FulfillmentSize = "small" | "medium" | "large";

export type MarketKey = "smartstore" | "coupang" | "elevenst" | "gmarket";

export interface MarketMeta {
  key: MarketKey;
  name: string;
  shortName: string;
  color: string;
}

// 마켓 메타 정보
export const MARKET_META: Record<MarketKey, MarketMeta> = {
  smartstore: { key: "smartstore", name: "스마트스토어", shortName: "네쇼", color: "#03C75A" },
  coupang: { key: "coupang", name: "쿠팡", shortName: "쿠팡", color: "#E31937" },
  elevenst: { key: "elevenst", name: "11번가", shortName: "11번", color: "#FF6B00" },
  gmarket: { key: "gmarket", name: "G마켓/옥션", shortName: "G마켓", color: "#00B050" },
};

export const MARKET_ORDER: MarketKey[] = ["smartstore", "coupang", "elevenst", "gmarket"];

// 스마트스토어 수수료 (2025.06 개편 반영)
export const SMARTSTORE = {
  // 주문관리 수수료 (매출등급별, VAT 포함)
  orderFee: {
    micro: 0.0198,   // 영세 (연매출 3억 이하)
    small: 0.0275,   // 중소 (연매출 3~30억)
    normal: 0.0363,  // 일반 (연매출 30억 초과)
  } as Record<SmartStoreTier, number>,

  // 판매 수수료 (VAT 별도 → 실제 부담은 ×1.1)
  saleFee: {
    naverShopping: 0.0273,   // 네이버쇼핑 유입
    marketingLink: 0.0091,   // 마케팅 링크 유입 (SNS/블로그)
  } as Record<SmartStoreSource, number>,

  // 배송비에 주문관리 수수료만 적용 (판매 수수료 미적용)
  shippingFeeApplied: "orderFee" as const,
} as const;

// 스마트스토어 매출등급 라벨
export const SMARTSTORE_TIER_LABELS: Record<SmartStoreTier, string> = {
  micro: "영세 (3억 이하)",
  small: "중소 (3~30억)",
  normal: "일반 (30억 초과)",
};

// 스마트스토어 유입 경로 라벨
export const SMARTSTORE_SOURCE_LABELS: Record<SmartStoreSource, string> = {
  naverShopping: "네이버쇼핑",
  marketingLink: "마케팅링크",
};

// 쿠팡 수수료
export const COUPANG = {
  categoryFee: {
    clothing: 0.108,
    food: 0.108,
    electronics: 0.081,
    living: 0.108,
    beauty: 0.108,
  } as Record<CategoryKey, number>,

  // 로켓그로스 물류비 (건당, 크기별)
  fulfillmentFee: {
    small: 1500,   // 소형 (60cm 이하, 2kg 이하)
    medium: 2500,  // 중형 (90cm 이하, 10kg 이하)
    large: 3500,   // 대형 (120cm 이하, 20kg 이하)
  } as Record<FulfillmentSize, number>,
} as const;

// 쿠팡 판매 방식 라벨
export const COUPANG_MODE_LABELS: Record<CoupangMode, string> = {
  marketplace: "마켓플레이스",
  rocketGrowth: "로켓그로스",
};

// 쿠팡 물류 크기 라벨
export const FULFILLMENT_SIZE_LABELS: Record<FulfillmentSize, string> = {
  small: "소형 (60cm·2kg 이하)",
  medium: "중형 (90cm·10kg 이하)",
  large: "대형 (120cm·20kg 이하)",
};

// 11번가 수수료
export const ELEVENST = {
  categoryFee: {
    clothing: 0.13,
    food: 0.13,
    electronics: 0.10,
    living: 0.13,
    beauty: 0.13,
  } as Record<CategoryKey, number>,

  // 배송비 수수료율 (유료배송 시)
  shippingFeeRate: 0.033,
} as const;

// G마켓/옥션 수수료
export const GMARKET = {
  categoryFee: {
    clothing: 0.117,
    food: 0.117,
    electronics: 0.099,
    living: 0.117,
    beauty: 0.117,
  } as Record<CategoryKey, number>,

  // 배송비 수수료율 (유료배송 시)
  shippingFeeRate: 0.033,
} as const;

// 수수료 데이터 최종 업데이트 날짜
export const FEE_DATA_UPDATED = "2025.06";
