// 판매가 구성 세그먼트 빌더 테스트
import { describe, it, expect } from "vitest";
import { buildPriceBreakdownSegments } from "./priceBreakdownSegments";
import { calcSmartStore, calcOwnStore } from "@/utils/calculator";

describe("buildPriceBreakdownSegments", () => {
  it("계산 결과의 항목 수만큼 수수료 세그먼트 + 순이익 세그먼트 1개를 만든다", () => {
    const result = calcSmartStore({
      price: 30_000,
      shippingFee: 3_000,
      tier: "micro",
      source: "naverShopping",
    });

    const segments = buildPriceBreakdownSegments(result);

    // items 3개(주문관리·판매·배송비 수수료) + 순이익 1개
    expect(segments).toHaveLength(result.items.length + 1);
    expect(segments.slice(0, -1).map((s) => s.label)).toEqual(
      result.items.map((item) => item.label)
    );
    expect(segments.at(-1)).toMatchObject({ key: "net-profit", label: "순이익", value: result.netProfit });
  });

  it("세그먼트 합은 판매가(items 합 + 순이익)와 같다", () => {
    const result = calcSmartStore({
      price: 100_000,
      shippingFee: 0,
      tier: "normal",
      source: "marketingLink",
    });

    const segments = buildPriceBreakdownSegments(result);
    const total = segments.reduce((sum, seg) => sum + seg.value, 0);

    expect(total).toBe(result.totalFee + result.netProfit);
  });

  it("항목이 1개뿐인 마켓(자사몰)도 정상 동작한다", () => {
    const result = calcOwnStore(50_000, "own_tosspay", "micro");
    const segments = buildPriceBreakdownSegments(result);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ key: "fee-0", label: "결제 수수료" });
    expect(segments[1]).toMatchObject({ key: "net-profit", label: "순이익" });
  });
});
