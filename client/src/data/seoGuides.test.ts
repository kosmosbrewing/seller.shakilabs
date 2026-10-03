import { describe, expect, it } from "vitest";

import { SELLER_MARKET_COMPARE_GUIDE } from "./seoGuides";
import { SETTLEMENT_ORDER, SETTLEMENT_VERIFIED, settlementProse } from "./settlementCycles";

// BRIEF-V8 seller #3 — /market-compare 계산기 아래 "정산 주기 및 유보율" 섹션이
// 727자 단일 문단이었다(가독성 결함: 보조 글자 가이드라인상 문단은 200자 안쪽).
// 역방향 확인: 이 상한을 되돌리면(문단을 다시 합치면) 아래 첫 테스트가 실패해야 한다.
const MAX_PARAGRAPH_CHARS = 200;

// SeoRichGuide.vue가 section.body를 string|string[]로 렌더한다 — 같은 규칙으로 편다.
function paragraphsOf(body: string | string[]): string[] {
  return Array.isArray(body) ? body : [body];
}

// 감사 대상은 "정산 주기 및 유보율" 섹션 하나다(727자 단일 문단 결함).
// 페이지 상단의 파생 다이제스트(MARKET_COMPARE_DIGEST)는 별도 규율(digests.test.ts,
// 발견 밀도·유사도)을 따르므로 여기서 같이 재단하지 않는다 — 대상을 좁혀야
// 역방향 확인(문단을 되돌리면 실패)이 이 결함에 정확히 물린다.
const TARGET_SECTION_H2 = "정산 주기 및 유보율";

describe("/market-compare 문단 길이 상한 (BRIEF-V8 seller #3)", () => {
  it(`"${TARGET_SECTION_H2}" 섹션의 각 문단은 ${MAX_PARAGRAPH_CHARS}자를 넘지 않는다`, () => {
    const section = SELLER_MARKET_COMPARE_GUIDE.sections?.find(
      (s) => s.h2 === TARGET_SECTION_H2
    );
    expect(section, `"${TARGET_SECTION_H2}" 섹션이 없다`).toBeTruthy();
    for (const paragraph of paragraphsOf(section!.body)) {
      expect(
        paragraph.length,
        `문단이 ${MAX_PARAGRAPH_CHARS}자를 넘음(${paragraph.length}자): ${paragraph}`
      ).toBeLessThanOrEqual(MAX_PARAGRAPH_CHARS);
    }
  });

  it("정산 주기 섹션이 문단으로 쪼개져 있다(단일 문단으로 되돌아오지 않았는지 확인)", () => {
    const section = SELLER_MARKET_COMPARE_GUIDE.sections?.find(
      (s) => s.h2 === TARGET_SECTION_H2
    );
    expect(section, `"${TARGET_SECTION_H2}" 섹션이 없다`).toBeTruthy();
    expect(Array.isArray(section!.body), "body가 배열(여러 문단)이 아니다").toBe(true);
    expect((section!.body as string[]).length).toBeGreaterThan(1);
  });

  it("정산 주기 섹션이 원문 사실·숫자를 모두 보존한다(문장 삭제 금지 — 재배열만 허용)", () => {
    const section = SELLER_MARKET_COMPARE_GUIDE.sections?.find(
      (s) => s.h2 === TARGET_SECTION_H2
    );
    const combined = paragraphsOf(section!.body).join(" ");

    // 분할 전 727자 문단에 있던 8개 문장의 사실이 모두 남아 있는지 확인.
    expect(combined).toContain(
      "정산 주기는 마켓별로 다를 뿐 아니라, 같은 마켓 안에서도 어떤 정산 방식을 선택했는지에 따라 달라집니다."
    );
    expect(combined).toContain(`${SETTLEMENT_VERIFIED}에 확인한 값입니다`);
    // 마켓별 정산 방식 문장 4개(스마트스토어·쿠팡·11번가·G마켓) — 비교표와 같은 데이터에서 파생.
    for (const key of SETTLEMENT_ORDER) {
      expect(combined).toContain(settlementProse(key));
    }
    expect(combined).toContain(
      "매출이 늘어날수록 운전자금이 먼저 마릅니다"
    );
    expect(combined).toContain(
      "판매 시점이 아니라 구매확정 시점이 기산점이라는 점도 함께 감안해야 합니다"
    );
  });
});
