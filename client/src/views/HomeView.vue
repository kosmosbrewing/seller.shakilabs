<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ArrowRight, CreditCard, PackageCheck } from "lucide-vue-next";
import { ShSurface, ShText } from "@shakilabs/ui";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { SELLER_HOME_GUIDE } from "@/data/seoGuides";
import AdSlot from "@/components/common/AdSlot.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import CompareInput from "@/components/compare/CompareInput.vue";
import CompareResults from "@/components/compare/CompareResults.vue";
import MonthlySim from "@/components/compare/MonthlySim.vue";
import CompareFAQ from "@/components/compare/CompareFAQ.vue";
import RelatedServices from "@/components/common/RelatedServices.vue";
import { ActionCard } from "@/components/ui/action-card";
import { useMarketFeeCalc } from "@/composables/useMarketFeeCalc";
import { useShare } from "@/composables/useShare";
import { trackEvent } from "@/lib/analytics";
import { RouterLink } from "vue-router";

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

  <div class="container py-5 space-y-5">
    <ShSurface as="section" padding="none" class="overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <ShText as="h1" variant="title">오픈마켓 수수료를 30초 안에 비교해보세요</ShText>
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-[11px] text-muted-foreground sm:text-body">
          판매가, 카테고리, 배송비만 입력하면 스마트스토어/쿠팡/11번가/G마켓의 건당 수수료와 순이익을 바로 보여줍니다.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="retro-panel-muted p-3">
            <ShText variant="label" tone="primary">입력</ShText>
            <ShText class="mt-1.5" variant="heading">핵심 정보 3개 입력</ShText>
            <ShText class="mt-1.5" variant="caption" tone="muted">
              판매가, 카테고리, 배송비만 넣으면
              <br class="hidden sm:block" />
              어디가 유리한지 바로 계산됩니다.
            </ShText>
          </div>
          <div class="retro-panel-muted p-3">
            <ShText variant="label" tone="primary">비교</ShText>
            <ShText class="mt-1.5" variant="heading">최적 마켓 확인</ShText>
            <ShText class="mt-1.5" variant="caption" tone="muted">
              1위 마켓과 2위 차이 금액을
              <br class="hidden sm:block" />
              한 번에 확인할 수 있습니다.
            </ShText>
          </div>
          <div class="retro-panel-muted p-3">
            <ShText variant="label" tone="primary">검토</ShText>
            <ShText class="mt-1.5" variant="heading">상세표로 검증</ShText>
            <ShText class="mt-1.5" variant="caption" tone="muted">
              상세 비교표와 월간 시뮬레이션으로
              <br class="hidden sm:block" />
              차이를 바로 검증할 수 있습니다.
            </ShText>
          </div>
        </div>
      </div>
    </ShSurface>

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

    <RelatedServices />

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
