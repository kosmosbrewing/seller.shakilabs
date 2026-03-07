<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ChevronDown, CreditCard, PackageCheck, Store } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import SummaryBanner from "@/components/common/SummaryBanner.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import CompareInput from "@/components/compare/CompareInput.vue";
import MarketCardGrid from "@/components/compare/MarketCardGrid.vue";
import FeeCompareTable from "@/components/compare/FeeCompareTable.vue";
import MonthlySim from "@/components/compare/MonthlySim.vue";
import CompareFAQ from "@/components/compare/CompareFAQ.vue";
import { useMarketFeeCalc } from "@/composables/useMarketFeeCalc";
import { useShare } from "@/composables/useShare";
import { MARKET_META } from "@/data/marketFees";
import { formatWon } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { RouterLink } from "vue-router";
import { CATEGORY_MAP } from "@/data/categories";

const calc = useMarketFeeCalc();
const share = useShare(calc);

const showSim = ref(false);
const showTable = ref(false);
const sessionStartedAt = performance.now();
const hasTrackedFirstInput = ref(false);
const hasTrackedResultsViewed = ref(false);
let resultsObserver: IntersectionObserver | null = null;

const sortedResults = computed(() => [...calc.results.value].sort((a, b) => a.totalFee - b.totalFee));

const summaryBest = computed(() => sortedResults.value[0] ?? null);
const summaryRunnerUp = computed(() => sortedResults.value[1] ?? null);
const summaryWorst = computed(() => {
  if (sortedResults.value.length === 0) return null;
  return sortedResults.value[sortedResults.value.length - 1];
});

const summaryLeaderValue = computed(() => {
  if (!summaryBest.value) return "계산 중";
  return MARKET_META[summaryBest.value.marketKey].name;
});

const summaryTitle = computed(() => {
  if (!summaryBest.value) return "입력값을 바꾸면 가장 유리한 마켓이 바로 계산됩니다.";
  if (!summaryRunnerUp.value) return `${summaryLeaderValue.value}가 현재 조건에서 가장 유리합니다.`;

  const secondName = MARKET_META[summaryRunnerUp.value.marketKey].name;
  return `${secondName}보다 같은 상품 기준으로 더 많은 순이익이 남습니다.`;
});

const summaryDelta = computed(() => {
  if (!summaryBest.value || !summaryRunnerUp.value) return 0;
  return Math.max(0, summaryRunnerUp.value.totalFee - summaryBest.value.totalFee);
});

const summaryMonthlyDelta = computed(() => summaryDelta.value * calc.monthlyQty.value);

const summaryContext = computed(() => {
  if (!summaryWorst.value || !summaryBest.value) {
    return "현재 입력값 기준으로 마켓별 수수료 차이를 즉시 비교합니다.";
  }

  const worstName = MARKET_META[summaryWorst.value.marketKey].name;
  return `${worstName}와의 최대 차이까지 포함한 결과입니다. 아래 상세 비교표에서 수수료 구성과 순이익을 바로 검증하세요.`;
});

const summaryFacts = computed(() => [
  {
    label: "판매가",
    value: formatWon(calc.price.value),
  },
  {
    label: "카테고리",
    value: CATEGORY_MAP[calc.category.value].label,
  },
  {
    label: "배송비",
    value: formatWon(calc.shippingFee.value),
  },
  {
    label: `월 ${calc.monthlyQty.value.toLocaleString("ko-KR")}건 추가`,
    value: formatWon(summaryMonthlyDelta.value),
  },
]);

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

async function moveToSection(id: string, source = "quick_nav"): Promise<void> {
  if (id === "simulation") showSim.value = true;
  if (id === "fee-table") showTable.value = true;
  await nextTick();
  const target = document.getElementById(id);
  if (!target) return;
  trackUxEvent("ux_section_navigate", { target: id, source });
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openShareFromSummary(): void {
  trackUxEvent("ux_summary_cta_click", { cta: "share" });
  share.openShare();
}

function moveToFeeTableFromSummary(): void {
  trackUxEvent("ux_summary_cta_click", { cta: "detail_table" });
  moveToSection("fee-table", "summary_banner");
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

watch(showSim, (opened) => {
  if (!opened) return;
  trackUxEvent("ux_open_simulation");
});

watch(showTable, (opened) => {
  if (!opened) return;
  trackUxEvent("ux_open_fee_table");
});

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
      <div class="retro-panel-content space-y-3">
        <p class="text-body text-foreground">
          판매가, 카테고리, 배송비만 입력하면 스마트스토어/쿠팡/11번가/G마켓의 건당 수수료와 순이익을 바로 보여줍니다.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div class="retro-panel-muted p-3">
            <p class="text-tiny font-bold text-primary">STEP 1</p>
            <p class="text-caption text-foreground mt-1">기본값 3개 입력</p>
          </div>
          <div class="retro-panel-muted p-3">
            <p class="text-tiny font-bold text-primary">STEP 2</p>
            <p class="text-caption text-foreground mt-1">최적 마켓/차이 금액 확인</p>
          </div>
          <div class="retro-panel-muted p-3">
            <p class="text-tiny font-bold text-primary">STEP 3</p>
            <p class="text-caption text-foreground mt-1">상세표/시뮬레이션으로 검증</p>
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
      />
    </section>

    <section id="results">
      <SummaryBanner
        :title="summaryTitle"
        :leader-value="summaryLeaderValue"
        leader-label="지금 선택할 1위 마켓"
        :delta-value="formatWon(summaryDelta)"
        :delta-label="summaryRunnerUp ? '건당 더 남는 금액' : '비교 대상 없음'"
        :context="summaryContext"
        :facts="summaryFacts"
        highlight
        show-share
        show-detail
        detail-label="상세 비교표 보기"
        @share="openShareFromSummary"
        @detail="moveToFeeTableFromSummary"
      />
    </section>

    <section class="space-y-3">
      <MarketCardGrid
        :results="calc.results.value"
        :best-market-key="calc.bestMarket.value?.marketKey ?? null"
      />
      <p class="text-tiny text-muted-foreground mt-2">
        * 대표 카테고리 수수료율 기준이며, 세부 카테고리에 따라 실제 수수료율이 다를 수 있습니다.
      </p>
    </section>

    <AdSlot slot="top" label="광고" />

    <section>
      <details id="simulation" class="retro-details" :open="showSim || undefined">
        <summary class="retro-details-summary" @click.prevent="showSim = !showSim">
          <span>월간 시뮬레이션</span>
          <ChevronDown class="retro-details-chevron" :class="{ 'rotate-180': showSim }" />
        </summary>
        <div v-if="showSim">
          <MonthlySim
            :sim-results="calc.monthlySimResults.value"
            :price="calc.price.value"
            v-model:monthly-qty="calc.monthlyQty.value"
          />
        </div>
      </details>
    </section>

    <section>
      <details id="fee-table" class="retro-details" :open="showTable || undefined">
        <summary class="retro-details-summary" @click.prevent="showTable = !showTable">
          <span>상세 비교표</span>
          <ChevronDown class="retro-details-chevron" :class="{ 'rotate-180': showTable }" />
        </summary>
        <div v-if="showTable">
          <FeeCompareTable :results="calc.results.value" />
        </div>
      </details>
    </section>

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <h2 class="retro-title">셀러 비용 3축</h2>
        </div>
        <div class="retro-panel-content">
          <p class="text-caption text-muted-foreground mb-3">
            수익성 판단은 마켓 수수료만으로 끝나지 않습니다. 결제 수수료와 택배비까지 같은 흐름에서 바로 비교해보세요.
          </p>
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <button
              type="button"
              class="group rounded-[1.6rem] border border-primary/20 bg-primary/10 p-4 text-left transition-colors hover:border-primary/35 hover:bg-primary/12"
              @click="
                trackCostAxisClick('market');
                moveToSection('input', 'cost_axis');
              "
            >
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Store class="h-5 w-5" />
              </span>
              <p class="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">Axis 1</p>
              <h3 class="mt-1.5 text-body font-bold text-foreground">마켓 수수료</h3>
              <p class="mt-2 text-caption text-muted-foreground">
                지금 이 페이지에서 판매가, 배송비, 카테고리 기준으로 오픈마켓 순이익을 바로 계산합니다.
              </p>
              <p class="mt-3 text-caption font-semibold text-primary">현재 계산기로 이동</p>
            </button>

            <RouterLink
              to="/payment-compare"
              class="group rounded-[1.6rem] border border-border/70 bg-card p-4 transition-colors hover:border-primary/25 hover:bg-muted/15"
              @click="trackCostAxisClick('payment')"
            >
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#03C75A]/12 text-[#03C75A]">
                <CreditCard class="h-5 w-5" />
              </span>
              <p class="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#03C75A]">Axis 2</p>
              <h3 class="mt-1.5 text-body font-bold text-foreground">결제 수수료</h3>
              <p class="mt-2 text-caption text-muted-foreground">
                토스페이먼츠, 네이버페이, 카카오페이, PAYCO의 가입비·연회비·카드 수수료를 한눈에 비교합니다.
              </p>
              <p class="mt-3 text-caption font-semibold text-foreground">결제 서비스 비교 보기</p>
            </RouterLink>

            <RouterLink
              to="/shipping-compare"
              class="group rounded-[1.6rem] border border-border/70 bg-card p-4 transition-colors hover:border-primary/25 hover:bg-muted/15"
              @click="trackCostAxisClick('shipping')"
            >
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1D4ED8]/12 text-[#1D4ED8]">
                <PackageCheck class="h-5 w-5" />
              </span>
              <p class="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D4ED8]">Axis 3</p>
              <h3 class="mt-1.5 text-body font-bold text-foreground">택배비 비교</h3>
              <p class="mt-2 text-caption text-muted-foreground">
                일반 택배 6사와 편의점 택배 2개의 예상 운임을 무게와 크기 조건에 따라 바로 계산합니다.
              </p>
              <p class="mt-3 text-caption font-semibold text-foreground">택배비 계산기로 이동</p>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h3 class="retro-title">더 알아보기</h3>
      </div>
      <div class="retro-panel-content">
        <RouterLink to="/market-compare" class="retro-button-subtle text-caption">
          오픈마켓 수수료 한눈에 비교
        </RouterLink>
      </div>
    </div>

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
