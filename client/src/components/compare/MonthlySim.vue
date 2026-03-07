<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatWon, formatWonShort } from "@/lib/utils";
import { MARKET_META } from "@/data/marketFees";
import { QTY_PRESETS } from "@/data/pricePresets";
import { parseMonthlyQty } from "@/lib/validators";
import type { MonthlySimResult } from "@/utils/calculator";

const props = defineProps<{
  simResults: MonthlySimResult[];
  price: number;
  monthlyQty: number;
}>();

const emit = defineEmits<{
  "update:monthlyQty": [value: number];
}>();

const monthlyRevenue = computed(() => props.price * props.monthlyQty);

// 건수 입력 표시
const qtyDisplay = ref(String(props.monthlyQty));
watch(() => props.monthlyQty, (val) => {
  qtyDisplay.value = String(val);
});

function handleQtyInput(e: Event): void {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const parsed = Number.parseInt(raw, 10);
  const validated = parseMonthlyQty(parsed);
  if (validated != null) {
    emit("update:monthlyQty", validated);
  }
}

// 최대 연 수수료 (바 차트 기준)
const maxAnnualFee = computed(() =>
  Math.max(...props.simResults.map((s) => s.annualFee), 1)
);

// 최저 수수료 마켓
const bestSim = computed(() =>
  props.simResults.reduce((best, s) => s.annualFee < best.annualFee ? s : best, props.simResults[0])
);

// 가장 비싼 마켓 (핵심 메시지용)
const worstSim = computed(() =>
  props.simResults.reduce((worst, s) => s.annualFee > worst.annualFee ? s : worst, props.simResults[0])
);
</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title">월간 시뮬레이션</h3>
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 건수 입력 (인라인) -->
      <div class="flex flex-wrap items-center gap-2">
        <label for="sim-qty-input" class="text-caption font-semibold text-foreground shrink-0">월 판매</label>
        <div class="relative w-24">
          <input
            id="sim-qty-input"
            type="text"
            inputmode="numeric"
            class="retro-input tabular-nums text-right pr-7 py-1.5 text-caption"
            :value="qtyDisplay"
            @input="handleQtyInput"
          />
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">건</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="preset in QTY_PRESETS"
            :key="preset.value"
            type="button"
            :class="[
              'px-2 py-1 rounded-md text-tiny font-semibold transition-all duration-200',
              'touch-target',
              monthlyQty === preset.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
            ]"
            @click="emit('update:monthlyQty', preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <p class="text-caption text-muted-foreground text-center">
        판매가 {{ formatWon(price) }} &times; {{ monthlyQty }}건 = 월 매출 {{ formatWon(monthlyRevenue) }}
      </p>

      <!-- 비교 테이블 -->
      <p class="scroll-hint">좌우로 스크롤해 마켓별 수치를 비교하세요.</p>
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
                class="px-3 py-2 text-right text-body font-semibold tabular-nums text-fee"
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
                class="px-3 py-2 text-right text-body font-bold tabular-nums text-fee"
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
                :class="sim.annualDiff === 0 ? 'text-profit' : 'text-fee'"
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

      <!-- 핵심 메시지 (가장 비싼 마켓 1개만 비교) -->
      <div class="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-center">
        <p class="text-body font-bold text-foreground">
          {{ MARKET_META[worstSim.marketKey].name }}보다
          {{ MARKET_META[bestSim.marketKey].name }}에서 연
          {{ formatWonShort(worstSim.annualFee - bestSim.annualFee) }} 아낄 수 있어요
        </p>
      </div>
    </div>
  </div>
</template>
