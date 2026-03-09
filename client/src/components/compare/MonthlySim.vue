<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BadgeCheck, Medal } from "lucide-vue-next";
import { formatWon, formatWonShort } from "@/lib/utils";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { QTY_PRESETS } from "@/data/pricePresets";
import { Button } from "@/components/ui/button";
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

const bestSim = computed(() => sortedSims.value[0] ?? null);
const worstSim = computed(() =>
  sortedSims.value.length ? sortedSims.value[sortedSims.value.length - 1] : null
);

const annualSpread = computed(() => {
  if (!bestSim.value || !worstSim.value) return 0;
  return Math.max(0, worstSim.value.annualFee - bestSim.value.annualFee);
});
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar flex-col items-start gap-2 rounded-t-2xl sm:flex-row sm:items-center sm:gap-3">
      <h2 class="retro-title">월간 시뮬레이션</h2>
      <div class="flex flex-wrap items-center gap-2">
        <label for="sim-qty-input" class="text-caption font-semibold text-muted-foreground shrink-0">월 판매</label>
        <div class="relative w-24">
          <input
            id="sim-qty-input"
            type="text"
            inputmode="numeric"
            class="retro-input tabular-nums pr-7 text-right text-caption font-semibold py-1.5"
            :value="qtyDisplay"
            @input="handleQtyInput"
          />
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-tiny text-muted-foreground">건</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <Button
            v-for="preset in QTY_PRESETS"
            :key="preset.value"
            type="button"
            :variant="monthlyQty === preset.value ? 'default' : 'outline'"
            size="chipSm"
            @click="emit('update:monthlyQty', preset.value)"
          >
            {{ preset.label }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 모바일: 카드 레이아웃 -->
    <div class="space-y-3 px-3.5 py-3 md:hidden">
      <div
        v-for="(sim, idx) in sortedSims"
        :key="`m-${sim.marketKey}`"
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
            :class="sim.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
            :style="{ backgroundColor: ALL_CHANNEL_META[sim.marketKey].color }"
          >
            {{ ALL_CHANNEL_META[sim.marketKey].shortName }}
          </span>
          <span class="min-w-0 flex-1 truncate text-body font-bold text-foreground">{{ ALL_CHANNEL_META[sim.marketKey].name }}</span>
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
            <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">월 수수료</span>
            <span class="text-[11px] font-semibold tabular-nums text-fee sm:text-caption">{{ formatWon(sim.monthlyFee) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
            <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">월 순이익</span>
            <span class="text-[11px] font-bold tabular-nums sm:text-caption" :class="idx === 0 ? 'text-profit' : 'text-foreground'">{{ formatWon(sim.monthlyProfit) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
            <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">연 수수료</span>
            <span class="text-[11px] font-semibold tabular-nums text-foreground sm:text-caption">{{ formatWon(sim.annualFee) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">1위 대비</span>
            <span v-if="idx === 0" class="text-[11px] font-semibold text-profit sm:text-caption">최저</span>
            <span v-else class="text-[11px] font-semibold tabular-nums text-fee sm:text-caption">+{{ formatWon(sim.annualDiff) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 데스크톱: 테이블 레이아웃 -->
    <div class="hidden md:block">
    <p class="scroll-hint">표를 좌우로 밀어 확인하세요.</p>

    <div class="overflow-x-auto">
      <table class="w-full text-body">
        <thead>
          <tr class="border-b border-border/80 bg-card/95">
            <th class="w-20 whitespace-nowrap px-4 py-3 text-left text-caption font-semibold text-muted-foreground">순위</th>
            <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">마켓</th>
            <th class="whitespace-nowrap px-4 py-3 text-right text-caption font-semibold text-muted-foreground">월 수수료</th>
            <th class="whitespace-nowrap px-4 py-3 text-right text-caption font-semibold text-muted-foreground">월 순이익</th>
            <th class="whitespace-nowrap px-4 py-3 text-right text-caption font-semibold text-muted-foreground">연 수수료</th>
            <th class="whitespace-nowrap px-4 py-3 text-right text-caption font-semibold text-muted-foreground">1위 대비</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(sim, idx) in sortedSims"
            :key="sim.marketKey"
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
                  :class="sim.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
                  :style="{ backgroundColor: ALL_CHANNEL_META[sim.marketKey].color }"
                >
                  {{ ALL_CHANNEL_META[sim.marketKey].shortName }}
                </span>
                <div class="flex items-center gap-1.5">
                  <span class="whitespace-nowrap text-body font-semibold">{{ ALL_CHANNEL_META[sim.marketKey].name }}</span>
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
              {{ formatWon(sim.monthlyFee) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
              <span class="hidden sm:inline">{{ formatWon(sim.monthlyProfit) }}</span>
              <span class="sm:hidden">{{ formatWonShort(sim.monthlyProfit) }}</span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">
              <span class="hidden sm:inline">{{ formatWon(sim.annualFee) }}</span>
              <span class="sm:hidden">{{ formatWonShort(sim.annualFee) }}</span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right tabular-nums">
              <span v-if="idx === 0" class="text-caption text-profit font-semibold">최저</span>
              <span v-else class="text-caption text-fee font-semibold">
                +<span class="hidden sm:inline">{{ formatWon(sim.annualDiff) }}</span>
                <span class="sm:hidden">{{ formatWonShort(sim.annualDiff) }}</span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>

    <div v-if="bestSim && worstSim" class="border-t border-border/40 px-4 py-3">
      <p class="text-caption text-muted-foreground">
        월 매출 <span class="font-semibold text-foreground">{{ formatWonShort(monthlyRevenue) }}</span> 기준,
        <span class="font-semibold text-profit">{{ ALL_CHANNEL_META[bestSim.marketKey].name }}</span>이
        {{ ALL_CHANNEL_META[worstSim.marketKey].name }}보다 연
        <span class="font-semibold text-profit">{{ formatWonShort(annualSpread) }}</span> 절감됩니다.
      </p>
    </div>
  </div>
</template>
