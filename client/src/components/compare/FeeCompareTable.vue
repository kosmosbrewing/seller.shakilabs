<script setup lang="ts">
import { computed, ref } from "vue";
import { formatWon, formatPercent } from "@/lib/utils";
import { MARKET_META } from "@/data/marketFees";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  results: FeeBreakdown[];
}>();

type SortKey = "feeAsc" | "profitDesc";
const sortKey = ref<SortKey>("feeAsc");

const sortedResults = computed(() => {
  const sorted = [...props.results];
  if (sortKey.value === "feeAsc") {
    sorted.sort((a, b) => a.totalFee - b.totalFee);
  } else {
    sorted.sort((a, b) => b.netProfit - a.netProfit);
  }
  return sorted;
});
</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title">수수료 비교표</h3>
      <div class="flex gap-1.5">
        <button
          type="button"
          :class="[
            'px-2.5 py-1 rounded-md text-tiny font-semibold transition-colors',
            'touch-target',
            sortKey === 'feeAsc' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          ]"
          @click="sortKey = 'feeAsc'"
        >
          수수료 낮은순
        </button>
        <button
          type="button"
          :class="[
            'px-2.5 py-1 rounded-md text-tiny font-semibold transition-colors',
            'touch-target',
            sortKey === 'profitDesc' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          ]"
          @click="sortKey = 'profitDesc'"
        >
          순이익 높은순
        </button>
      </div>
    </div>

    <p class="scroll-hint">표가 잘리지 않도록 좌우 스크롤을 지원합니다.</p>
    <div class="overflow-x-auto">
      <table class="w-full text-body">
        <thead>
          <tr class="border-b border-border/80">
            <th class="px-4 py-2.5 text-left text-caption font-semibold text-muted-foreground">순위</th>
            <th class="px-4 py-2.5 text-left text-caption font-semibold text-muted-foreground">마켓</th>
            <th class="px-4 py-2.5 text-right text-caption font-semibold text-muted-foreground">총 수수료</th>
            <th class="px-4 py-2.5 text-right text-caption font-semibold text-muted-foreground">수수료율</th>
            <th class="px-4 py-2.5 text-right text-caption font-semibold text-muted-foreground">건당 순이익</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(result, idx) in sortedResults"
            :key="result.marketKey"
            class="border-b border-border/40 transition-colors hover:bg-accent/15"
          >
            <td class="px-4 py-2.5 text-body font-bold tabular-nums">
              {{ idx + 1 }}
            </td>
            <td class="px-4 py-2.5">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex h-5 w-5 items-center justify-center rounded-lg text-tiny font-bold text-white"
                  :style="{ backgroundColor: MARKET_META[result.marketKey].color }"
                >
                  {{ MARKET_META[result.marketKey].name.charAt(0) }}
                </span>
                <span class="text-body font-semibold">{{ MARKET_META[result.marketKey].name }}</span>
              </div>
            </td>
            <td class="px-4 py-2.5 text-right font-semibold tabular-nums text-fee">
              {{ formatWon(result.totalFee) }}
            </td>
            <td class="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
              {{ formatPercent(result.totalFeeRate) }}
            </td>
            <td class="px-4 py-2.5 text-right font-bold tabular-nums">
              {{ formatWon(result.netProfit) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
