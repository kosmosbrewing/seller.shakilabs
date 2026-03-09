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
    microBusinessRate: 3.4,
    setupFee: {
      core: "22만원(1회)",
    },
    annualFee: {
      core: "11만원(매년)",
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
    shortName: "N주문",
    badge: "네이버쇼핑 연동",
    color: "#03C75A",
    microBusinessRate: 1.95,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 1.95%~",
      tooltip: "스마트스토어 주문관리 수수료와 동일. 일반 구간은 최대 3.63% 수준.",
    },
    settlementCycle: {
      core: "주문형 정책 확인",
      tooltip: "정산 시점은 네이버페이 주문형 가맹 정책을 따릅니다.",
    },
    note: {
      core: "주문~배송 통합 관리",
      tooltip: "네이버쇼핑 노출·주문 처리 흐름과 함께 운영됩니다.",
    },
  },
  {
    key: "naverPayment",
    name: "네이버페이 결제형",
    shortName: "N결제",
    badge: "자사몰 결제 연동",
    color: "#0099B8",
    microBusinessRate: 2.2,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 2.2%~",
      tooltip: "업종/계약별로 수수료가 달라질 수 있습니다.",
    },
    settlementCycle: {
      core: "결제형 정책 확인",
      tooltip: "정산 시점은 네이버페이 결제형 연동 정책을 따릅니다.",
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
    microBusinessRate: 0.9,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
      condition: "이벤트/정책 기간에 따라 변동 가능.",
    },
    cardFee: {
      core: "영세 0.9%~",
      tooltip: "영세 0.9%, 일반 최대 3.2% (카드 기준, VAT 별도). 카카오페이머니 영세 0.5%.",
    },
    settlementCycle: {
      core: "연동 PG 정책",
      tooltip: "정산 시점은 함께 연동한 PG의 정산 구조에 따라 달라집니다.",
    },
    note: {
      core: "PG 연동 비용 확인",
      tooltip: "PG 연동 구조에 따라 부가 비용/정산 정책이 달라질 수 있습니다.",
    },
  },
  {
    key: "payco",
    name: "페이코",
    shortName: "PAYCO",
    badge: "포인트 결제 특화",
    color: "#FA2828",
    microBusinessRate: 1.8,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 1.8%~",
      tooltip: "일반 구간 최대 3.4%까지 (카드 기준, VAT 별도).",
    },
    settlementCycle: {
      core: "제휴 정책 확인",
      tooltip: "PAYCO 가맹·제휴 구조에 따라 정산 주기가 달라질 수 있습니다.",
    },
    note: {
      core: "제휴·포인트 결제 강점",
    },
  },
];
