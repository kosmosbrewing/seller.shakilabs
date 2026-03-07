<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDownUp, BadgeCheck, Medal } from "lucide-vue-next";
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

const bestResult = computed(() => sortedResults.value[0] ?? null);
const secondResult = computed(() => sortedResults.value[1] ?? null);
const spread = computed(() => {
  if (!bestResult.value || !secondResult.value) return 0;
  return Math.max(0, bestResult.value.netProfit - secondResult.value.netProfit);
});
</script>

<template>
  <div class="retro-panel">
    <div class="px-4 pt-4 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-caption text-muted-foreground">현재 입력값 기준 총 수수료와 건당 순이익을 정렬해서 봅니다.</p>
        <div class="flex gap-1.5">
          <button
            type="button"
            :class="[
              'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-tiny font-semibold transition-colors',
              'touch-target',
              sortKey === 'feeAsc' ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground hover:text-foreground'
            ]"
            @click="sortKey = 'feeAsc'"
          >
            <ArrowDownUp class="h-3.5 w-3.5" />
            수수료 낮은순
          </button>
          <button
            type="button"
            :class="[
              'inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-tiny font-semibold transition-colors',
              'touch-target',
              sortKey === 'profitDesc' ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground hover:text-foreground'
            ]"
            @click="sortKey = 'profitDesc'"
          >
            <ArrowDownUp class="h-3.5 w-3.5" />
            순이익 높은순
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div class="rounded-[1.2rem] border border-profit/20 bg-profit/8 px-3.5 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-profit/80">현재 1위</p>
          <p class="mt-1.5 text-body font-bold text-foreground">
            {{ bestResult ? MARKET_META[bestResult.marketKey].name : "-" }}
          </p>
          <p class="mt-1 text-caption text-muted-foreground">
            건당 순이익 {{ bestResult ? formatWon(bestResult.netProfit) : "-" }}
          </p>
        </div>
        <div class="rounded-[1.2rem] border border-primary/20 bg-primary/8 px-3.5 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">1위 vs 2위</p>
          <p class="mt-1.5 text-body font-bold tabular-nums text-foreground">{{ formatWon(spread) }}</p>
          <p class="mt-1 text-caption text-muted-foreground">건당 순이익 차이</p>
        </div>
        <div class="rounded-[1.2rem] border border-border/70 bg-muted/20 px-3.5 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">정렬 기준</p>
          <p class="mt-1.5 text-body font-bold text-foreground">
            {{ sortKey === "feeAsc" ? "총 수수료 낮은순" : "건당 순이익 높은순" }}
          </p>
          <p class="mt-1 text-caption text-muted-foreground">버튼으로 언제든 바꿀 수 있습니다.</p>
        </div>
      </div>
    </div>

    <p class="scroll-hint">표가 잘리지 않도록 좌우 스크롤을 지원합니다.</p>
    <div class="overflow-x-auto px-4 pb-4">
      <table class="w-full text-body">
        <thead class="sticky top-0 z-10">
          <tr class="border-b border-border/80 bg-card/95 backdrop-blur">
            <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">순위</th>
            <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">마켓</th>
            <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">총 수수료</th>
            <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">수수료율</th>
            <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">건당 순이익</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(result, idx) in sortedResults"
            :key="result.marketKey"
            class="border-b border-border/40 transition-colors hover:bg-accent/15"
            :class="idx === 0 ? 'bg-profit/5' : ''"
          >
            <td class="px-4 py-3 text-body font-bold tabular-nums">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
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
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-body font-semibold">{{ MARKET_META[result.marketKey].name }}</span>
                    <span
                      v-if="idx === 0"
                      class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[11px] font-semibold text-white"
                    >
                      <BadgeCheck class="h-3.5 w-3.5" />
                      추천
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-semibold tabular-nums text-fee">
              {{ formatWon(result.totalFee) }}
            </td>
            <td class="px-4 py-3 text-right tabular-nums text-muted-foreground">
              {{ formatPercent(result.totalFeeRate) }}
            </td>
            <td class="px-4 py-3 text-right font-bold tabular-nums" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
              {{ formatWon(result.netProfit) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
