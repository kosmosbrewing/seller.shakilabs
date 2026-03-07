<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BadgeCheck, ChevronDown, Medal } from "lucide-vue-next";
import { formatWon, formatWonShort, formatPercent } from "@/lib/utils";
import { MARKET_META } from "@/data/marketFees";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  result: FeeBreakdown;
  isBest: boolean;
  rank: number | null;
  netGap: number;
}>();

const meta = computed(() => MARKET_META[props.result.marketKey]);
const showDetail = ref(false);
const rankLabel = computed(() => {
  if (props.rank === 1) return "1위";
  if (props.rank === 2) return "2위";
  if (props.rank === 3) return "3위";
  return props.rank != null ? `${props.rank}위` : "-";
});
const gapLabel = computed(() => {
  if (props.isBest) return "현재 조건에서 가장 유리";
  if (props.netGap <= 0) return "1위와 동일 수준";
  return `1위보다 ${formatWonShort(props.netGap)} 덜 남음`;
});

// 결과 변경 시 짧은 하이라이트 애니메이션
const highlight = ref(false);
watch(() => props.result.totalFee, () => {
  highlight.value = true;
  setTimeout(() => { highlight.value = false; }, 400);
});
</script>

<template>
  <div
    :class="[
      'retro-panel relative overflow-hidden rounded-3xl transition-all duration-200',
      isBest ? 'ring-2 ring-profit shadow-[0_12px_30px_rgba(20,130,90,0.16)]' : 'hover:-translate-y-0.5',
      highlight ? 'card-highlight' : '',
    ]"
  >
    <div
      v-if="isBest"
      class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
    >
      <BadgeCheck class="h-3.5 w-3.5" />
      추천
    </div>

    <div class="px-4 pt-4 pb-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl px-2"
            :style="{ backgroundColor: meta.color + '18' }"
          >
            <span class="text-caption font-black" :style="{ color: meta.color }">
              {{ meta.shortName }}
            </span>
          </div>
          <div class="min-w-0">
            <p class="truncate text-body font-bold text-foreground">{{ meta.name }}</p>
            <div class="mt-1 flex items-center gap-1.5 text-[11px] font-semibold">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                :class="isBest ? 'bg-profit/12 text-profit' : 'bg-muted text-muted-foreground'"
              >
                <Medal class="h-3.5 w-3.5" />
                {{ rankLabel }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 pb-4">
      <div
        class="rounded-[1.35rem] px-3.5 py-3.5"
        :class="isBest ? 'bg-profit/8' : 'bg-muted/25'"
      >
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          건당 순이익
        </p>
        <p class="mt-2 text-[30px] font-black leading-none tabular-nums whitespace-nowrap" :class="isBest ? 'text-profit' : 'text-foreground'">
          <span class="hidden sm:inline">{{ formatWon(result.netProfit) }}</span>
          <span class="sm:hidden">{{ formatWonShort(result.netProfit) }}</span>
        </p>
        <p class="mt-2 text-caption font-semibold" :class="isBest ? 'text-profit/85' : 'text-muted-foreground'">
          {{ gapLabel }}
        </p>
      </div>

      <div class="mt-2.5 grid grid-cols-2 gap-2">
        <div class="rounded-2xl border border-border/70 bg-background px-3 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            총 수수료
          </p>
          <p class="mt-1.5 text-body font-bold tabular-nums text-fee">
            -{{ formatWon(result.totalFee) }}
          </p>
        </div>
        <div class="rounded-2xl border border-border/70 bg-background px-3 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            수수료율
          </p>
          <p class="mt-1.5 text-body font-bold tabular-nums text-foreground">
            {{ formatPercent(result.totalFeeRate) }}
          </p>
        </div>
      </div>
    </div>

    <!-- 상세 토글 -->
    <button
      type="button"
      class="touch-target flex w-full items-center justify-center gap-1 border-t border-border/50 px-3 py-2.5 text-caption font-semibold text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
      @click="showDetail = !showDetail"
    >
      <span>{{ showDetail ? "상세 닫기" : "수수료 상세 보기" }}</span>
      <ChevronDown class="h-3.5 w-3.5 transition-transform duration-200" :class="{ 'rotate-180': showDetail }" />
    </button>

    <!-- 상세 내역 -->
    <Transition name="slide-fade">
      <div v-if="showDetail" class="border-t border-border/50 bg-muted/10 px-4 py-3 space-y-1.5">
        <div
          v-for="(item, idx) in result.items"
          :key="idx"
          class="flex items-center justify-between text-caption"
        >
          <span class="text-muted-foreground">{{ item.label }}</span>
          <span class="font-semibold tabular-nums text-fee">
            -{{ formatWon(item.amount) }}
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.card-highlight {
  animation: card-flash 0.4s ease-out;
}

@keyframes card-flash {
  0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
  50% { box-shadow: 0 0 0 4px hsl(var(--primary) / 0.3); }
  100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
}
</style>
