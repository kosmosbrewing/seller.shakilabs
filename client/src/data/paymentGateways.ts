export type PaymentGatewayKey =
  | "tosspayments"
  | "naverOrder"
  | "naverPayment"
  | "kakaopay"
  | "payco";

export interface PaymentGatewayMeta {
  key: PaymentGatewayKey;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  accentClass: string;
  setupFee: string;
  annualFee: string;
  cardFee: string;
  settlementCycle: string;
  note: string;
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
    setupFee: "약 22만 원\n(1회)",
    annualFee: "약 11만 원\n/ 년",
    cardFee: "기본 3.4%\n(계약별 상이)",
    settlementCycle: "평균 5일 이내",
    note: "PG 전체 인프라\n매출 규모별 협의 가능",
  },
  {
    key: "naverOrder",
    name: "네이버페이 주문형",
    shortName: "주문형",
    badge: "네이버쇼핑 연동",
    color: "#03C75A",
    accentClass: "text-[#03C75A]",
    setupFee: "무료",
    annualFee: "없음",
    cardFee: "영세 1.98%\n~ 일반 3.63%",
    settlementCycle: "서비스 정책\n확인 필요",
    note: "네이버쇼핑 연동\n주문~배송 관리",
  },
  {
    key: "naverPayment",
    name: "네이버페이 결제형",
    shortName: "결제형",
    badge: "자사몰 결제 연동",
    color: "#00A862",
    accentClass: "text-[#00A862]",
    setupFee: "무료",
    annualFee: "없음",
    cardFee: "2%대 초중반\n~ 3%대 후반",
    settlementCycle: "서비스 정책\n확인 필요",
    note: "자체 쇼핑몰에\n결제만 연동",
  },
  {
    key: "kakaopay",
    name: "카카오페이",
    shortName: "카카오",
    badge: "간편결제 중심",
    color: "#FFCD00",
    accentClass: "text-[#C79300]",
    setupFee: "무료",
    annualFee: "무료 (이벤트)",
    cardFee: "영세 0.89%\n~ 일반 1.72%",
    settlementCycle: "연동 PG 정책에\n따름",
    note: "간편결제 위주\nPG 통해 연동",
  },
  {
    key: "payco",
    name: "페이코",
    shortName: "PAYCO",
    badge: "포인트 결제 특화",
    color: "#FA2828",
    accentClass: "text-[#FA2828]",
    setupFee: "무료",
    annualFee: "없음",
    cardFee: "영세 1.5%\n~ 일반 3.0%",
    settlementCycle: "서비스 정책\n확인 필요",
    note: "포인트 결제 특화",
  },
];
