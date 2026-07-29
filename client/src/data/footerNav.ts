import type { SiteFooterLink, SiteFooterSection } from "@shakilabs/ui";

/** 푸터 계산기 목록 — 라우터의 실제 경로만 담는다(리다이렉트 별칭 제외) */
export const FOOTER_SECTIONS: readonly SiteFooterSection[] = [
  {
    title: "수수료 비교",
    links: [
    { to: "/market-compare", label: "오픈마켓 수수료" },
    { to: "/payment-compare", label: "결제 수수료" },
    { to: "/shipping-compare", label: "택배비 비교" },
    ],
  },
];

export const FOOTER_ALL_LINK: SiteFooterLink = {
  to: "/",
  label: "전체 도구 보기 →",
};
