<script setup lang="ts">
import { computed } from "vue";
import { formatWon, formatWonShort } from "@/lib/utils";
import { MARKET_META } from "@/data/marketFees";
import type { MonthlySimResult } from "@/utils/calculator";

const props = defineProps<{
  simResults: MonthlySimResult[];
  price: number;
  monthlyQty: number;
}>();

const monthlyRevenue = computed(() => props.price * props.monthlyQty);

// 최대 연 수수료 (바 차트 기준)
const maxAnnualFee = computed(() =>
  Math.max(...props.simResults.map((s) => s.annualFee), 1)
);

// 최저 수수료 마켓
const bestSim = computed(() =>
  props.simResults.reduce((best, s) => s.annualFee < best.annualFee ? s : best, props.simResults[0])
);
</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title">월 {{ monthlyQty }}건 판매 시 수수료 시뮬레이션</h3>
    </div>

    <div class="retro-panel-content space-y-4">
      <p class="text-caption text-muted-foreground text-center">
        판매가 {{ formatWon(price) }} &times; {{ monthlyQty }}건 = 월 매출 {{ formatWon(monthlyRevenue) }}
      </p>

      <!-- 비교 테이블 -->
      <div class="overflow-x-auto">
        <table class="w-full text-body">
          <thead>
            <tr class="border-b border-border/80">
              <th class="px-3 py-2 text-left text-caption font-semibold text-muted-foreground"></th>
              <th
                v-for="sim in simResults"
                :key="sim.marketKey"
                class="px-3 py-2 text-right text-caption font-semibold"
                :style="{ color: MARKET_META[sim.marketKey].color }"
              >
                {{ MARKET_META[sim.marketKey].name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-border/40">
              <td class="px-3 py-2 text-caption text-muted-foreground">월 수수료</td>
              <td
                v-for="sim in simResults"
                :key="sim.marketKey"
                class="px-3 py-2 text-right text-body font-semibold tabular-nums text-red-500 dark:text-red-400"
              >
                {{ formatWon(sim.monthlyFee) }}
              </td>
            </tr>
            <tr class="border-b border-border/40">
              <td class="px-3 py-2 text-caption text-muted-foreground">월 순이익</td>
              <td
                v-for="sim in simResults"
                :key="sim.marketKey"
                class="px-3 py-2 text-right text-body font-semibold tabular-nums"
              >
                {{ formatWon(sim.monthlyProfit) }}
              </td>
            </tr>
            <tr class="border-b border-border/40 bg-muted/10">
              <td class="px-3 py-2 text-caption font-bold text-foreground">연 수수료</td>
              <td
                v-for="sim in simResults"
                :key="sim.marketKey"
                class="px-3 py-2 text-right text-body font-bold tabular-nums text-red-500 dark:text-red-400"
              >
                {{ formatWon(sim.annualFee) }}
              </td>
            </tr>
            <tr>
              <td class="px-3 py-2 text-caption text-muted-foreground">연 차이</td>
              <td
                v-for="sim in simResults"
                :key="sim.marketKey"
                class="px-3 py-2 text-right text-body font-semibold tabular-nums"
                :class="sim.annualDiff === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
              >
                {{ sim.annualDiff === 0 ? '기준' : `+${formatWon(sim.annualDiff)}` }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 연간 수수료 바 차트 -->
      <div class="space-y-2">
        <p class="text-caption font-semibold text-foreground">연간 수수료 비교</p>
        <div class="space-y-2">
          <div
            v-for="sim in simResults"
            :key="sim.marketKey"
            class="flex items-center gap-2"
          >
            <span class="w-20 text-caption font-semibold text-right shrink-0">
              {{ MARKET_META[sim.marketKey].name }}
            </span>
            <div class="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden">
              <div
                class="h-full rounded-lg transition-all duration-500"
                :style="{
                  width: `${(sim.annualFee / maxAnnualFee) * 100}%`,
                  backgroundColor: MARKET_META[sim.marketKey].color,
                  minWidth: '2px',
                }"
              />
            </div>
            <span class="w-24 text-caption font-semibold tabular-nums text-right shrink-0">
              {{ formatWonShort(sim.annualFee) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 핵심 메시지 -->
      <div class="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-center">
        <p class="text-body font-bold text-foreground">
          {{ MARKET_META[bestSim.marketKey].name }} 대비
          <template v-for="sim in simResults" :key="sim.marketKey">
            <template v-if="sim.marketKey !== bestSim.marketKey && sim.annualDiff > 0">
              {{ MARKET_META[sim.marketKey].name }}은 연 {{ formatWonShort(sim.annualDiff) }} 더 나가요
            </template>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
