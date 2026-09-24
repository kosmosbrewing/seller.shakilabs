<script setup lang="ts">
import { computed } from "vue";
import type { GapBarItem } from "@shakilabs/ui";
import GapComparisonBars from "@/components/result-visualization/GapComparisonBars.vue";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatWon } from "@/lib/utils";
import type { MonthlySimResult } from "@/utils/calculator";

const props = defineProps<{ results: MonthlySimResult[] }>();

// 순이익 = 판매가 − 수수료라 채널 간 순이익 차이는 수수료 차이와 정확히 같다(거울상).
// 수수료·순이익을 따로 0부터 그리던 막대는 같은 정보를 두 번 보여 줬고, 값이 비슷해 차이도 안 보였다.
// 셀러가 묻는 건 "어디가 얼마나 더 남나"라서 순이익 하나를 1위 대비 차이로 그리고 수수료는 보조로 적는다.
const items = computed<GapBarItem[]>(() =>
  props.results.map((result) => ({
    key: result.marketKey,
    label: ALL_CHANNEL_META[result.marketKey].name,
    value: result.monthlyProfit,
    detail: `월 수수료 ${formatWon(result.monthlyFee)}`,
  })),
);
</script>

<template>
  <GapComparisonBars
    title="월 판매 손익 그래프"
    note="막대는 1위보다 덜 남는 월 순이익입니다. 입력한 월 판매량 기준이며, 순이익 차이는 수수료 차이와 같습니다."
    :items="items"
    :format-value="formatWon"
    better="higher"
  />
</template>
