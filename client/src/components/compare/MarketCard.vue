<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
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
      'retro-panel relative overflow-hidden transition-all duration-200',
      isBest ? 'ring-2 ring-profit' : '',
      highlight ? 'card-highlight' : '',
    ]"
  >
    <!-- 가장 유리한 마켓 뱃지 -->
    <div
      v-if="isBest"
      class="absolute top-0 right-0 bg-profit text-white text-tiny font-bold px-2 py-0.5 rounded-bl-lg"
    >
      최저
    </div>

    <!-- 마켓 헤더 -->
    <div class="px-3 pt-3 pb-1.5 text-center">
      <div
        class="inline-flex items-center justify-center h-8 min-w-8 px-1.5 rounded-lg mb-1"
        :style="{ backgroundColor: meta.color + '15' }"
      >
        <span class="text-caption font-bold" :style="{ color: meta.color }">
          {{ meta.shortName }}
        </span>
      </div>
      <p class="text-caption font-bold text-foreground truncate">{{ meta.name }}</p>
      <p v-if="rank != null" class="mt-1 text-tiny font-semibold text-muted-foreground">
        순위 {{ rank }}위
      </p>
    </div>

    <!-- 순이익 (핵심 숫자) -->
    <div class="px-3 pb-1.5 text-center">
      <p class="text-tiny text-muted-foreground">순이익</p>
      <p class="text-h1 font-bold tabular-nums whitespace-nowrap" :class="isBest ? 'text-profit' : 'text-foreground'">
        <span class="hidden sm:inline">{{ formatWon(result.netProfit) }}</span>
        <span class="sm:hidden">{{ formatWonShort(result.netProfit) }}</span>
      </p>
      <p class="mt-1 text-tiny" :class="isBest ? 'text-profit/85' : 'text-muted-foreground'">
        <span v-if="isBest">현재 조건에서 가장 유리</span>
        <span v-else>1위 대비 {{ formatWonShort(netGap) }} 낮음</span>
      </p>
    </div>

    <!-- 수수료 -->
    <div class="px-4 pb-3 text-center">
      <p class="text-tiny text-muted-foreground">수수료</p>
      <p class="text-body font-bold tabular-nums text-fee">
        -{{ formatWon(result.totalFee) }}
      </p>
      <p class="text-tiny text-muted-foreground tabular-nums">
        ({{ formatPercent(result.totalFeeRate) }})
      </p>
    </div>

    <!-- 상세 토글 -->
    <button
      type="button"
      class="touch-target w-full flex items-center justify-center gap-1 border-t border-border/50 px-3 py-2 text-caption font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      @click="showDetail = !showDetail"
    >
      <span>상세</span>
      <ChevronDown class="h-3.5 w-3.5 transition-transform duration-200" :class="{ 'rotate-180': showDetail }" />
    </button>

    <!-- 상세 내역 -->
    <Transition name="slide-fade">
      <div v-if="showDetail" class="border-t border-border/50 px-4 py-3 space-y-1.5 bg-muted/10">
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
