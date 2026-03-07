<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
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
import { formatWon, formatWonShort } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { RouterLink } from "vue-router";
import { CATEGORY_MAP, CATEGORIES } from "@/data/categories";

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
    title="오픈마켓 수수료 비교 계산기 | 스마트스토어 vs 쿠팡 vs 11번가"
    description="같은 상품인데 마켓마다 수수료가 이렇게 다릅니다. 스마트스토어, 쿠팡, 11번가, G마켓 수수료를 한눈에 비교하세요."
    :json-ld="jsonLd"
  />

  <div class="container py-5 space-y-5">
    <!-- 핵심 가치/사용 흐름 -->
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

    <!-- 입력 영역 -->
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

    <section class="retro-panel-muted px-3 py-2.5 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-caption font-bold text-foreground">결과 빠른 이동</p>
        <span class="text-tiny text-muted-foreground">원하는 블록으로 즉시 이동</span>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" class="retro-button-subtle touch-target text-caption" @click="moveToSection('results', 'quick_nav')">
          1. 핵심 결론
        </button>
        <button type="button" class="retro-button-subtle touch-target text-caption" @click="moveToSection('simulation', 'quick_nav')">
          2. 월간 시뮬레이션
        </button>
        <button type="button" class="retro-button-subtle touch-target text-caption" @click="moveToSection('fee-table', 'quick_nav')">
          3. 상세 비교표
        </button>
      </div>
    </section>

    <section id="results" class="space-y-3">
      <div class="section-heading-block">
        <span class="section-eyebrow">Section 1</span>
        <h2 class="section-title">핵심 결론</h2>
        <p class="section-description">
          현재 조건에서 가장 유리한 마켓과 절감 가능한 금액을 먼저 확인하세요.
        </p>
      </div>
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
      <div class="section-heading-block">
        <span class="section-eyebrow">Section 1-A</span>
        <h2 class="section-title">마켓별 결과 비교</h2>
        <p class="section-description">
          순이익 기준으로 자동 정렬했습니다. 각 카드에서 1위와의 차이, 총 수수료, 수수료율을 한 번에 비교해보세요.
        </p>
      </div>
      <MarketCardGrid
        :results="calc.results.value"
        :best-market-key="calc.bestMarket.value?.marketKey ?? null"
      />
    </section>

    <!-- 광고 -->
    <AdSlot slot="top" label="광고" />

    <section class="space-y-3">
      <div class="section-heading-block">
        <span class="section-eyebrow">Section 2</span>
        <h2 class="section-title">월간 시뮬레이션</h2>
        <p class="section-description">
          판매량을 바꿔보면 마켓별 연 수수료와 월 순이익 차이가 얼마나 벌어지는지 바로 확인할 수 있습니다.
        </p>
      </div>
      <details id="simulation" class="retro-details" :open="showSim || undefined">
        <summary class="retro-details-summary" @click.prevent="showSim = !showSim">
          <span>판매량 기준으로 월간 차이 계산</span>
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

    <section class="space-y-3">
      <div class="section-heading-block">
        <span class="section-eyebrow">Section 3</span>
        <h2 class="section-title">상세 비교표</h2>
        <p class="section-description">
          총 수수료와 순이익을 정렬 기준별로 비교하면서, 어느 마켓이 왜 유리한지 숫자로 확인하세요.
        </p>
      </div>
      <details id="fee-table" class="retro-details" :open="showTable || undefined">
        <summary class="retro-details-summary" @click.prevent="showTable = !showTable">
          <span>수수료 항목별 상세 내역 확인</span>
          <ChevronDown class="retro-details-chevron" :class="{ 'rotate-180': showTable }" />
        </summary>
        <div v-if="showTable">
          <FeeCompareTable :results="calc.results.value" />
        </div>
      </details>
    </section>

    <!-- 내부 링크: 카테고리별 + 마켓별 통합 -->
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h3 class="retro-title">더 알아보기</h3>
      </div>
      <div class="retro-panel-content space-y-3">
        <div class="flex flex-wrap gap-1.5">
          <RouterLink
            v-for="cat in CATEGORIES"
            :key="cat.key"
            :to="`/${cat.slug}-fee-compare`"
            class="retro-button-subtle text-caption"
          >
            {{ cat.emoji }} {{ cat.label }}
          </RouterLink>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <RouterLink to="/smartstore" class="retro-button-subtle text-caption">스마트스토어</RouterLink>
          <RouterLink to="/coupang" class="retro-button-subtle text-caption">쿠팡</RouterLink>
          <RouterLink to="/11st" class="retro-button-subtle text-caption">11번가</RouterLink>
          <RouterLink to="/gmarket" class="retro-button-subtle text-caption">G마켓/옥션</RouterLink>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <section class="space-y-3">
      <div class="section-heading-block">
        <span class="section-eyebrow">Section 4</span>
        <h2 class="section-title">자주 묻는 질문</h2>
        <p class="section-description">
          계산 기준과 수수료 반영 범위를 빠르게 확인할 수 있도록 자주 묻는 질문을 정리했습니다.
        </p>
      </div>
      <CompareFAQ />
    </section>

    <!-- 광고 하단 -->
    <AdSlot slot="bottom" />

    <!-- 공유 모달 -->
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
