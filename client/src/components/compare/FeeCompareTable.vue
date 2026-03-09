<script setup lang="ts">
import { computed } from "vue";
import { BadgeCheck, Medal } from "lucide-vue-next";
import { formatWon, formatPercent } from "@/lib/utils";
import { ALL_CHANNEL_META } from "@/data/marketFees";
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

      <!-- 모바일: 카드 레이아웃 -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="(result, idx) in sortedResults"
          :key="`m-${result.marketKey}`"
          class="overflow-hidden rounded-2xl border bg-white"
          :class="idx === 0 ? 'border-profit/40' : 'border-border/70'"
        >
          <div class="flex items-center gap-2.5 px-3.5 py-3">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="idx === 0 ? 'bg-profit text-white' : 'bg-muted text-muted-foreground'"
            >
              <Medal class="h-3.5 w-3.5" />
              {{ idx + 1 }}위
            </span>
            <span
              class="inline-flex h-8 min-w-10 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
              :class="result.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
              :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color }"
            >
              {{ ALL_CHANNEL_META[result.marketKey].shortName }}
            </span>
            <span class="min-w-0 flex-1 truncate text-body font-bold text-foreground">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
            <span
              v-if="idx === 0"
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]"
            >
              <BadgeCheck class="h-3.5 w-3.5" />
              추천
            </span>
          </div>
          <div class="space-y-0 border-t border-border/60">
            <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
              <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">총 수수료</span>
              <span class="text-[11px] font-semibold tabular-nums text-fee sm:text-caption">{{ formatWon(result.totalFee) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
              <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">수수료율</span>
              <span class="text-[11px] font-semibold tabular-nums text-muted-foreground sm:text-caption">{{ formatPercent(result.totalFeeRate) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">건당 순이익</span>
              <span class="text-[11px] font-bold tabular-nums sm:text-caption" :class="idx === 0 ? 'text-profit' : 'text-foreground'">{{ formatWon(result.netProfit) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 데스크톱: 테이블 레이아웃 -->
      <div class="hidden md:block">
      <div class="overflow-x-auto">
        <p class="scroll-hint">표를 좌우로 밀어 확인하세요.</p>
        <table class="w-full text-body">
          <thead>
            <tr class="border-b border-border/80 bg-card/95">
              <th class="w-20 whitespace-nowrap px-4 py-3 text-left text-caption font-semibold text-muted-foreground">순위</th>
              <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">마켓</th>
              <th class="w-28 whitespace-nowrap px-2 py-3 text-left text-caption font-semibold text-muted-foreground">총 수수료</th>
              <th class="w-24 whitespace-nowrap px-3 py-3 text-right text-caption font-semibold text-muted-foreground" title="총 수수료 ÷ 판매가">수수료율</th>
              <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">건당 순이익</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, idx) in sortedResults"
              :key="result.marketKey"
              class="border-b border-border/40 transition-colors"
              :class="idx === 0 ? 'bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/15 dark:hover:bg-emerald-950/25' : 'hover:bg-accent/30'"
            >
              <td class="whitespace-nowrap px-4 py-3">
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
                    class="inline-flex h-8 min-w-10 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                    :class="result.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
                    :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color }"
                  >
                    {{ ALL_CHANNEL_META[result.marketKey].shortName }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span class="whitespace-nowrap text-body font-semibold">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
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
              <td class="whitespace-nowrap px-2 py-3 text-left font-semibold tabular-nums text-fee">
                {{ formatWon(result.totalFee) }}
              </td>
              <td class="whitespace-nowrap px-3 py-3 text-right tabular-nums text-muted-foreground">
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
  </div>
</template>
