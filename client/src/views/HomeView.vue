<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ArrowRight, BadgeCheck, CreditCard, Medal, PackageCheck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import CompareInput from "@/components/compare/CompareInput.vue";
import MonthlySim from "@/components/compare/MonthlySim.vue";
import CompareFAQ from "@/components/compare/CompareFAQ.vue";
import { ActionCard } from "@/components/ui/action-card";
import { useMarketFeeCalc } from "@/composables/useMarketFeeCalc";
import { useShare } from "@/composables/useShare";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import { formatWon, formatPercent } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { RouterLink } from "vue-router";

const calc = useMarketFeeCalc();
const share = useShare(calc);

const sessionStartedAt = performance.now();
const hasTrackedFirstInput = ref(false);
const hasTrackedResultsViewed = ref(false);
let resultsObserver: IntersectionObserver | null = null;

const sortedResults = computed(() => [...calc.results.value].sort((a, b) => a.totalFee - b.totalFee));
const bestResult = computed(() => sortedResults.value[0] ?? null);
const runnerUp = computed(() => sortedResults.value[1] ?? null);

const summaryDelta = computed(() => {
  if (!bestResult.value || !runnerUp.value) return 0;
  return Math.max(0, runnerUp.value.totalFee - bestResult.value.totalFee);
});

function elapsedMs(): number {
  return Math.round(performance.now() - sessionStartedAt);
}

function trackUxEvent(eventName: string, params?: Record<string, unknown>): void {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  trackEvent(eventName, {
    page: "home",
    device: isMobile ? "mobile" : "desktop",
    elapsed_ms: elapsedMs(),
    ...params,
  });
}

function openShareFromSummary(): void {
  trackUxEvent("ux_summary_cta_click", { cta: "share" });
  share.openShare();
}

function trackCostAxisClick(target: "market" | "payment" | "shipping"): void {
  trackUxEvent("ux_cost_axis_click", { target });
}

watch(
  () =>
    [
      calc.price.value,
      calc.shippingFee.value,
      calc.category.value,
      calc.smartstoreTier.value,
      calc.smartstoreSource.value,
      calc.coupangMode.value,
      calc.fulfillmentSize.value,
      calc.includeOwnStore.value,
      calc.monthlyQty.value,
    ] as const,
  (nextValues, prevValues) => {
    if (!prevValues || hasTrackedFirstInput.value) return;
    const hasChanged = nextValues.some((value, index) => value !== prevValues[index]);
    if (!hasChanged) return;
    hasTrackedFirstInput.value = true;
    trackUxEvent("ux_first_input_completed", {
      price: calc.price.value,
      shipping_fee: calc.shippingFee.value,
      category: calc.category.value,
    });
  }
);

onMounted(() => {
  nextTick(() => {
    const resultsEl = document.getElementById("results");
    if (!resultsEl || hasTrackedResultsViewed.value) return;

    resultsObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasTrackedResultsViewed.value) return;
        hasTrackedResultsViewed.value = true;
        trackUxEvent("ux_results_viewed");
        resultsObserver?.disconnect();
        resultsObserver = null;
      },
      { threshold: 0.4 }
    );
    resultsObserver.observe(resultsEl);
  });
});

onUnmounted(() => {
  resultsObserver?.disconnect();
  resultsObserver = null;
});

// SEO JSON-LD
const jsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "오픈마켓 수수료 비교 계산기",
  "description": "스마트스토어, 쿠팡, 11번가, G마켓 수수료를 한눈에 비교",
  "url": "https://seller.shakilabs.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW" },
  "inLanguage": "ko",
}));
</script>

<template>
  <SEOHead
    title="스마트스토어 vs 쿠팡 vs 11번가 vs G마켓 수수료 비교"
    description="같은 상품인데 마켓마다 수수료가 이렇게 다릅니다. 스마트스토어, 쿠팡, 11번가, G마켓 수수료를 한눈에 비교하세요."
    :json-ld="jsonLd"
  />

  <div class="container py-5 space-y-5">
    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">오픈마켓 수수료를 30초 안에 비교해보세요</h1>
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-[11px] text-muted-foreground sm:text-body">
          판매가, 카테고리, 배송비만 입력하면 스마트스토어/쿠팡/11번가/G마켓의 건당 수수료와 순이익을 바로 보여줍니다.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="retro-panel-muted p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">STEP 1</p>
            <p class="mt-1.5 text-body font-bold text-foreground">핵심 정보 3개 입력</p>
            <p class="mt-1.5 text-caption text-muted-foreground">
              판매가, 카테고리, 배송비만 넣으면
              <br class="hidden sm:block" />
              어디가 유리한지 바로 계산됩니다.
            </p>
          </div>
          <div class="retro-panel-muted p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">STEP 2</p>
            <p class="mt-1.5 text-body font-bold text-foreground">최적 마켓 확인</p>
            <p class="mt-1.5 text-caption text-muted-foreground">
              1위 마켓과 2위 차이 금액을
              <br class="hidden sm:block" />
              한 번에 확인할 수 있습니다.
            </p>
          </div>
          <div class="retro-panel-muted p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">STEP 3</p>
            <p class="mt-1.5 text-body font-bold text-foreground">상세표로 검증</p>
            <p class="mt-1.5 text-caption text-muted-foreground">
              상세 비교표와 월간 시뮬레이션으로
              <br class="hidden sm:block" />
              차이를 바로 검증할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="input">
      <CompareInput
        v-model:price="calc.price.value"
        v-model:shipping-fee="calc.shippingFee.value"
        v-model:category="calc.category.value"
        v-model:smartstore-tier="calc.smartstoreTier.value"
        v-model:smartstore-source="calc.smartstoreSource.value"
        v-model:coupang-mode="calc.coupangMode.value"
        v-model:fulfillment-size="calc.fulfillmentSize.value"
        v-model:include-own-store="calc.includeOwnStore.value"
        :monthly-qty="calc.monthlyQty.value"
      />
    </section>

    <section id="results" class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">비교 결과</h2>
        <SectionShareButton @click="openShareFromSummary" />
      </div>

      <!-- 모바일: 카드 레이아웃 -->
      <div class="space-y-3 px-3.5 py-3 md:hidden">
        <div
          v-for="(result, idx) in sortedResults"
          :key="`m-${result.marketKey}`"
          class="overflow-hidden rounded-2xl border bg-card"
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
              :class="result.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
              :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color }"
            >
              {{ ALL_CHANNEL_META[result.marketKey].shortName }}
            </span>
            <div class="min-w-0 flex-1">
              <span class="block truncate text-body font-bold text-foreground">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
              <span v-if="result.marketKey.startsWith('own_')" class="text-[10px] text-muted-foreground">등급 연동</span>
            </div>
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
              <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">총 수수료</span>
              <span class="text-[11px] font-semibold tabular-nums text-fee sm:text-caption">{{ formatWon(result.totalFee) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5">
              <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">수수료율(VAT 포함)</span>
              <span class="text-[11px] font-semibold tabular-nums text-muted-foreground sm:text-caption">{{ formatPercent(result.totalFeeRate, 2) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">건당 순이익</span>
              <span class="text-[11px] font-bold tabular-nums sm:text-caption" :class="idx === 0 ? 'text-profit' : 'text-foreground'">{{ formatWon(result.netProfit) }}</span>
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
              <th scope="col" class="w-20 whitespace-nowrap px-4 py-3 text-left text-caption font-semibold text-muted-foreground">순위</th>
              <th scope="col" class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">마켓</th>
              <th scope="col" class="w-28 whitespace-nowrap px-2 py-3 text-left text-caption font-semibold text-muted-foreground">총 수수료</th>
              <th scope="col" class="w-24 whitespace-nowrap px-3 py-3 text-right text-caption font-semibold text-muted-foreground">수수료율(VAT 포함)</th>
              <th scope="col" class="whitespace-nowrap px-4 py-3 text-right text-caption font-semibold text-muted-foreground">건당 순이익</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(result, idx) in sortedResults"
              :key="result.marketKey"
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
                    :class="result.marketKey === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
                    :style="{ backgroundColor: ALL_CHANNEL_META[result.marketKey].color }"
                  >
                    {{ ALL_CHANNEL_META[result.marketKey].shortName }}
                  </span>
                  <div class="flex items-center gap-1.5">
                    <span class="whitespace-nowrap text-body font-semibold">{{ ALL_CHANNEL_META[result.marketKey].name }}</span>
                    <span v-if="result.marketKey.startsWith('own_')" class="text-[10px] text-muted-foreground">(등급 연동)</span>
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
              <td class="whitespace-nowrap px-2 py-3 text-left font-semibold tabular-nums text-fee">
                {{ formatWon(result.totalFee) }}
              </td>
              <td class="whitespace-nowrap px-3 py-3 text-right tabular-nums text-muted-foreground">
                {{ formatPercent(result.totalFeeRate, 2) }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums" :class="idx === 0 ? 'text-profit' : 'text-foreground'">
                {{ formatWon(result.netProfit) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      <div v-if="bestResult && runnerUp" class="border-t border-border/40 px-4 py-3">
        <p class="text-caption text-muted-foreground">
          <span class="font-semibold text-profit">{{ ALL_CHANNEL_META[bestResult.marketKey].name }}</span>이
          {{ ALL_CHANNEL_META[runnerUp.marketKey].name }}보다 건당
          <span class="font-semibold text-profit">{{ formatWon(summaryDelta) }}</span> 더 남습니다.
        </p>
      </div>
      <p v-if="calc.includeOwnStore.value" class="px-4 pb-3 text-tiny text-muted-foreground">
        * 자사몰(PG) 비교는 카드 결제 수수료 중심이며, VAT 별도 PG는 VAT 포함 실부담으로 계산합니다.
        <br class="hidden sm:block" />
        트래픽 확보·호스팅 비용은 제외되며, 토스페이먼츠는 설정비 22만원과 연 이용료 11만원이 추가됩니다.
      </p>
    </section>

    <AdSlot slot="top" label="광고" />

    <section id="simulation">
      <MonthlySim
        :sim-results="calc.monthlySimResults.value"
        :price="calc.price.value"
        v-model:monthly-qty="calc.monthlyQty.value"
      />
    </section>

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <h2 class="retro-title">다른 비용도 비교하기</h2>
        </div>
        <div class="retro-panel-content space-y-3">
          <p class="text-[11px] text-muted-foreground sm:text-body">
            마켓 수수료 외에 결제 수수료와 택배비도 수익에 영향을 줍니다.
          </p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ActionCard
              :as="RouterLink"
              to="/payment-compare"
              class="gap-0"
              @click="trackCostAxisClick('payment')"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-body font-bold text-foreground">결제 수수료 비교</p>
                  <p class="mt-1.5 text-caption text-muted-foreground">
                    토스페이먼츠, 네이버페이 등 PG사별 카드 수수료 비교
                  </p>
                </div>
                <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <CreditCard class="h-5 w-5" />
                </span>
              </div>
              <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
                비교하러 가기 <ArrowRight class="h-3.5 w-3.5" />
              </p>
            </ActionCard>

            <ActionCard
              :as="RouterLink"
              to="/shipping-compare"
              class="gap-0"
              @click="trackCostAxisClick('shipping')"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-body font-bold text-foreground">택배비 비교</p>
                  <p class="mt-1.5 text-caption text-muted-foreground">
                    일반 택배 6사 · 편의점 택배 2사 운임 계산
                  </p>
                </div>
                <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <PackageCheck class="h-5 w-5" />
                </span>
              </div>
              <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
                계산하러 가기 <ArrowRight class="h-3.5 w-3.5" />
              </p>
            </ActionCard>
          </div>
        </div>
      </div>
    </section>

    <section>
      <CompareFAQ />
    </section>

    <AdSlot slot="bottom" />

    <ShareModal
      :show="share.showShareModal.value"
      :kakao-busy="share.kakaoBusy.value"
      :summary-text="share.shareSummary.value"
      @close="share.closeShare"
      @share-kakao="share.shareKakao"
      @copy-link="share.copyLink"
    />
  </div>
</template>
