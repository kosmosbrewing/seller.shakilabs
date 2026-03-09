<script setup lang="ts">
import { computed } from "vue";
import MarketCard from "./MarketCard.vue";
import type { FeeBreakdown } from "@/utils/calculator";
import { MARKET_META, type MarketKey } from "@/data/marketFees";
import { formatWon } from "@/lib/utils";

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
const bestMarket = computed(() => sortedByNetProfit.value[0] ?? null);
const runnerUpMarket = computed(() => sortedByNetProfit.value[1] ?? null);
const bestGap = computed(() => {
  if (!bestMarket.value || !runnerUpMarket.value) return 0;
  return Math.max(0, bestMarket.value.netProfit - runnerUpMarket.value.netProfit);
});
const totalFeeSpread = computed(() => {
  if (sortedByNetProfit.value.length === 0) return 0;
  const fees = sortedByNetProfit.value.map((item) => item.totalFee);
  return Math.max(...fees) - Math.min(...fees);
});
</script>

<template>
  <div class="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
    <div class="rounded-2xl bg-white px-3.5 py-3 sm:px-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-2 text-caption">
          <span class="inline-flex items-center rounded-full bg-primary px-2.5 py-1 font-bold text-primary-foreground">
            순이익 높은순
          </span>
          <span class="text-muted-foreground">
            1위부터 바로 비교할 수 있도록 자동 정렬했습니다.
          </span>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div class="rounded-2xl bg-background px-3 py-2.5">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              1위 vs 2위
            </p>
            <p class="mt-1 text-caption font-semibold text-foreground">
              {{ bestMarket ? MARKET_META[bestMarket.marketKey].name : "-" }}
              <span class="text-muted-foreground">vs</span>
              {{ runnerUpMarket ? MARKET_META[runnerUpMarket.marketKey].name : "-" }}
            </p>
            <p class="mt-1 text-body font-bold tabular-nums text-profit">
              {{ formatWon(bestGap) }}
            </p>
          </div>

          <div class="rounded-2xl bg-background px-3 py-2.5">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              마켓간 수수료 편차
            </p>
            <p class="mt-1 text-caption text-muted-foreground">
              같은 조건 기준 총 수수료 차이
            </p>
            <p class="mt-1 text-body font-bold tabular-nums text-fee">
              {{ formatWon(totalFeeSpread) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MarketCard
        v-for="result in sortedByNetProfit"
        :key="result.marketKey"
        :result="result"
        :is-best="result.marketKey === bestMarketKey"
        :rank="rankMap.get(result.marketKey) ?? null"
        :net-gap="Math.max(0, bestNetProfit - result.netProfit)"
      />
    </div>
  </div>
</template>
