<script setup lang="ts">
import { computed } from "vue";
import { ShBreakdownBar } from "@shakilabs/ui";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatWon } from "@/lib/utils";
import { buildPriceBreakdownSegments } from "@/components/compare/priceBreakdownSegments";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  result: FeeBreakdown | null;
}>();

// 순이익이 음수면 세그먼트 합이 판매가보다 작아져 막대가 왜곡되므로 이때는 렌더링하지 않고
// 기존 표(결과 카드·비교표)의 표기를 그대로 유지한다.
const isRenderable = computed(() => !!props.result && props.result.netProfit >= 0);

const segments = computed(() => (props.result ? buildPriceBreakdownSegments(props.result) : []));

const marketName = computed(() =>
  props.result ? ALL_CHANNEL_META[props.result.marketKey].name : ""
);
</script>

<template>
  <ShBreakdownBar
    v-if="isRenderable"
    :label="`${marketName} 판매가 구성 (1위)`"
    :segments="segments"
    note="1위 마켓 기준 판매가를 수수료 항목과 순이익으로 분해했습니다. 항목 구성은 마켓별 계산 방식에 따라 다릅니다."
    :format-value="formatWon"
  />
</template>
