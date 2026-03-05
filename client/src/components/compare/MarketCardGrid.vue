<script setup lang="ts">
import MarketCard from "./MarketCard.vue";
import type { FeeBreakdown } from "@/utils/calculator";
import type { MarketKey } from "@/data/marketFees";

const props = defineProps<{
  results: FeeBreakdown[];
  bestMarketKey: MarketKey | null;
}>();
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <MarketCard
      v-for="result in results"
      :key="result.marketKey"
      :result="result"
      :is-best="result.marketKey === bestMarketKey"
    />
  </div>

  <!-- 모바일 스크롤 힌트 -->
  <p class="scroll-hint text-center mt-1">
    좌우로 스크롤하여 비교하세요
  </p>
</template>
