import { describe, expect, it } from "vitest";

import { COUPANG, ELEVENST, GMARKET, SMARTSTORE } from "./marketFees";
import { OPEN_MARKETS, OPEN_MARKET_SOURCES } from "./openMarketCompare";
import { SELLER_HOME_GUIDE, SELLER_MARKET_COMPARE_GUIDE, SELLER_SHIPPING_GUIDE } from "./seoGuides";
import { SETTLEMENT_CYCLES, SETTLEMENT_ORDER } from "./settlementCycles";

const guideText = [SELLER_HOME_GUIDE, SELLER_MARKET_COMPARE_GUIDE, SELLER_SHIPPING_GUIDE]
  .flatMap((guide) => [
    guide.intro,
    ...(guide.sections ?? []).map((section) => section.body),
    ...(guide.faqs ?? []).flatMap((faq) => [faq.q, faq.a]),
  ])
  .join("\n");

function pct(rate: number): string {
  return Number((rate * 100).toFixed(3)).toString();
}

describe("정산주기 단일 출처", () => {
  it("비교표 셀은 settlementCycles에서 파생된다", () => {
    for (const market of OPEN_MARKETS) {
      expect(market.settlementCycle.core).toBe(SETTLEMENT_CYCLES[market.key].summary);
    }
  });

  it("표의 정산주기 셀마다 1차 출처가 붙어 있다", () => {
    for (const market of OPEN_MARKETS) {
      expect(market.settlementCycle.tooltip).toContain(SETTLEMENT_CYCLES[market.key].sourceName);
    }
  });

  it("정산 출처 4건이 화면 출처 목록에 실린다", () => {
    for (const key of SETTLEMENT_ORDER) {
      const cycle = SETTLEMENT_CYCLES[key];
      expect(OPEN_MARKET_SOURCES.some((source) => source.url === cycle.sourceUrl)).toBe(true);
    }
  });

  it("가이드 산문이 표와 같은 정산 값을 말한다", () => {
    for (const key of SETTLEMENT_ORDER) {
      for (const variant of SETTLEMENT_CYCLES[key].variants) {
        expect(guideText).toContain(variant.timing);
      }
    }
  });
});

describe("수수료 산문은 계산기 데이터에서 파생된다", () => {
  it("마켓별 카테고리 요율 구간을 하드코딩하지 않는다", () => {
    const ranges = [
      `${pct(Math.min(...Object.values(COUPANG.categoryFee)))}~${pct(Math.max(...Object.values(COUPANG.categoryFee)))}%`,
      `${pct(Math.min(...Object.values(ELEVENST.categoryFee)))}~${pct(Math.max(...Object.values(ELEVENST.categoryFee)))}%`,
      `${pct(Math.min(...Object.values(GMARKET.categoryFee)))}~${pct(Math.max(...Object.values(GMARKET.categoryFee)))}%`,
      `${pct(SMARTSTORE.orderFee.micro)}~${pct(SMARTSTORE.orderFee.normal)}%`,
    ];
    for (const range of ranges) {
      expect(guideText).toContain(range);
    }
  });
});

// 라이브에서 실제로 관측된 거짓 문구들. 되돌아오면 여기서 막는다.
describe("근거 없는 문구가 되돌아오지 않는다", () => {
  const banned: Array<[string, RegExp]> = [
    ["쿠팡 정산 주 1~2회 (근거 없음)", /주\s*1~2회/],
    ["11번가·G마켓 월 1~2회 (근거 없음)", /월\s*1~2회/],
    ["쿠팡 D+1~D+2 일반정산 (빠른정산과 혼동)", /D\+1~D\+2/],
    ["로켓배송 단일 수수료율 15~20% (물류비 구조를 요율로 오기)", /15~20%/],
    ["티몬·위메프 요율 안내", /티몬|위메프/],
    ["인터파크 요율 안내 (계산기 미지원 마켓)", /인터파크/],
  ];

  const surfaces = guideText + JSON.stringify(OPEN_MARKETS);

  for (const [label, pattern] of banned) {
    it(label, () => {
      expect(surfaces).not.toMatch(pattern);
    });
  }
});
