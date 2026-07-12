<script setup lang="ts">
import { computed } from "vue";
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatWon } from "@/lib/utils";
import type { MonthlySimResult } from "@/utils/calculator";

const props = defineProps<{ results: MonthlySimResult[] }>();
const sorted = computed(() => [...props.results].sort((a, b) => a.monthlyFee - b.monthlyFee));
const bestKey = computed(() => sorted.value[0]?.marketKey);
const metrics = computed(() => [
  {
    key: "monthly-fee",
    label: "월 수수료",
    values: sorted.value.map((result) => ({
      key: result.marketKey,
      label: ALL_CHANNEL_META[result.marketKey].name,
      value: result.monthlyFee,
      highlight: result.marketKey === bestKey.value,
    })),
  },
  {
    key: "monthly-profit",
    label: "월 순이익",
    values: sorted.value.map((result) => ({
      key: result.marketKey,
      label: ALL_CHANNEL_META[result.marketKey].name,
      value: result.monthlyProfit,
      highlight: result.marketKey === bestKey.value,
    })),
  },
]);
</script>

<template>
  <MetricComparisonBars
    title="월 판매 손익 그래프"
    note="입력한 월 판매량을 반영한 결과이며, 월 수수료와 월 순이익은 각 지표 안에서 비교합니다."
    :metrics="metrics"
    :format-value="formatWon"
  />
</template>
