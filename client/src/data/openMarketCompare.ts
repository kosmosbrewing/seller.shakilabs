// 오픈마켓 4개 정적 비교 데이터 (PaymentCompareView 패턴)
// 수치 계산용 marketFees.ts와 별개 — 이 파일은 문자열 기반 레퍼런스 비교표

export type OpenMarketKey = "smartstore" | "coupang" | "elevenst" | "gmarket";

export interface CompareCell {
  core: string;
  tooltip?: string;
  condition?: string;
}

export interface OpenMarketCompareMeta {
  key: OpenMarketKey;
  name: string;
  shortName: string;
  color: string;
  microBusinessRate: number;
  setupFee: CompareCell;
  salesFeeRange: CompareCell;
  shippingFeeRate: CompareCell;
  settlementCycle: CompareCell;
  note: CompareCell;
}

export const MARKET_COMPARE_UPDATED = "2025.10";

export const OPEN_MARKETS: OpenMarketCompareMeta[] = [
  {
    key: "smartstore",
    name: "스마트스토어",
    shortName: "네쇼",
    color: "#03C75A",
    microBusinessRate: 2.95,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 2.95%~",
      tooltip: "주문관리 1.95~3.63%(VAT 포함) + 판매 1.00~3.00%(VAT 포함) 합산. 유입경로·등급별 차등. 스타트 제로수수료(신규 12개월) 별도 적용.",
    },
    shippingFeeRate: {
      core: "주문관리만 과금",
      tooltip: "유료배송에만 주문관리 수수료가 부과됩니다. 판매 수수료는 미적용.",
    },
    settlementCycle: {
      core: "확정 후 1~2영업일",
    },
    note: {
      core: "등급+유입경로 분리형",
      tooltip: "실제 과금률은 매출 등급과 유입 경로 조합으로 결정됩니다.",
    },
  },
  {
    key: "coupang",
    name: "쿠팡",
    shortName: "쿠팡",
    color: "#E31937",
    microBusinessRate: 7.8,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 7.8%~",
      tooltip: "카테고리에 따라 7.8~10.6% 범위에서 적용됩니다.",
    },
    shippingFeeRate: {
      core: "유료배송 3.3%",
    },
    settlementCycle: {
      core: "D+1~D+2 영업일",
      tooltip: "요일/정산 캘린더에 따라 실제 입금일이 달라질 수 있습니다.",
    },

    note: {
      core: "로켓그로스 물류비 별도",
      condition: "건당 700~4,300원 추가 발생 가능.",
    },
  },
  {
    key: "elevenst",
    name: "11번가",
    shortName: "11번",
    color: "#FF6B00",
    microBusinessRate: 10,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 10%~",
      tooltip: "전자기기 10%, 기타 주요 카테고리 13% 수준.",
    },
    shippingFeeRate: {
      core: "유료배송 3.3%",
    },
    settlementCycle: {
      core: "확정 후 익영업일",
    },
    note: {
      core: "카테고리 단일형 구조",
      tooltip: "세부 카테고리별 수수료 코드는 판매자센터에서 확인이 필요합니다.",
    },
  },
  {
    key: "gmarket",
    name: "G마켓/옥션",
    shortName: "G마켓",
    color: "#00B050",
    microBusinessRate: 9,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 9%~",
      tooltip: "카테고리별 9~13% 범위의 대표값입니다.",
    },
    shippingFeeRate: {
      core: "유료배송 3.3%",
    },
    settlementCycle: {
      core: "확정 후 익영업일",
    },
    note: {
      core: "대표값 기준 표기",
      condition: "G마켓·옥션 정책이 세부적으로 다를 수 있습니다.",
    },
  },
];
