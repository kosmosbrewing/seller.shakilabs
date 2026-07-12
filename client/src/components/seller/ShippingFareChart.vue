<script setup lang="ts">
import { computed } from "vue";
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import { formatWon } from "@/lib/utils";
import type { ShippingEstimateResult } from "@/data/shippingRates";

const props = defineProps<{
  generalResults: ShippingEstimateResult[];
  convenienceResults: ShippingEstimateResult[];
}>();

function buildValues(results: ShippingEstimateResult[]) {
  const available = results.filter((result) => result.isAvailable);
  const minimum = Math.min(...available.map((result) => result.totalFare));
  return available.map((result) => ({
    key: result.carrier.key,
    label: result.carrier.name,
    value: result.totalFare,
    highlight: result.totalFare === minimum,
    detail: result.weightSurcharge > 0 ? `무게 추가 ${formatWon(result.weightSurcharge)}` : "무게 추가 없음",
  }));
}

const metrics = computed(() => [
  { key: "general", label: "일반 택배", values: buildValues(props.generalResults) },
  { key: "convenience", label: "편의점 택배", values: buildValues(props.convenienceResults) },
].filter((metric) => metric.values.length > 0));
</script>

<template>
  <MetricComparisonBars
    title="입력 조건별 예상 운임 그래프"
    note="현재 무게·크기로 접수 가능한 서비스만 표시하며, 일반 택배와 편의점 택배는 각각 비교합니다."
    :metrics="metrics"
    :format-value="formatWon"
  />
</template>
