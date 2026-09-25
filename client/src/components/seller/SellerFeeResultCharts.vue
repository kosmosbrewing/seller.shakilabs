<script setup lang="ts">
import { computed } from "vue";
import type { GapBarItem } from "@shakilabs/ui";
import GapComparisonBars from "@/components/result-visualization/GapComparisonBars.vue";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatPercent, formatWon } from "@/lib/utils";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{ results: FeeBreakdown[] }>();

// 순이익 = 판매가 − 수수료라 채널 간 순이익 차이는 수수료 차이와 같다(거울상). 두 지표를 따로 0부터
// 그리던 막대는 같은 정보를 두 번 보여 줬고 값이 비슷해 차이도 안 보였다 — 순이익 하나를 1위 대비 차이로
// 그리고 수수료·실질 수수료율은 보조 문구로 둔다(월 판매 손익 그래프와 같은 문법).
const items = computed<GapBarItem[]>(() =>
  props.results.map((result) => ({
    key: result.marketKey,
    label: ALL_CHANNEL_META[result.marketKey].name,
    value: result.netProfit,
    detail: `수수료 ${formatWon(result.totalFee)} · 실질 수수료율 ${formatPercent(result.totalFeeRate, 2)}`,
  })),
);
</script>

<template>
  <GapComparisonBars
    title="채널별 건당 손익 그래프"
    note="막대는 1위보다 덜 남는 건당 순이익입니다. 판매가가 같아 순이익 차이는 수수료 차이와 같습니다."
    :items="items"
    :format-value="formatWon"
    better="higher"
  />
</template>
