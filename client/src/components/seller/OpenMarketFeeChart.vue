<script setup lang="ts">
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import { OPEN_MARKETS } from "@/data/openMarketCompare";

const minimum = Math.min(...OPEN_MARKETS.map((market) => market.microBusinessRate));
const metrics = [{
  key: "rate",
  label: "공개 최저 판매 수수료율",
  values: OPEN_MARKETS.map((market) => ({
    key: market.key,
    label: market.name,
    value: market.microBusinessRate,
    highlight: market.microBusinessRate === minimum,
  })),
}];
const formatRate = (value: number) => `${value.toFixed(2).replace(/\.?0+$/, "")}%`;
</script>

<template>
  <MetricComparisonBars
    title="오픈마켓 최저 요율 그래프"
    note="각 마켓이 공개한 최저값만 비교합니다. 스마트스토어는 영세 등급 기준이고 나머지 셋은 카테고리 최저 요율이라 기준이 다릅니다. 실제 수수료는 카테고리·유입경로·배송·물류 조건에 따라 달라집니다."
    :metrics="metrics"
    :format-value="formatRate"
  />
</template>
