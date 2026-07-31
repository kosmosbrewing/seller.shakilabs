// 1위(최적) 마켓 판매가 구성 세그먼트 빌더
// 판매가 = 수수료 항목(items) 합 + 순이익(netProfit) — 계산 로직은 건드리지 않고
// FeeBreakdown에 실제로 존재하는 항목만 그대로 세그먼트로 변환한다.
import type { BreakdownSegment, ChartTone } from "@shakilabs/ui";
import type { FeeBreakdown } from "@/utils/calculator";

// 수수료 항목이 여러 개일 때 순환 배정할 톤 (마켓마다 항목 구성이 달라 고정 색상 대신 톤 순환 사용)
const FEE_ITEM_TONES: readonly ChartTone[] = ["warning", "danger", "info", "muted"];

export function buildPriceBreakdownSegments(result: FeeBreakdown): BreakdownSegment[] {
  const feeSegments: BreakdownSegment[] = result.items.map((item, index) => ({
    key: `fee-${index}`,
    label: item.label,
    value: item.amount,
    tone: FEE_ITEM_TONES[index % FEE_ITEM_TONES.length],
  }));

  return [
    ...feeSegments,
    { key: "net-profit", label: "순이익", value: result.netProfit, tone: "success" },
  ];
}
