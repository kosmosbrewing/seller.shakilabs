<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BadgeCheck, Medal, TrendingDown, TrendingUp, Wallet } from "lucide-vue-next";
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

const sortedSims = computed(() =>
  [...props.simResults].sort((a, b) => a.annualFee - b.annualFee)
);

const maxAnnualFee = computed(() =>
  Math.max(...props.simResults.map((s) => s.annualFee), 1)
);

const bestSim = computed(() => sortedSims.value[0] ?? null);
const runnerUpSim = computed(() => sortedSims.value[1] ?? null);
const worstSim = computed(() =>
  sortedSims.value.length ? sortedSims.value[sortedSims.value.length - 1] : null
);

const annualSpread = computed(() => {
  if (!bestSim.value || !worstSim.value) return 0;
  return Math.max(0, worstSim.value.annualFee - bestSim.value.annualFee);
});

const monthlySpread = computed(() => {
  if (!bestSim.value || !worstSim.value) return 0;
  return Math.max(0, worstSim.value.monthlyFee - bestSim.value.monthlyFee);
});

const bestVsRunnerUp = computed(() => {
  if (!runnerUpSim.value) return 0;
  return Math.max(0, runnerUpSim.value.annualDiff);
});
</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title">월간 시뮬레이션</h3>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)]">
        <div class="retro-panel-muted p-3.5 sm:p-4">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Wallet class="h-4.5 w-4.5" />
            </span>
            <div>
              <p class="text-caption font-bold text-foreground">판매량 설정</p>
              <p class="text-tiny text-muted-foreground">월간 판매 건수를 바꾸면 바로 재계산됩니다.</p>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <label for="sim-qty-input" class="text-caption font-semibold text-foreground shrink-0">월 판매</label>
            <div class="relative w-28">
              <input
                id="sim-qty-input"
                type="text"
                inputmode="numeric"
                class="retro-input tabular-nums pr-8 text-right text-body font-semibold"
                :value="qtyDisplay"
                @input="handleQtyInput"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">건</span>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-1.5">
            <button
              v-for="preset in QTY_PRESETS"
              :key="preset.value"
              type="button"
              :class="[
                'touch-target rounded-xl border px-3 py-1.5 text-tiny font-semibold transition-colors',
                monthlyQty === preset.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              ]"
              @click="emit('update:monthlyQty', preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>

          <div class="mt-3 rounded-2xl bg-background px-3.5 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              월 매출 추정
            </p>
            <p class="mt-1.5 text-heading font-black tabular-nums text-foreground">
              {{ formatWon(monthlyRevenue) }}
            </p>
            <p class="mt-1 text-caption text-muted-foreground">
              판매가 {{ formatWon(price) }} × {{ monthlyQty.toLocaleString("ko-KR") }}건
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div class="rounded-[1.35rem] border border-profit/20 bg-profit/8 px-3.5 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-profit/80">
              최적 마켓
            </p>
            <p class="mt-1.5 text-body font-black text-foreground">
              {{ bestSim ? MARKET_META[bestSim.marketKey].name : "-" }}
            </p>
            <p class="mt-1 text-caption text-muted-foreground">
              연 수수료 {{ bestSim ? formatWon(bestSim.annualFee) : "-" }}
            </p>
          </div>

          <div class="rounded-[1.35rem] border border-primary/20 bg-primary/8 px-3.5 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">
              1위 vs 2위
            </p>
            <p class="mt-1.5 text-body font-black tabular-nums text-foreground">
              {{ formatWon(bestVsRunnerUp) }}
            </p>
            <p class="mt-1 text-caption text-muted-foreground">
              연간 추가 절감
            </p>
          </div>

          <div class="rounded-[1.35rem] border border-fee/20 bg-fee/5 px-3.5 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-fee/80">
              최대 편차
            </p>
            <p class="mt-1.5 text-body font-black tabular-nums text-foreground">
              {{ formatWon(annualSpread) }}
            </p>
            <p class="mt-1 text-caption text-muted-foreground">
              월 {{ formatWon(monthlySpread) }} 차이
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl bg-muted/20 px-3.5 py-3 text-caption text-muted-foreground">
        연 수수료가 낮을수록 같은 판매량에서 더 많은 순이익이 남습니다. 아래 카드는 유리한 순서대로 정렬되어 있습니다.
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="(sim, index) in sortedSims"
          :key="sim.marketKey"
          class="retro-panel overflow-hidden rounded-3xl"
        >
          <div class="px-4 pt-4 pb-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl px-2"
                  :style="{ backgroundColor: `${MARKET_META[sim.marketKey].color}18` }"
                >
                  <span class="text-caption font-black" :style="{ color: MARKET_META[sim.marketKey].color }">
                    {{ MARKET_META[sim.marketKey].shortName }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-body font-bold text-foreground">
                    {{ MARKET_META[sim.marketKey].name }}
                  </p>
                  <div class="mt-1 flex items-center gap-1.5 text-[11px] font-semibold">
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                      :class="index === 0 ? 'bg-profit/12 text-profit' : 'bg-muted text-muted-foreground'"
                    >
                      <Medal class="h-3.5 w-3.5" />
                      {{ index + 1 }}위
                    </span>
                    <span
                      v-if="index === 0"
                      class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-white"
                    >
                      <BadgeCheck class="h-3.5 w-3.5" />
                      추천
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-3 rounded-[1.35rem] px-3 py-3 sm:px-3.5 sm:py-3.5" :class="index === 0 ? 'bg-profit/8' : 'bg-muted/25'">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                연 수수료
              </p>
              <p class="mt-2 font-black leading-none tabular-nums text-[26px] sm:text-[28px]" :class="index === 0 ? 'text-profit' : 'text-foreground'">
                <span class="hidden sm:inline">{{ formatWon(sim.annualFee) }}</span>
                <span class="sm:hidden">{{ formatWonShort(sim.annualFee) }}</span>
              </p>
              <p class="mt-2 text-caption font-semibold" :class="index === 0 ? 'text-profit/85' : 'text-muted-foreground'">
                {{
                  index === 0
                    ? '가장 낮은 연 수수료'
                    : `1위보다 연 ${formatWonShort(sim.annualDiff)} 더 지출`
                }}
              </p>
            </div>

            <div class="mt-2.5 grid grid-cols-2 gap-2">
              <div class="rounded-2xl border border-border/70 bg-background px-3 py-3">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  월 수수료
                </p>
                <p class="mt-1.5 text-body font-bold tabular-nums text-fee">
                  {{ formatWon(sim.monthlyFee) }}
                </p>
              </div>
              <div class="rounded-2xl border border-border/70 bg-background px-3 py-3">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  월 순이익
                </p>
                <p class="mt-1.5 text-body font-bold tabular-nums text-foreground">
                  <span class="hidden sm:inline">{{ formatWon(sim.monthlyProfit) }}</span>
                  <span class="sm:hidden">{{ formatWonShort(sim.monthlyProfit) }}</span>
                </p>
              </div>
            </div>

            <div class="mt-2.5">
              <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <span>연 수수료 상대 크기</span>
                <span>{{ formatWonShort(sim.annualFee) }}</span>
              </div>
              <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-muted/40">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${(sim.annualFee / maxAnnualFee) * 100}%`,
                    backgroundColor: MARKET_META[sim.marketKey].color,
                    minWidth: '8px',
                  }"
                />
              </div>
            </div>

            <div
              class="mt-2.5 flex items-start gap-2 rounded-2xl px-3 py-2.5 text-caption"
              :class="index === 0 ? 'bg-profit/10 text-profit' : 'bg-muted/30 text-muted-foreground'"
            >
              <component :is="index === 0 ? TrendingUp : TrendingDown" class="mt-0.5 h-4 w-4 shrink-0" />
              <span class="hidden sm:inline">
                {{
                  index === 0
                    ? `가장 비싼 ${worstSim ? MARKET_META[worstSim.marketKey].name : ''} 대비 연 ${formatWonShort(annualSpread)} 절감`
                    : '상세 비교표와 함께 보면 실제 수수료 차이를 더 정확히 해석할 수 있습니다.'
                }}
              </span>
              <span class="sm:hidden">
                {{
                  index === 0
                    ? `연 ${formatWonShort(annualSpread)} 절감`
                    : `1위와 연 ${formatWonShort(sim.annualDiff)} 차이`
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="bestSim && worstSim"
        class="rounded-[1.4rem] border border-primary/20 bg-primary/10 px-4 py-3.5 text-center"
      >
        <p class="text-body font-bold text-foreground">
          {{ MARKET_META[worstSim.marketKey].name }}보다
          {{ MARKET_META[bestSim.marketKey].name }}에서 연
          {{ formatWonShort(annualSpread) }} 아낄 수 있어요
        </p>
        <p class="mt-1 text-caption text-muted-foreground">
          월 기준으로는 {{ formatWonShort(monthlySpread) }} 차이입니다.
        </p>
      </div>
    </div>
  </div>
</template>
