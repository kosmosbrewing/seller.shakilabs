// 모바일 좌측 드로어(v3 §3.3-1)와 데스크톱 2차 내비가 같은 출처를 쓰도록
// 도구 목록을 여기 하나로 모은다. "home" 항목은 각 소비처에서 자체적으로 얹는다
// (허브가 라우트 "/"라 도구 목록에 넣을 대상 경로가 없다).
export interface SellerToolLink {
  key: string;
  path: string;
  label: string;
}

export const SELLER_TOOLS: readonly SellerToolLink[] = [
  { key: "market", path: "/market-compare", label: "오픈마켓 비교" },
  { key: "payment", path: "/payment-compare", label: "결제 비교" },
  { key: "shipping", path: "/shipping-compare", label: "택배비 비교" },
] as const;
