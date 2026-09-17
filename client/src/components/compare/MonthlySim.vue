<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ShBadge, ShPresetGroup } from "@shakilabs/ui";
import { BadgeCheck, Medal } from "lucide-vue-next";
import { formatWon } from "@/lib/utils";
import { ALL_CHANNEL_META } from "@/data/marketFees";
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
  [...props.simResults].sort((a, b) => a.monthlyFee - b.monthlyFee)
);

const bestSim = computed(() => sortedSims.value[0] ?? null);
const worstSim = computed(() =>
  sortedSims.value.length ? sortedSims.value[sortedSims.value.length - 1] : null
);

const monthlySpread = computed(() => {
  if (!bestSim.value || !worstSim.value) return 0;
  return Math.max(0, worstSim.value.monthlyFee - bestSim.value.monthlyFee);
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
        <ShPresetGroup
          :model-value="monthlyQty"
          :options="QTY_PRESETS"
          label="월 판매 건수 빠른 선택"
          @update:model-value="emit('update:monthlyQty', $event)"
        />
      </div>
    </div>

    <!-- 모바일: 카드 레이아웃 -->
    <div class="seller-mobile-list space-y-3 px-3.5 py-3 md:hidden">
      <p class="text-caption text-muted-foreground">수수료 낮은순 · 월 판매 기준 수수료와 순이익 비교</p>
      <div
        v-for="(sim, idx) in sortedSims"
        :key="`m-${sim.marketKey}`"
        class="overflow-hidden rounded-2xl border bg-card"
        :class="idx === 0 ? 'border-status-success/40' : 'border-border/70'"
      >
        <div class="seller-result-header flex items-center gap-2.5 px-3.5 py-3">
          <ShBadge :tone="idx === 0 ? 'success' : 'neutral'">
            <Medal class="h-3.5 w-3.5" />
            {{ idx + 1 }}위
          </ShBadge>
          <!-- v3 §5.6/BL-060 — 채널 배지 다색은 중성 마크 + 라벨 텍스트로 통일한다 -->
          <span
            class="seller-market-badge inline-flex h-8 min-w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted px-1.5 text-xs font-bold text-foreground whitespace-nowrap"
          >
            {{ ALL_CHANNEL_META[sim.marketKey].shortName }}
          </span>
          <span class="min-w-0 flex-1 truncate text-body font-bold text-foreground">{{ ALL_CHANNEL_META[sim.marketKey].name }}</span>
          <ShBadge v-if="idx === 0" tone="success">
            <BadgeCheck class="h-3.5 w-3.5" />
            추천
          </ShBadge>
        </div>
        <div class="seller-result-metrics space-y-0 border-t border-border/60">
          <div class="grid grid-cols-[4.5rem_1fr] items-center border-b border-border/40 px-3.5 py-2.5">
            <span class="text-caption font-semibold text-muted-foreground">월 수수료</span>
            <span class="text-right text-caption font-semibold tabular-nums text-status-danger">{{ formatWon(sim.monthlyFee) }}</span>
          </div>
          <div class="grid grid-cols-[4.5rem_1fr] items-center border-b border-border/40 px-3.5 py-2.5">
            <span class="text-caption font-semibold text-muted-foreground">월 순이익</span>
            <span class="text-right text-caption font-bold tabular-nums" :class="idx === 0 ? 'text-status-success' : 'text-foreground'">{{ formatWon(sim.monthlyProfit) }}</span>
          </div>
          <div class="grid grid-cols-[4.5rem_1fr] items-center px-3.5 py-2.5">
            <span class="text-caption font-semibold text-muted-foreground">1위 대비</span>
            <span v-if="idx === 0" class="text-right text-caption font-semibold text-status-success">최저</span>
            <span v-else class="text-right text-caption font-semibold tabular-nums text-status-danger">+{{ formatWon(sim.monthlyFee - (bestSim?.monthlyFee ?? 0)) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 데스크톱: 테이블 레이아웃 -->
    <div class="hidden md:block">
    <div class="overflow-x-auto">
      <table aria-label="월별 판매 손익 시뮬레이션" class="w-full table-fixed text-body">
        <colgroup>
          <col class="w-[7%]" />
          <col />
          <col class="w-[16%]" />
          <col class="w-[16%]" />
          <col class="w-[18%]" />
        </colgroup>
        <thead>
          <tr class="border-b border-border/80 bg-card/95">
            <th scope="col" class="whitespace-nowrap px-4 py-3 text-left text-caption font-semibold text-muted-foreground">순위</th>
            <th scope="col" class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">마켓</th>
            <th scope="col" class="whitespace-nowrap px-3 py-3 text-right text-caption font-semibold text-muted-foreground">월 수수료</th>
            <th scope="col" class="whitespace-nowrap px-3 py-3 text-right text-caption font-semibold text-muted-foreground">월 순이익</th>
            <th scope="col" class="whitespace-nowrap px-4 py-3 text-right text-caption font-semibold text-muted-foreground">1위 대비</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(sim, idx) in sortedSims"
            :key="sim.marketKey"
            class="border-b border-border/40 transition-colors"
            :class="idx === 0 ? 'bg-status-success/10 hover:bg-status-success/15 dark:bg-status-success/10 dark:hover:bg-status-success/20' : 'hover:bg-accent/30'"
          >
            <td class="whitespace-nowrap px-4 py-3">
              <ShBadge :tone="idx === 0 ? 'success' : 'neutral'">
                <Medal class="h-3.5 w-3.5" />
                {{ idx + 1 }}위
              </ShBadge>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="inline-flex h-8 min-w-10 items-center justify-center rounded-xl border border-border bg-muted px-1.5 text-tiny font-bold text-foreground"
                >
                  {{ ALL_CHANNEL_META[sim.marketKey].shortName }}
                </span>
                <div class="flex items-center gap-1.5">
                  <span class="whitespace-nowrap text-body font-semibold">{{ ALL_CHANNEL_META[sim.marketKey].name }}</span>
                  <ShBadge v-if="idx === 0" tone="success">
                    <BadgeCheck class="h-3.5 w-3.5" />
                    추천
                  </ShBadge>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums text-status-danger">
              {{ formatWon(sim.monthlyFee) }}
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums" :class="idx === 0 ? 'text-status-success' : 'text-foreground'">
              {{ formatWon(sim.monthlyProfit) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right tabular-nums">
              <span v-if="idx === 0" class="text-caption text-status-success font-semibold">최저</span>
              <span v-else class="text-caption text-status-danger font-semibold">+{{ formatWon(sim.monthlyFee - (bestSim?.monthlyFee ?? 0)) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>

    <div v-if="bestSim && worstSim" class="border-t border-border/40 px-4 py-3">
      <p class="text-caption text-muted-foreground">
        월 매출 <span class="font-semibold text-foreground">{{ formatWon(monthlyRevenue) }}</span> 기준,
        <span class="font-semibold text-status-success">{{ ALL_CHANNEL_META[bestSim.marketKey].name }}</span>이
        {{ ALL_CHANNEL_META[worstSim.marketKey].name }}보다 월
        <span class="font-semibold text-status-success">{{ formatWon(monthlySpread) }}</span> 절감됩니다.
      </p>
    </div>
  </div>
</template>
