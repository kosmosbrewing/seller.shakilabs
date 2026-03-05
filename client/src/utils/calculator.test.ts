// 오픈마켓 수수료 계산 엔진 핵심 테스트
// 4마켓 × 계산 정확도 + 경계값 테스트
import { describe, it, expect } from "vitest";
import {
  calcSmartStore,
  calcCoupang,
  calcElevenSt,
  calcGmarket,
  calcAllMarkets,
  findBestMarket,
  calcMonthlySim,
} from "./calculator";

// ---------- 1. 스마트스토어 기본 계산 ----------
describe("calcSmartStore", () => {
  it("영세등급 + 네이버쇼핑 유입 기준 30,000원 상품", () => {
    const result = calcSmartStore({
      price: 30_000,
      shippingFee: 3_000,
      tier: "micro",
      source: "naverShopping",
    });

    // 주문관리: 30000 × 0.0198 = 594
    expect(result.items[0].amount).toBe(594);
    // 판매수수료: 30000 × 0.0273 × 1.1 = 900.9 → 900
    expect(result.items[1].amount).toBe(900);
    // 배송비 수수료: 3000 × 0.0198 = 59.4 → 59
    expect(result.items[2].amount).toBe(59);

    expect(result.totalFee).toBe(594 + 900 + 59);
    expect(result.netProfit).toBe(30_000 - result.totalFee);
    expect(result.marketKey).toBe("smartstore");
  });

  it("일반등급 + 마케팅링크 유입 기준 100,000원 상품", () => {
    const result = calcSmartStore({
      price: 100_000,
      shippingFee: 0,
      tier: "normal",
      source: "marketingLink",
    });

    // 주문관리: 100000 × 0.0363 = 3630
    expect(result.items[0].amount).toBe(3_630);
    // 판매수수료: 100000 × 0.0091 × 1.1 = 1001 → 1001
    expect(result.items[1].amount).toBe(1_001);
    // 무료배송이므로 배송비 수수료 없음
    expect(result.items.length).toBe(2);

    expect(result.totalFee).toBe(3_630 + 1_001);
  });
});

// ---------- 2. 쿠팡 기본 계산 ----------
describe("calcCoupang", () => {
  it("마켓플레이스 의류 30,000원", () => {
    const result = calcCoupang({
      price: 30_000,
      category: "clothing",
      mode: "marketplace",
      fulfillmentSize: "small",
    });

    // 판매수수료: 30000 × 0.108 = 3240
    expect(result.items[0].amount).toBe(3_240);
    // 마켓플레이스는 물류비 없음
    expect(result.items.length).toBe(1);
    expect(result.totalFee).toBe(3_240);
    expect(result.netProfit).toBe(30_000 - 3_240);
  });

  it("로켓그로스 전자기기 50,000원 (중형)", () => {
    const result = calcCoupang({
      price: 50_000,
      category: "electronics",
      mode: "rocketGrowth",
      fulfillmentSize: "medium",
    });

    // 판매수수료: 50000 × 0.081 = 4050
    expect(result.items[0].amount).toBe(4_050);
    // 물류비: 2500 (중형)
    expect(result.items[1].amount).toBe(2_500);
    expect(result.totalFee).toBe(4_050 + 2_500);
  });
});

// ---------- 3. 11번가 기본 계산 ----------
describe("calcElevenSt", () => {
  it("식품 30,000원 + 배송비 3,000원", () => {
    const result = calcElevenSt({
      price: 30_000,
      shippingFee: 3_000,
      category: "food",
    });

    // 판매수수료: 30000 × 0.13 = 3900
    expect(result.items[0].amount).toBe(3_900);
    // 배송비 수수료: 3000 × 0.033 = 99
    expect(result.items[1].amount).toBe(99);
    expect(result.totalFee).toBe(3_900 + 99);
    expect(result.marketKey).toBe("elevenst");
  });
});

// ---------- 4. G마켓 기본 계산 ----------
describe("calcGmarket", () => {
  it("뷰티 30,000원 + 배송비 3,000원", () => {
    const result = calcGmarket({
      price: 30_000,
      shippingFee: 3_000,
      category: "beauty",
    });

    // 판매수수료: 30000 × 0.117 = 3510
    expect(result.items[0].amount).toBe(3_510);
    // 배송비 수수료: 3000 × 0.033 = 99
    expect(result.items[1].amount).toBe(99);
    expect(result.totalFee).toBe(3_510 + 99);
    expect(result.marketKey).toBe("gmarket");
  });
});

// ---------- 5. calcAllMarkets 4개 마켓 동시 비교 ----------
describe("calcAllMarkets", () => {
  it("의류 30,000원 기본 조건으로 4개 마켓 동시 비교", () => {
    const results = calcAllMarkets({
      price: 30_000,
      shippingFee: 3_000,
      category: "clothing",
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });

    expect(results).toHaveLength(4);
    expect(results.map((r) => r.marketKey)).toEqual([
      "smartstore",
      "coupang",
      "elevenst",
      "gmarket",
    ]);

    // 모든 마켓의 netProfit + totalFee = price
    for (const r of results) {
      expect(r.netProfit + r.totalFee).toBe(30_000);
    }
  });
});

// ---------- 6. findBestMarket ----------
describe("findBestMarket", () => {
  it("의류 기본 조건에서 스마트스토어가 최저 수수료", () => {
    const results = calcAllMarkets({
      price: 30_000,
      shippingFee: 3_000,
      category: "clothing",
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });
    const best = findBestMarket(results);

    expect(best).not.toBeNull();
    expect(best!.marketKey).toBe("smartstore");
    // 스마트스토어 수수료가 다른 마켓보다 낮아야 함
    for (const r of results) {
      expect(best!.totalFee).toBeLessThanOrEqual(r.totalFee);
    }
  });

  it("빈 배열이면 null 반환", () => {
    expect(findBestMarket([])).toBeNull();
  });
});

// ---------- 7. 월간 시뮬레이션 ----------
describe("calcMonthlySim", () => {
  it("100건 기준 월간/연간 수수료 계산", () => {
    const results = calcAllMarkets({
      price: 30_000,
      shippingFee: 3_000,
      category: "clothing",
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });
    const sim = calcMonthlySim(results, 100);

    expect(sim).toHaveLength(4);
    for (const s of sim) {
      const original = results.find((r) => r.marketKey === s.marketKey)!;
      expect(s.monthlyFee).toBe(original.totalFee * 100);
      expect(s.annualFee).toBe(original.totalFee * 100 * 12);
    }

    // 최저 마켓의 annualDiff는 0
    const minSim = sim.reduce((a, b) => (a.annualFee < b.annualFee ? a : b));
    expect(minSim.annualDiff).toBe(0);
  });
});

// ---------- 8. 경계값: 가격 0원 ----------
describe("경계값 테스트", () => {
  it("가격 0원이면 수수료 0, 순이익 0", () => {
    const result = calcSmartStore({
      price: 0,
      shippingFee: 0,
      tier: "micro",
      source: "naverShopping",
    });
    expect(result.totalFee).toBe(0);
    expect(result.netProfit).toBe(0);
    expect(result.totalFeeRate).toBe(0);
  });

  // ---------- 9. 경계값: 매우 큰 금액 ----------
  it("1억원 고가 상품도 정상 계산", () => {
    const results = calcAllMarkets({
      price: 100_000_000,
      shippingFee: 5_000,
      category: "electronics",
      smartstoreTier: "normal",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "large",
    });

    for (const r of results) {
      expect(r.totalFee).toBeGreaterThan(0);
      expect(r.netProfit).toBeLessThan(100_000_000);
      expect(r.totalFeeRate).toBeGreaterThan(0);
      expect(r.totalFeeRate).toBeLessThan(1);
    }
  });

  // ---------- 10. 전자기기 카테고리 수수료율 차이 ----------
  it("전자기기 카테고리는 의류보다 쿠팡/11번가/G마켓 수수료가 낮다", () => {
    const electronics = calcAllMarkets({
      price: 50_000,
      shippingFee: 3_000,
      category: "electronics",
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });
    const clothing = calcAllMarkets({
      price: 50_000,
      shippingFee: 3_000,
      category: "clothing",
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });

    // 스마트스토어는 카테고리 무관 → 동일
    expect(electronics[0].totalFee).toBe(clothing[0].totalFee);
    // 쿠팡/11번가/G마켓은 전자기기가 더 낮음
    expect(electronics[1].totalFee).toBeLessThan(clothing[1].totalFee);
    expect(electronics[2].totalFee).toBeLessThan(clothing[2].totalFee);
    expect(electronics[3].totalFee).toBeLessThan(clothing[3].totalFee);
  });
});
