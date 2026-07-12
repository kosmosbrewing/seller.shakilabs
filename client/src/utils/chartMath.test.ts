import { describe, expect, it } from "vitest";
import { positiveBarWidth, signedBarGeometry } from "./chartMath";

describe("positiveBarWidth", () => {
  it("uses a zero baseline for positive comparisons", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(35, 100)).toBe(35);
    expect(positiveBarWidth(200, 100)).toBe(100);
  });

  it("rejects invalid values", () => {
    expect(positiveBarWidth(Number.POSITIVE_INFINITY, 100)).toBe(0);
    expect(positiveBarWidth(10, 0)).toBe(0);
  });
});

describe("signedBarGeometry", () => {
  it("places losses to the left of the zero baseline", () => {
    expect(signedBarGeometry(-20, -20, 80)).toEqual({ start: 0, width: 20, zero: 20 });
    expect(signedBarGeometry(80, -20, 80)).toEqual({ start: 20, width: 80, zero: 20 });
  });
});
