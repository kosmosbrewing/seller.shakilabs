<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatPercent, formatWon } from "@/lib/utils";
import type { FeeBreakdown } from "@/utils/calculator";

const props = defineProps<{
  results: FeeBreakdown[];
  includeOwnStore: boolean;
}>();

const emit = defineEmits<{ share: [] }>();

const sortedResults = computed(() => [...props.results].sort((a, b) => a.totalFee - b.totalFee));
const bestResult = computed(() => sortedResults.value[0] ?? null);
const runnerUp = computed(() => sortedResults.value[1] ?? null);
const summaryDelta = computed(() => {
  if (!bestResult.value || !runnerUp.value) return 0;
  return Math.max(0, runnerUp.value.totalFee - bestResult.value.totalFee);
});

// 카운트업 정책(2026-08 복원): 히어로 금액(1위 건당 순이익)만 애니메이션한다.
// 보조문·표는 정적 유지. SSR/SSG 산출물에는 항상 최종값이 정적으로 남는다
// (초기 ref = 최종 포맷값, 애니메이션은 onMounted 이후에만 → 하이드레이션 불일치 없음).
// 마운트 시 0→값, 값 변경 시 현재 표시값→새 값 보간, prefers-reduced-motion 즉시 최종값.
const DURATION_MS = 750;
const NUM_RE = /-?\d[\d,]*(?:\.\d+)?/;

const heroTarget = computed(() =>
  bestResult.value ? formatWon(bestResult.value.netProfit) : "",
);
const displayHero = ref(heroTarget.value);
let rafId = 0;

function parseNum(text: string): { num: number; decimals: number } | null {
  const m = text.match(NUM_RE);
  if (!m) return null;
  const raw = m[0].replace(/,/g, "");
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { num, decimals };
}

function formatLike(template: string, n: number, decimals: number): string {
  const grouped = template.match(NUM_RE)?.[0].includes(",") ?? false;
  const formatted = n.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
  return template.replace(NUM_RE, formatted);
}

function animateTo(from: number, target: string) {
  cancelAnimationFrame(rafId);
  const parsed = parseNum(target);
  if (
    !parsed ||
    parsed.num === from ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    displayHero.value = target;
    return;
  }
  const start = performance.now();
  const delta = parsed.num - from;
  const tick = (now: number) => {
    const t = Math.min((now - start) / DURATION_MS, 1);
    if (t >= 1) {
      displayHero.value = target;
      return;
    }
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    displayHero.value = formatLike(target, from + delta * eased, parsed.decimals);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

onMounted(() => {
  animateTo(0, heroTarget.value);
  watch(heroTarget, (next) => {
    const current = parseNum(displayHero.value)?.num ?? 0;
    animateTo(current, next);
  });
});

onBeforeUnmount(() => cancelAnimationFrame(rafId));
</script>

<template>
  <section id="results" class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">비교 결과</h2>
      <SectionShareButton @click="emit('share')" />
    </div>

    <!-- 결과 히어로 — 전 앱 공통 문법(라벨 위 muted → 금액 text-display 브랜드색 → 보조 muted).
         기본 입력값으로도 항상 계산되므로 첫 화면부터 노출된다. -->
    <div v-if="bestResult" class="border-b border-border/40 px-4 py-4 text-center">
      <p class="text-caption text-muted-foreground">
        1위 {{ ALL_CHANNEL_META[bestResult.marketKey].name }} 건당 순이익
      </p>
      <p class="mt-1 text-display font-bold text-primary tabular-nums">{{ displayHero }}</p>
      <p v-if="runnerUp" class="mt-1 text-caption text-muted-foreground">
        {{ ALL_CHANNEL_META[runnerUp.marketKey].name }}보다 건당 {{ formatWon(summaryDelta) }} 더 남습니다
      </p>
    </div>

    <div class="seller-mobile-list space-y-3 px-3.5 py-3 md:hidden">
      <div
        v-for="(result, idx) in sortedResults"
        :key="`m-${result.marketKey}`"
        class="overflow-hidden rounded-2xl border bg-card"
        :class="idx === 0 ? 'border-profit/40' : 'border-border/70'"
      >
        <div class="seller-result-header flex items-center gap-2.5 px-3.5 py-3">
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold"
            :class="idx === 0 ? 'bg-profit text-profit-foreground' : 'bg-muted text-muted-foreground'"
          >
            <Medal class="h-3.5 w-3.5" />
            {{ idx + 1 }}위
          </span>
          <span
            class="seller-market-badge inline-flex h-8 min-w-10 items-center justify-center rounded-xl px-1.5 text-xs font-bold"
            :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color, color: ALL_CHANNEL_META[result.marketKey].foreground }"
          >
            {{ ALL_CHANNEL_META[result.marketKey].shortName }}
          </span>
          <div class="min-w-0 flex-1">
            <span class="block truncate text-body font-bold text-foreground">
              {{ ALL_CHANNEL_META[result.marketKey].name }}
            </span>
            <span v-if="result.marketKey.startsWith('own_')" class="text-xs text-muted-foreground">등급 연동</span>
          </div>
          <span
            v-if="idx === 0"
            class="inline-flex shrink-0 items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-xs font-semibold text-profit-foreground"
          >
            <BadgeCheck class="h-3.5 w-3.5" />
            추천
          </span>
        </div>
        <div class="seller-result-metrics space-y-0 border-t border-border/60">
          <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
            <span class="shrink-0 text-caption font-semibold text-muted-foreground">총 수수료</span>
            <span class="text-caption font-semibold tabular-nums text-fee">{{ formatWon(result.totalFee) }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
            <span class="shrink-0 text-caption font-semibold text-muted-foreground">수수료율(VAT 포함)</span>
            <span class="text-caption font-semibold tabular-nums text-muted-foreground">
              {{ formatPercent(result.totalFeeRate, 2) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span class="shrink-0 text-caption font-semibold text-muted-foreground">건당 순이익</span>
            <span
              class="text-caption font-bold tabular-nums"
              :class="idx === 0 ? 'text-profit' : 'text-foreground'"
            >
              {{ formatWon(result.netProfit) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden md:block">
      <ShTable
        aria-label="판매 채널별 수수료와 순이익 비교 결과"
        density="compact"
        min-width="42rem"
        scroll-hint="표를 좌우로 스크롤해 전체 채널을 확인하세요."
      >
        <ShTableHeader>
          <ShTableRow>
            <ShTableHead>순위</ShTableHead>
            <ShTableHead>마켓</ShTableHead>
            <ShTableHead numeric>총 수수료</ShTableHead>
            <ShTableHead numeric>수수료율(VAT 포함)</ShTableHead>
            <ShTableHead numeric>건당 순이익</ShTableHead>
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
                    :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color, color: ALL_CHANNEL_META[result.marketKey].foreground }"
                  >
                    {{ ALL_CHANNEL_META[result.marketKey].shortName }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span class="whitespace-nowrap text-body font-semibold">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
                    <span v-if="result.marketKey.startsWith('own_')" class="text-[10px] text-muted-foreground">(등급 연동)</span>
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
              <ShTableCell numeric class="text-muted-foreground">
                {{ formatPercent(result.totalFeeRate, 2) }}
              </ShTableCell>
              <ShTableCell numeric class="font-bold" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
                {{ formatWon(result.netProfit) }}
              </ShTableCell>
            </ShTableRow>
        </ShTableBody>
      </ShTable>
    </div>

    <p v-if="includeOwnStore" class="px-4 pb-3 pt-3 text-tiny text-muted-foreground">
      * 자사몰(PG) 비교는 카드 결제 수수료 중심이며, VAT 별도 PG는 VAT 포함 실부담으로 계산합니다.
      <br class="hidden sm:block" />
      트래픽 확보·호스팅 비용은 제외되며, 토스페이먼츠는 설정비 22만원과 연 이용료 11만원이 추가됩니다.
    </p>
  </section>
</template>
