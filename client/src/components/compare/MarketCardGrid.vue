<script setup lang="ts">
import { computed } from "vue";
import MarketCard from "./MarketCard.vue";
import type { FeeBreakdown } from "@/utils/calculator";
import type { MarketKey } from "@/data/marketFees";

const props = defineProps<{
  results: FeeBreakdown[];
  bestMarketKey: MarketKey | null;
}>();

const sortedByNetProfit = computed(() =>
  [...props.results].sort((a, b) => b.netProfit - a.netProfit)
);

const rankMap = computed(() => {
  const map = new Map<MarketKey, number>();
  sortedByNetProfit.value.forEach((item, index) => {
    map.set(item.marketKey, index + 1);
  });
  return map;
});

const bestNetProfit = computed(() => sortedByNetProfit.value[0]?.netProfit ?? 0);
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <MarketCard
      v-for="result in results"
      :key="result.marketKey"
      :result="result"
      :is-best="result.marketKey === bestMarketKey"
      :rank="rankMap.get(result.marketKey) ?? null"
      :net-gap="Math.max(0, bestNetProfit - result.netProfit)"
    />
  </div>

</template>
