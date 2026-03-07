// 오픈마켓 4개 정적 비교 데이터 (PaymentCompareView 패턴)
// 수치 계산용 marketFees.ts와 별개 — 이 파일은 문자열 기반 레퍼런스 비교표

export type OpenMarketKey = "smartstore" | "coupang" | "elevenst" | "gmarket";

export interface OpenMarketCompareMeta {
  key: OpenMarketKey;
  name: string;
  shortName: string;
  color: string;
  accentClass: string;
  setupFee: string;
  salesFeeRange: string;
  shippingFeeRate: string;
  settlementCycle: string;
  note: string;
}

export const MARKET_COMPARE_UPDATED = "2025.10";

export const OPEN_MARKETS: OpenMarketCompareMeta[] = [
  {
    key: "smartstore",
    name: "스마트스토어",
    shortName: "네쇼",
    color: "#03C75A",
    accentClass: "text-[#03C75A]",
    setupFee: "무료",
    salesFeeRange: "주문관리 1.95% ~ 3.63%\n+ 판매 0.91% ~ 2.73%\n합산 약 2.86% ~ 6.36%",
    shippingFeeRate: "주문관리 수수료만 적용\n(판매 수수료 미적용)",
    settlementCycle: "구매확정 후\n1~2 영업일",
    note: "등급+유입경로 분리형\n스타트 제로수수료\n(신규 12개월)",
  },
  {
    key: "coupang",
    name: "쿠팡",
    shortName: "쿠팡",
    color: "#E31937",
    accentClass: "text-[#E31937]",
    setupFee: "무료",
    salesFeeRange: "7.8% ~ 10.6%\n(카테고리별 상이)",
    shippingFeeRate: "3.3%\n(유료배송 시)",
    settlementCycle: "D+1 ~ D+2 영업일\n(요일별 차이)",
    note: "로켓그로스 이용 시\n물류비 별도\n(700 ~ 4,300원/건)",
  },
  {
    key: "elevenst",
    name: "11번가",
    shortName: "11번",
    color: "#FF6B00",
    accentClass: "text-[#FF6B00]",
    setupFee: "무료",
    salesFeeRange: "10% ~ 13%\n(카테고리별 상이)",
    shippingFeeRate: "3.3%\n(유료배송 시)",
    settlementCycle: "구매확정 후\n익영업일",
    note: "카테고리 수수료 단일 구조\n전자기기 10%\n나머지 13%",
  },
  {
    key: "gmarket",
    name: "G마켓/옥션",
    shortName: "G마켓",
    color: "#00B050",
    accentClass: "text-[#00B050]",
    setupFee: "무료",
    salesFeeRange: "9% ~ 13%\n(카테고리별 상이)",
    shippingFeeRate: "3.3%\n(유료배송 시)",
    settlementCycle: "구매확정 후\n익영업일",
    note: "대표값 기준 합산 표기\n세부 카테고리는\nG마켓·옥션 별도 확인",
  },
];
