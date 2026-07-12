<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { SELLER_HOME_GUIDE } from "@/data/seoGuides";
import AdSlot from "@/components/common/AdSlot.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import CompareIntro from "@/components/compare/CompareIntro.vue";
import CompareInput from "@/components/compare/CompareInput.vue";
import CompareResults from "@/components/compare/CompareResults.vue";
import CostAxisLinks from "@/components/compare/CostAxisLinks.vue";
import MonthlySim from "@/components/compare/MonthlySim.vue";
import CompareFAQ from "@/components/compare/CompareFAQ.vue";
import SellerRelatedServices from "@/components/seller/SellerRelatedServices.vue";
import CalculatorPageHeader from "@/components/seller/CalculatorPageHeader.vue";
import MonthlySimulationChart from "@/components/seller/MonthlySimulationChart.vue";
import SellerFeeResultCharts from "@/components/seller/SellerFeeResultCharts.vue";
import { useMarketFeeCalc } from "@/composables/useMarketFeeCalc";
import { useShare } from "@/composables/useShare";
import { trackEvent } from "@/lib/analytics";

const calc = useMarketFeeCalc();
const share = useShare(calc);

const sessionStartedAt = performance.now();
const hasTrackedFirstInput = ref(false);
const hasTrackedResultsViewed = ref(false);
let resultsObserver: IntersectionObserver | null = null;

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
  "url": "https://shakilabs.com/seller",
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

  <div class="text-resize-layout container space-y-5 py-5">
    <CalculatorPageHeader title="오픈마켓 수수료 계산기" />

    <CompareIntro />

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

    <CompareResults
      :results="calc.results.value"
      :include-own-store="calc.includeOwnStore.value"
      @share="openShareFromSummary"
    />

    <SellerFeeResultCharts :results="calc.results.value" />

    <AdSlot slot="top" label="광고" />

    <section id="simulation">
      <MonthlySim
        :sim-results="calc.monthlySimResults.value"
        :price="calc.price.value"
        v-model:monthly-qty="calc.monthlyQty.value"
      />
    </section>

    <MonthlySimulationChart :results="calc.monthlySimResults.value" />

    <CostAxisLinks @select="trackCostAxisClick" />

    <section>
      <CompareFAQ />
    </section>

    <SellerRelatedServices />

    <AdSlot slot="bottom" />

    <ShareModal
      :show="share.showShareModal.value"
      :kakao-busy="share.kakaoBusy.value"
      :summary-text="share.shareSummary.value"
      @close="share.closeShare"
      @share-kakao="share.shareKakao"
      @copy-link="share.copyLink"
    />

    <SeoRichGuide
      :title="SELLER_HOME_GUIDE.title"
      :intro="SELLER_HOME_GUIDE.intro"
      :sections="SELLER_HOME_GUIDE.sections"
      :faqs="SELLER_HOME_GUIDE.faqs"
      :disclaimer="SELLER_HOME_GUIDE.disclaimer"
    />
  </div>
</template>
