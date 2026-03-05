<script setup lang="ts">
import { computed } from "vue";
import { Share2 } from "lucide-vue-next";
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
import { RouterLink } from "vue-router";
import { CATEGORIES } from "@/data/categories";

const calc = useMarketFeeCalc();
const share = useShare(calc);

// SummaryBanner 메시지
const summaryMessage = computed(() => {
  const best = calc.bestMarket.value;
  if (!best) return "";
  const bestName = MARKET_META[best.marketKey].name;

  // 두 번째로 유리한 마켓과 차이
  const sorted = [...calc.results.value].sort((a, b) => a.totalFee - b.totalFee);
  if (sorted.length < 2) return `${bestName}가 가장 유리해요`;

  const second = sorted[1];
  const diff = second.totalFee - best.totalFee;
  const secondName = MARKET_META[second.marketKey].name;
  return `${bestName}가 가장 유리해요 — ${secondName}보다 건당 ${formatWon(diff)} 더 남아요`;
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
    title="오픈마켓 수수료 비교 계산기 | 스마트스토어 vs 쿠팡 vs 11번가 2025"
    description="같은 상품인데 마켓마다 수수료가 이렇게 다릅니다. 스마트스토어, 쿠팡, 11번가, G마켓 수수료를 한눈에 비교하세요."
    :json-ld="jsonLd"
  />

  <div class="container py-5 space-y-5">
    <!-- 입력 영역 -->
    <CompareInput
      v-model:price="calc.price.value"
      v-model:shipping-fee="calc.shippingFee.value"
      v-model:category="calc.category.value"
      v-model:smartstore-tier="calc.smartstoreTier.value"
      v-model:smartstore-source="calc.smartstoreSource.value"
      v-model:coupang-mode="calc.coupangMode.value"
      v-model:fulfillment-size="calc.fulfillmentSize.value"
      v-model:monthly-qty="calc.monthlyQty.value"
    />

    <!-- 4열 비교 결과 -->
    <MarketCardGrid
      :results="calc.results.value"
      :best-market-key="calc.bestMarket.value?.marketKey ?? null"
    />

    <!-- Summary Banner -->
    <SummaryBanner :message="summaryMessage" highlight />

    <!-- 공유 버튼 -->
    <div class="flex justify-center gap-2">
      <button
        type="button"
        class="retro-button-subtle flex items-center gap-2"
        @click="share.openShare"
      >
        <Share2 class="h-4 w-4" />
        결과 공유하기
      </button>
    </div>

    <!-- 광고 상단 -->
    <AdSlot slot="top" label="광고" />

    <!-- 월간 시뮬레이션 -->
    <MonthlySim
      :sim-results="calc.monthlySimResults.value"
      :price="calc.price.value"
      :monthly-qty="calc.monthlyQty.value"
    />

    <!-- 광고 중간 -->
    <AdSlot slot="middle" />

    <!-- 수수료 비교표 -->
    <FeeCompareTable :results="calc.results.value" />

    <!-- 내부 링크: 카테고리별 비교 -->
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h3 class="retro-title">카테고리별 상세 비교</h3>
      </div>
      <div class="retro-panel-content">
        <div class="flex flex-wrap gap-2">
          <RouterLink
            v-for="cat in CATEGORIES"
            :key="cat.key"
            :to="`/${cat.slug}-fee-compare`"
            class="retro-button-subtle text-caption"
          >
            {{ cat.emoji }} {{ cat.label }} 수수료 비교
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 내부 링크: 마켓별 상세 -->
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h3 class="retro-title">마켓별 수수료 상세</h3>
      </div>
      <div class="retro-panel-content">
        <div class="flex flex-wrap gap-2">
          <RouterLink to="/smartstore" class="retro-button-subtle text-caption">
            스마트스토어 수수료
          </RouterLink>
          <RouterLink to="/coupang" class="retro-button-subtle text-caption">
            쿠팡 수수료
          </RouterLink>
          <RouterLink to="/11st" class="retro-button-subtle text-caption">
            11번가 수수료
          </RouterLink>
          <RouterLink to="/gmarket" class="retro-button-subtle text-caption">
            G마켓/옥션 수수료
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <CompareFAQ />

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
