// 오픈마켓 정산주기 — 각 마켓 공식 판매자 안내·약관 원문에서 확인한 값.
//
// 왜 별도 파일인가: 정산주기 문구가 비교표(openMarketCompare.ts)와 가이드 산문(seoGuides.ts)에
// 각각 하드코딩돼 있어 같은 화면에서 서로 다른 값을 말하고 있었다(표 "D+1~D+2" vs 산문 "주 1~2회").
// 한 곳에서만 정의하고 양쪽이 파생시키면 한쪽만 고쳐지는 드리프트가 구조적으로 불가능해진다.
//
// 왜 variants인가: 정산주기는 마켓당 하나가 아니다. 같은 쿠팡이라도 주정산·월정산·빠른정산이
// 동시에 유효하다. 하나만 적으면 나머지가 거짓이 되므로 조건을 함께 적는다.

export type SettlementMarketKey = "smartstore" | "coupang" | "elevenst" | "gmarket";

export interface SettlementVariant {
  /** 정산 방식 이름 — 여러 방식이 동시에 유효하므로 이름 없이 시점만 적지 않는다 */
  label: string;
  /** 지급 시점 */
  timing: string;
  /** 적용 조건·지급 비율 등 단서 */
  condition?: string;
}

export interface SettlementCycle {
  key: SettlementMarketKey;
  marketName: string;
  /** 비교표 셀에 들어가는 한 줄 (기본 정산 방식 기준) */
  summary: string;
  /** 정산 기산점이 되는 매출 인식 시점 */
  confirmBasis: string;
  variants: SettlementVariant[];
  sourceName: string;
  sourceUrl: string;
}

/**
 * 정산주기 항목을 1차 출처에서 다시 확인한 시점.
 * 수수료 요율 기준일(FEE_DATA_UPDATED / FEE_DATA_VERIFIED)과 확인 대상이 다르므로 따로 관리한다.
 * 묶어서 한 날짜로 적으면 확인하지 않은 항목까지 확인한 것처럼 읽힌다.
 */
export const SETTLEMENT_VERIFIED = "2026.08";

export const SETTLEMENT_CYCLES: Record<SettlementMarketKey, SettlementCycle> = {
  smartstore: {
    key: "smartstore",
    marketName: "스마트스토어",
    summary: "구매확정 +1영업일",
    confirmBasis: "주문 종료(구매확정·반품완료·교환완료) 시점",
    variants: [
      {
        label: "일반정산",
        timing: "주문 종료 시점부터 1영업일째",
        condition: "주말·공휴일 제외",
      },
      {
        label: "빠른정산",
        timing: "집화처리 기준 1영업일째",
        condition: "빠른정산 대상 판매자에 한함",
      },
    ],
    sourceName: "스마트스토어 고객센터 — 정산 시기",
    sourceUrl: "https://help.sell.smartstore.naver.com/faq/content.help?faqId=3630",
  },
  coupang: {
    key: "coupang",
    marketName: "쿠팡",
    // 주정산·월정산 모두 "15영업일"이 기준선이라 한 줄로 줄여도 어느 쪽도 거짓이 되지 않는다.
    summary: "주·월정산 15영업일",
    confirmBasis: "배송 완료 7일 후 자동 구매확정",
    variants: [
      {
        label: "주정산",
        timing: "결제일 기준 15영업일 후 70% 지급",
        condition: "나머지 30%는 월 결산 후 익월 1영업일에 추가 지급",
      },
      {
        label: "월정산",
        timing: "다음 달 15영업일 후 100% 일괄 지급",
      },
      {
        label: "빠른정산(셀러 월렛)",
        timing: "다음 날 90% 지급",
        condition: "별도 신청·수수료 부담, 나머지 10%는 기존 정산일",
      },
    ],
    sourceName: "쿠팡 마켓플레이스 — 정산 유형과 방식",
    sourceUrl: "https://marketplace.coupang.com/mba-01/mba-3-2",
  },
  elevenst: {
    key: "elevenst",
    marketName: "11번가",
    summary: "구매확정 +2영업일 이내",
    confirmBasis: "구매확정 또는 자동구매확정 시점",
    variants: [
      {
        label: "판매대금 정산",
        timing: "구매확정일로부터 2일 이내 송금",
        condition: "토요일·법정공휴일 제외",
      },
    ],
    sourceName: "11번가 판매이용약관 제9조 (2026.4.14. 시행)",
    sourceUrl: "https://www.11st.co.kr/annc/AnncMainPreview.tmall?method=getProvision&anncCd=05",
  },
  gmarket: {
    key: "gmarket",
    marketName: "G마켓/옥션",
    summary: "구매결정 +1영업일",
    confirmBasis: "구매결정 시점 (미결정 시 배송완료 8일 후 자동 구매결정)",
    variants: [
      {
        label: "계좌송금",
        timing: "구매결정일 +1영업일",
        condition: "G마켓·옥션 공통",
      },
      {
        label: "판매예치금",
        timing: "옥션은 구매결정 즉시, G마켓은 구매결정일 +1영업일",
      },
    ],
    sourceName: "ESM PLUS 판매자 가이드 — 예치금/정산",
    sourceUrl: "https://pics.esmplus.com/front/manual/sellerguide2/depositSettlement.html",
  },
};

export const SETTLEMENT_ORDER: SettlementMarketKey[] = [
  "smartstore",
  "coupang",
  "elevenst",
  "gmarket",
];

/** "일반정산 주문 종료 시점부터 1영업일째(주말·공휴일 제외)" 형태로 한 방식을 펼친다. */
export function formatSettlementVariant(variant: SettlementVariant): string {
  return variant.condition
    ? `${variant.label} ${variant.timing}(${variant.condition})`
    : `${variant.label} ${variant.timing}`;
}

/** 비교표 툴팁용 — 한 마켓의 모든 정산 방식과 기산점을 한 문장으로 편다. */
export function settlementTooltip(key: SettlementMarketKey): string {
  const cycle = SETTLEMENT_CYCLES[key];
  const variants = cycle.variants.map(formatSettlementVariant).join(" / ");
  return `${cycle.confirmBasis} 기준 — ${variants}. 출처: ${cycle.sourceName}`;
}

/**
 * 마켓 이름이 데이터에서 오므로 조사를 고정하면 "쿠팡는"이 된다.
 * 한글 음절의 종성 유무로 은/는을 고른다.
 */
function topicParticle(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  const isHangulSyllable = last >= 0xac00 && last <= 0xd7a3;
  if (!isHangulSyllable) return "는";
  return (last - 0xac00) % 28 === 0 ? "는" : "은";
}

/** 가이드 산문용 — 표와 같은 데이터에서 마켓별 한 줄을 만든다. */
export function settlementProse(key: SettlementMarketKey): string {
  const cycle = SETTLEMENT_CYCLES[key];
  const variants = cycle.variants.map(formatSettlementVariant).join(", ");
  return `${cycle.marketName}${topicParticle(cycle.marketName)} ${cycle.confirmBasis}을 기산점으로 ${variants}입니다.`;
}
