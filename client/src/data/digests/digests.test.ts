import { describe, expect, it } from "vitest";

import { MONTHLY_FEES } from "../marketFees";
import { PAYMENT_GATEWAYS } from "../paymentGateways";
import {
  SELLER_HOME_GUIDE,
  SELLER_MARKET_COMPARE_GUIDE,
  SELLER_PAYMENT_GUIDE,
  SELLER_SHIPPING_GUIDE,
} from "../seoGuides";
import { type Finding } from "./format";
import { HOME_DIGEST } from "./homeDigest";
import { MARKET_COMPARE_DIGEST } from "./marketDigest";
import { PAYMENT_DIGEST } from "./paymentDigest";
import { SHIPPING_DIGEST } from "./shippingDigest";

// 규율: 페이지당 파생 발견 8개 이상. 공개 요율을 단순 인용한 문장은 발견이 아니므로,
// 발견마다 합산·경계·차액 같은 파생 수치가 여럿 들어 있어야 한다(숫자 토큰 4개 이상).
const MIN_FINDINGS = 8;
const MIN_NUMBER_TOKENS = 4;
// scaled content abuse 방지: 새 산문 전 쌍 유사도 0.5 미만, 기존 본문과는 0.85 미만
const MAX_PAIR_SIMILARITY = 0.5;
const MAX_LEGACY_SIMILARITY = 0.85;

const DIGESTS: Record<string, Finding[]> = {
  home: HOME_DIGEST,
  market: MARKET_COMPARE_DIGEST,
  payment: PAYMENT_DIGEST,
  shipping: SHIPPING_DIGEST,
};
const ALL = Object.entries(DIGESTS).flatMap(([page, items]) => items.map((f, i) => ({ id: `${page}#${i + 1}`, ...f })));

const compact = (text: string) => text.replace(/\s+/g, "");

function bigrams(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const t = compact(text);
  for (let i = 0; i < t.length - 1; i += 1) {
    const g = t.slice(i, i + 2);
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return map;
}

/** 문자 바이그램 Dice 계수 — 0(무관)~1(동일). 순서를 무시하므로 문장 재배열 복제도 잡는다. */
function similarity(a: string, b: string): number {
  const ga = bigrams(a);
  const gb = bigrams(b);
  let shared = 0;
  for (const [g, n] of ga) shared += Math.min(n, gb.get(g) ?? 0);
  const total = [...ga.values()].reduce((s, n) => s + n, 0) + [...gb.values()].reduce((s, n) => s + n, 0);
  return total === 0 ? 0 : (2 * shared) / total;
}

describe("파생 다이제스트 — 발견 밀도", () => {
  it.each(Object.entries(DIGESTS))(`%s 페이지는 발견 ${MIN_FINDINGS}개 이상`, (_page, items) => {
    expect(items.length).toBeGreaterThanOrEqual(MIN_FINDINGS);
  });

  it("발견마다 파생 수치가 여럿 들어 있다", () => {
    for (const f of ALL) {
      const numbers = f.body.match(/\d[\d,.]*/g) ?? [];
      expect(numbers.length, f.id).toBeGreaterThanOrEqual(MIN_NUMBER_TOKENS);
    }
  });

  it("가정값(원가·광고비·포장비 금액)을 쓰지 않는다", () => {
    for (const f of ALL) {
      expect(f.body, f.id).not.toMatch(/(원가|광고비|포장비|포장재)\s*[\d,]+\s*원/);
    }
  });

  it("조사 오류가 없다 — 이름이 데이터에서 오므로 고정 조사가 어긋나기 쉽다", () => {
    for (const f of ALL) {
      // 모음으로 끝나는 이름(택배·기기·뷰티·11번가)에 이/은, 원·%에 잘못된 조사가 붙은 꼴만 잡는다
      expect(`${f.h2} ${f.body}`, f.id).not.toMatch(/(택배|기기|뷰티|11번가)(이|은) |원로 |%을 |%과 |%이 |%은 /);
    }
  });
});

describe("파생 다이제스트 — 복제 방지", () => {
  it(`새 산문 전 쌍 유사도 ${MAX_PAIR_SIMILARITY} 미만`, () => {
    for (let i = 0; i < ALL.length; i += 1) {
      for (let j = i + 1; j < ALL.length; j += 1) {
        const s = similarity(ALL[i].body, ALL[j].body);
        expect(s, `${ALL[i].id} vs ${ALL[j].id}`).toBeLessThan(MAX_PAIR_SIMILARITY);
      }
    }
  });

  it(`기존 가이드 본문·FAQ와 유사도 ${MAX_LEGACY_SIMILARITY} 미만`, () => {
    const digestBodies = new Set(ALL.map((f) => f.body));
    const legacy = [SELLER_HOME_GUIDE, SELLER_MARKET_COMPARE_GUIDE, SELLER_PAYMENT_GUIDE, SELLER_SHIPPING_GUIDE]
      .flatMap((g) => [g.intro, ...(g.sections ?? []).map((s) => s.body), ...(g.faqs ?? []).map((q) => q.a)])
      .filter((body) => !digestBodies.has(body));
    for (const f of ALL) {
      for (const body of legacy) {
        expect(similarity(f.body, body), f.id).toBeLessThan(MAX_LEGACY_SIMILARITY);
      }
    }
  });
});

describe("파생 다이제스트 — 가이드 배선", () => {
  it("네 도구 페이지 가이드가 각자의 다이제스트를 일반 섹션보다 앞에 싣는다", () => {
    const pairs: [typeof SELLER_HOME_GUIDE, Finding[]][] = [
      [SELLER_HOME_GUIDE, HOME_DIGEST],
      [SELLER_MARKET_COMPARE_GUIDE, MARKET_COMPARE_DIGEST],
      [SELLER_PAYMENT_GUIDE, PAYMENT_DIGEST],
      [SELLER_SHIPPING_GUIDE, SHIPPING_DIGEST],
    ];
    for (const [guide, digest] of pairs) {
      expect(guide.sections!.slice(0, digest.length)).toEqual(digest);
      expect(guide.sections!.length).toBeGreaterThan(digest.length);
    }
  });
});

describe("파생 다이제스트 — 수치판 데이터와 문구의 일치", () => {
  it("월정액 발동 문구와 수치판(thresholdRevenue·inclusive)이 같은 말을 한다", () => {
    for (const fee of Object.values(MONTHLY_FEES)) {
      expect(fee.threshold).toContain(`${fee.thresholdRevenue / 10_000}만원`);
      expect(fee.threshold.endsWith(fee.inclusive ? "이상" : "초과")).toBe(true);
    }
  });

  it("토스페이먼츠 고정비 수치판이 비교표 문구와 일치한다", () => {
    const toss = PAYMENT_GATEWAYS.find((g) => g.key === "tosspayments")!;
    expect(toss.fixedFees).toBeDefined();
    expect(toss.setupFee.core).toContain(`${toss.fixedFees!.setup / 10_000}만원`);
    expect(toss.annualFee.core).toContain(`${toss.fixedFees!.annual / 10_000}만원`);
    for (const g of PAYMENT_GATEWAYS.filter((x) => x.key !== "tosspayments")) {
      expect(g.fixedFees, g.key).toBeUndefined();
      expect(g.setupFee.core).toBe("무료");
    }
  });
});
