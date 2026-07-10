import { describe, expect, it } from "vitest";
import { SHIPPING_CARRIERS, estimateShippingRates } from "@/data/shippingRates";

describe("shipping rate snapshots", () => {
  it("우체국 일반소포 30kg 공시 운임을 적용한다", () => {
    const result = estimateShippingRates({ weightKg: 30, size: "xlarge", sumCm: 150 })
      .find((item) => item.carrier.key === "epost");
    expect(result?.totalFare).toBe(11_700);
  });

  it("롯데택배 소형 공시 운임을 적용한다", () => {
    const result = estimateShippingRates({ weightKg: 5, size: "small", sumCm: 100 })
      .find((item) => item.carrier.key === "lotte");
    expect(result?.totalFare).toBe(8_000);
  });

  it("CJ대한통운 공개 접수 제한은 25kg이다", () => {
    expect(SHIPPING_CARRIERS.find((item) => item.key === "cj")?.maxWeightKg).toBe(25);
  });
});
