<script setup lang="ts">
import { computed } from "vue";
import { BadgeCheck, Medal } from "lucide-vue-next";
import {
  ShBadge,
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import { formatWon, formatPercent } from "@/lib/utils";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import CopyTableButton from "@/components/common/CopyTableButton.vue";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  results: FeeBreakdown[];
}>();

function isOwnStore(key: string): boolean {
  return key.startsWith("own_");
}

const sortedResults = computed(() => {
  const sorted = [...props.results];
  sorted.sort((a, b) => a.totalFee - b.totalFee);
  return sorted;
});

const copyHeaders = ["순위", "마켓", "총 수수료", "수수료율", "건당 순이익"];
const copyRows = computed(() =>
  sortedResults.value.map((r, idx) => [
    `${idx + 1}위`,
    ALL_CHANNEL_META[r.marketKey].name,
    formatWon(r.totalFee),
    formatPercent(r.totalFeeRate, 2),
    formatWon(r.netProfit),
  ])
);
</script>

<template>
  <div class="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
      <div class="flex items-center justify-between gap-2">
        <div class="space-y-1">
          <p class="text-caption text-muted-foreground">수수료 낮은순 · 현재 입력값 기준 건당 수수료와 순이익 비교</p>
          <p class="text-[10px] text-muted-foreground sm:text-caption">수수료율은 VAT 포함 총 수수료 기준입니다.</p>
        </div>
        <span class="md:hidden"><CopyTableButton :headers="copyHeaders" :rows="copyRows" /></span>
      </div>

      <!-- 모바일: 카드 레이아웃 -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="(result, idx) in sortedResults"
          :key="`m-${result.marketKey}`"
          class="overflow-hidden rounded-2xl border bg-card"
          :class="idx === 0 ? 'border-profit/40' : 'border-border/70'"
        >
          <div class="flex items-center gap-2.5 px-3.5 py-3">
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="idx === 0 ? 'bg-profit text-white' : 'bg-muted text-muted-foreground'"
            >
              <Medal class="h-3.5 w-3.5" />
              {{ idx + 1 }}위
            </span>
            <span
              class="inline-flex h-8 min-w-10 shrink-0 items-center justify-center rounded-xl px-1.5 text-tiny font-bold whitespace-nowrap"
              :class="result.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
              :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color, color: ALL_CHANNEL_META[result.marketKey].foreground }"
            >
              {{ ALL_CHANNEL_META[result.marketKey].shortName }}
            </span>
            <div class="min-w-0 flex-1">
              <span class="block truncate text-body font-bold text-foreground">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
              <span v-if="isOwnStore(result.marketKey)" class="text-[10px] text-muted-foreground">등급 연동</span>
            </div>
          </div>
          <div class="space-y-0 border-t border-border/60">
            <div class="grid grid-cols-[4.5rem_1fr] items-center border-b border-border/40 px-3.5 py-2.5">
              <span class="text-[11px] font-semibold text-muted-foreground sm:text-caption">총 수수료</span>
              <span class="text-right text-[11px] font-semibold tabular-nums text-fee sm:text-caption">{{ formatWon(result.totalFee) }}</span>
            </div>
            <div class="grid grid-cols-[4.5rem_1fr] items-center border-b border-border/40 px-3.5 py-2.5">
              <span class="text-[11px] font-semibold text-muted-foreground sm:text-caption">수수료율(VAT 포함)</span>
              <span class="text-right text-body font-bold tabular-nums" :class="idx === 0 ? 'text-profit' : 'text-foreground'">{{ formatPercent(result.totalFeeRate, 2) }}</span>
            </div>
            <div class="grid grid-cols-[4.5rem_1fr] items-center px-3.5 py-2.5">
              <span class="text-[11px] font-semibold text-muted-foreground sm:text-caption">건당 순이익</span>
              <span class="text-right text-[11px] font-bold tabular-nums sm:text-caption" :class="idx === 0 ? 'text-profit' : 'text-foreground'">{{ formatWon(result.netProfit) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 데스크톱: 테이블 레이아웃 -->
      <div class="hidden md:block">
        <ShTable
          aria-label="판매 채널별 수수료와 순이익 비교"
          density="compact"
          scroll-hint="표를 좌우로 스크롤해 전체 채널을 확인하세요."
        >
          <colgroup>
            <col class="w-[7%]" />
            <col />
            <col class="w-[16%]" />
            <col class="w-[16%]" />
            <col class="w-[18%]" />
          </colgroup>
          <ShTableHeader>
            <ShTableRow>
              <ShTableHead>순위</ShTableHead>
              <ShTableHead>마켓</ShTableHead>
              <ShTableHead numeric>총 수수료</ShTableHead>
              <ShTableHead numeric title="총 수수료 ÷ 판매가">수수료율(VAT 포함)</ShTableHead>
              <ShTableHead numeric>
                <span class="flex w-full items-center justify-between gap-1.5">
                  건당 순이익
                  <CopyTableButton :headers="copyHeaders" :rows="copyRows" />
                </span>
              </ShTableHead>
            </ShTableRow>
          </ShTableHeader>
          <ShTableBody>
            <ShTableRow
              v-for="(result, idx) in sortedResults"
              :key="result.marketKey"
              :selected="idx === 0"
            >
              <ShTableCell>
                <ShBadge :tone="idx === 0 ? 'success' : 'neutral'">
                  <Medal class="h-3.5 w-3.5" />
                  {{ idx + 1 }}위
                </ShBadge>
              </ShTableCell>
              <ShTableCell>
                <div class="flex items-center gap-2.5">
                  <span
                    class="inline-flex h-8 min-w-10 items-center justify-center rounded-sm px-1.5 text-tiny font-bold"
                    :class="result.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
                    :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color, color: ALL_CHANNEL_META[result.marketKey].foreground }"
                  >
                    {{ ALL_CHANNEL_META[result.marketKey].shortName }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span class="whitespace-nowrap text-body font-semibold">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
                    <span v-if="isOwnStore(result.marketKey)" class="text-[10px] text-muted-foreground">(등급 연동)</span>
                    <ShBadge v-if="idx === 0" tone="success">
                      <BadgeCheck class="h-3.5 w-3.5" />
                      추천
                    </ShBadge>
                  </div>
                </div>
              </ShTableCell>
              <ShTableCell numeric class="font-semibold text-fee">
                {{ formatWon(result.totalFee) }}
              </ShTableCell>
              <ShTableCell numeric class="font-bold" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
                {{ formatPercent(result.totalFeeRate, 2) }}
              </ShTableCell>
              <ShTableCell numeric class="font-bold" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
                {{ formatWon(result.netProfit) }}
              </ShTableCell>
            </ShTableRow>
          </ShTableBody>
        </ShTable>
      </div>
  </div>
</template>
