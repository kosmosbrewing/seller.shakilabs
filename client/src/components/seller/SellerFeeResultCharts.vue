<script setup lang="ts">
import { computed } from "vue";
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatPercent, formatWon } from "@/lib/utils";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{ results: FeeBreakdown[] }>();
const sorted = computed(() => [...props.results].sort((a, b) => a.totalFee - b.totalFee));
const bestKey = computed(() => sorted.value[0]?.marketKey);
const metrics = computed(() => [
  {
    key: "fee",
    label: "건당 총 수수료",
    values: sorted.value.map((result) => ({
      key: result.marketKey,
      label: ALL_CHANNEL_META[result.marketKey].name,
      value: result.totalFee,
      highlight: result.marketKey === bestKey.value,
      detail: `실질 수수료율 ${formatPercent(result.totalFeeRate, 2)}`,
    })),
  },
  {
    key: "profit",
    label: "건당 순이익",
    values: sorted.value.map((result) => ({
      key: result.marketKey,
      label: ALL_CHANNEL_META[result.marketKey].name,
      value: result.netProfit,
      highlight: result.marketKey === bestKey.value,
    })),
  },
]);
</script>

<template>
  <MetricComparisonBars
    title="채널별 건당 손익 그래프"
    note="수수료와 순이익은 각각 0원에서 시작하는 별도 축으로 비교합니다. 강조 표시는 입력 조건의 최저 수수료 채널입니다."
    :metrics="metrics"
    :format-value="formatWon"
  />
</template>
