export type PaymentGatewayKey =
  | "tosspayments"
  | "naverOrder"
  | "naverPayment"
  | "kakaopay"
  | "payco";

export interface CompareCell {
  core: string;
  tooltip?: string;
  condition?: string;
}

export interface PaymentGatewayMeta {
  key: PaymentGatewayKey;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  accentClass: string;
  microBusinessRate: number;
  setupFee: CompareCell;
  annualFee: CompareCell;
  cardFee: CompareCell;
  settlementCycle: CompareCell;
  note: CompareCell;
}

export const PAYMENT_DATA_UPDATED = "2026.03";

export const PAYMENT_GATEWAYS: PaymentGatewayMeta[] = [
  {
    key: "tosspayments",
    name: "토스페이먼츠 (PG)",
    shortName: "토스PG",
    badge: "PG 인프라",
    color: "#0064FF",
    accentClass: "text-[#0064FF]",
    microBusinessRate: 3.4,
    setupFee: {
      core: "약 22만원(1회)",
    },
    annualFee: {
      core: "약 11만원/년",
    },
    cardFee: {
      core: "영세 3.4%~",
      tooltip: "계약 조건에 따라 수수료 구간이 조정될 수 있습니다.",
    },
    settlementCycle: {
      core: "평균 5일 이내",
    },
    note: {
      core: "PG 전체 인프라",
      tooltip: "결제창, 정산, 위험관리 등 PG 전체 기능 제공.",
    },
  },
  {
    key: "naverOrder",
    name: "네이버페이 주문형",
    shortName: "주문형",
    badge: "네이버쇼핑 연동",
    color: "#03C75A",
    accentClass: "text-[#03C75A]",
    microBusinessRate: 1.98,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "없음",
    },
    cardFee: {
      core: "영세 1.98%~",
      tooltip: "일반 구간은 최대 3.63% 수준으로 안내됩니다.",
    },
    settlementCycle: {
      core: "서비스 정책 확인 필요",
    },
    note: {
      core: "주문~배송 통합 관리",
      tooltip: "네이버쇼핑 노출·주문 처리 흐름과 함께 운영됩니다.",
    },
  },
  {
    key: "naverPayment",
    name: "네이버페이 결제형",
    shortName: "결제형",
    badge: "자사몰 결제 연동",
    color: "#00A862",
    accentClass: "text-[#00A862]",
    microBusinessRate: 2.2,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "없음",
    },
    cardFee: {
      core: "영세 2%대 초중반~",
      tooltip: "구체 수수료는 업종/계약별로 개별 안내됩니다.",
    },
    settlementCycle: {
      core: "서비스 정책 확인 필요",
    },
    note: {
      core: "자사몰 결제 전용",
      tooltip: "네이버 쇼핑 주문형과 달리 결제 모듈만 연동합니다.",
    },
  },
  {
    key: "kakaopay",
    name: "카카오페이",
    shortName: "카카오",
    badge: "간편결제 중심",
    color: "#FFCD00",
    accentClass: "text-[#C79300]",
    microBusinessRate: 0.89,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
      condition: "이벤트/정책 기간에 따라 변동 가능.",
    },
    cardFee: {
      core: "영세 0.89%~",
      tooltip: "일반 구간은 최대 1.72% 수준으로 안내됩니다.",
    },
    settlementCycle: {
      core: "연동 PG 정책 따름",
    },
    note: {
      core: "간편결제 중심",
      tooltip: "PG 연동 구조에 따라 부가 비용/정산 정책이 달라질 수 있습니다.",
    },
  },
  {
    key: "payco",
    name: "페이코",
    shortName: "PAYCO",
    badge: "포인트 결제 특화",
    color: "#FA2828",
    accentClass: "text-[#FA2828]",
    microBusinessRate: 1.5,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "없음",
    },
    cardFee: {
      core: "영세 1.5%~",
      tooltip: "일반 구간은 최대 3.0% 수준으로 안내됩니다.",
    },
    settlementCycle: {
      core: "서비스 정책 확인 필요",
    },
    note: {
      core: "포인트 결제 특화",
    },
  },
];
