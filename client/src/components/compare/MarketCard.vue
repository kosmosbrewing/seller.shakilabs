<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { formatWon, formatPercent } from "@/lib/utils";
import { MARKET_META } from "@/data/marketFees";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  result: FeeBreakdown;
  isBest: boolean;
}>();

const meta = computed(() => MARKET_META[props.result.marketKey]);
const showDetail = ref(false);
</script>

<template>
  <div
    :class="[
      'retro-panel relative overflow-hidden transition-all duration-200',
      isBest ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : '',
    ]"
  >
    <!-- 가장 유리한 마켓 뱃지 -->
    <div
      v-if="isBest"
      class="absolute top-0 right-0 bg-emerald-500 text-white text-tiny font-bold px-2 py-0.5 rounded-bl-lg"
    >
      최저
    </div>

    <!-- 마켓 헤더 -->
    <div class="px-4 pt-4 pb-2 text-center">
      <div
        class="inline-flex items-center justify-center h-8 w-8 rounded-lg mb-1.5"
        :style="{ backgroundColor: meta.color + '15' }"
      >
        <span class="text-body font-bold" :style="{ color: meta.color }">
          {{ meta.name.charAt(0) }}
        </span>
      </div>
      <p class="text-caption font-bold text-foreground">{{ meta.name }}</p>
    </div>

    <!-- 순이익 (핵심 숫자) -->
    <div class="px-4 pb-2 text-center">
      <p class="text-tiny text-muted-foreground">순이익</p>
      <p class="text-h1 font-bold tabular-nums" :class="isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'">
        {{ formatWon(result.netProfit) }}
      </p>
    </div>

    <!-- 수수료 -->
    <div class="px-4 pb-3 text-center">
      <p class="text-tiny text-muted-foreground">수수료</p>
      <p class="text-body font-bold tabular-nums text-red-500 dark:text-red-400">
        -{{ formatWon(result.totalFee) }}
      </p>
      <p class="text-tiny text-muted-foreground tabular-nums">
        ({{ formatPercent(result.totalFeeRate) }})
      </p>
    </div>

    <!-- 상세 토글 -->
    <button
      type="button"
      class="w-full flex items-center justify-center gap-1 border-t border-border/50 px-3 py-2 text-caption font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
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
          <span class="font-semibold tabular-nums text-red-500 dark:text-red-400">
            -{{ formatWon(item.amount) }}
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
