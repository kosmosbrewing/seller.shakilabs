<script setup lang="ts">
import { computed } from "vue";
import { BadgeCheck, Medal } from "lucide-vue-next";
import { formatWon, formatPercent } from "@/lib/utils";
import { MARKET_META } from "@/data/marketFees";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  results: FeeBreakdown[];
}>();

const sortedResults = computed(() => {
  const sorted = [...props.results];
  sorted.sort((a, b) => a.totalFee - b.totalFee);
  return sorted;
});
</script>

<template>
  <div class="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
      <p class="text-caption text-muted-foreground">수수료 낮은순 · 현재 입력값 기준 건당 수수료와 순이익 비교</p>

      <div class="overflow-x-auto">
        <p class="scroll-hint">표를 좌우로 밀어 확인하세요.</p>
        <table class="w-full text-body">
          <thead>
            <tr class="border-b border-border/80 bg-card/95">
              <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">순위</th>
              <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">마켓</th>
              <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">총 수수료</th>
              <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground" title="총 수수료 ÷ 판매가">수수료율</th>
              <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">건당 순이익</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, idx) in sortedResults"
              :key="result.marketKey"
              class="border-b border-border/40 transition-colors hover:bg-accent/15"
              :class="idx === 0 ? 'bg-profit/5 dark:bg-profit/12' : ''"
            >
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="idx === 0 ? 'bg-profit text-white' : 'bg-muted text-muted-foreground'"
                >
                  <Medal class="h-3.5 w-3.5" />
                  {{ idx + 1 }}위
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                    :style="{ backgroundColor: `${MARKET_META[result.marketKey].color}18`, color: MARKET_META[result.marketKey].color }"
                  >
                    {{ MARKET_META[result.marketKey].shortName }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span class="whitespace-nowrap text-body font-semibold">{{ MARKET_META[result.marketKey].name }}</span>
                    <span
                      v-if="idx === 0"
                      class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[11px] font-semibold text-white"
                    >
                      <BadgeCheck class="h-3.5 w-3.5" />
                      추천
                    </span>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-fee">
                {{ formatWon(result.totalFee) }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                {{ formatPercent(result.totalFeeRate) }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
                {{ formatWon(result.netProfit) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</template>
