<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import { SLUG_TO_CATEGORY, CATEGORY_MAP, CATEGORIES } from "@/data/categories";
import { MARKET_META, MARKET_ORDER, type CategoryKey } from "@/data/marketFees";
import { PRICE_PRESETS } from "@/data/pricePresets";
import { calcAllMarkets, findBestMarket, type FeeBreakdown } from "@/utils/calculator";
import { formatWon, formatPercent } from "@/lib/utils";

const props = defineProps<{
  categorySlug: string;
}>();

const categoryKey = computed<CategoryKey>(() =>
  SLUG_TO_CATEGORY[props.categorySlug] ?? "clothing"
);

const categoryInfo = computed(() => CATEGORY_MAP[categoryKey.value]);

// 가격대별 비교 결과 계산
const priceCompareResults = computed(() => {
  return PRICE_PRESETS.map((preset) => {
    const results = calcAllMarkets({
      price: preset.value,
      shippingFee: 3000,
      category: categoryKey.value,
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });
    const best = findBestMarket(results);
    return { price: preset.value, label: preset.label, results, best };
  });
});

const seoTitle = computed(() => {
  const cat = categoryInfo.value;
  return `${cat.label} 판매 수수료 비교 | 스마트스토어 vs 쿠팡 vs 11번가`;
});

const seoDescription = computed(() => {
  const cat = categoryInfo.value;
  return `${cat.label} 카테고리 오픈마켓별 수수료를 한눈에 비교합니다.`;
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container py-5 space-y-5">
    <!-- 카테고리 탭 -->
    <div class="flex flex-wrap gap-1.5">
      <RouterLink
        v-for="cat in CATEGORIES"
        :key="cat.key"
        :to="`/${cat.slug}-fee-compare`"
        :class="[
          'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
          categoryKey === cat.key
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
        ]"
      >
        {{ cat.emoji }} {{ cat.label }}
      </RouterLink>
    </div>

    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ categoryInfo.emoji }} {{ categoryInfo.label }} 수수료 비교</h1>
        <FreshBadge />
      </div>

      <div class="retro-panel-content">
        <p class="text-body text-muted-foreground mb-4">
          {{ categoryInfo.label }} 카테고리 상품을 각 오픈마켓에서 판매할 때 수수료를 가격대별로 비교합니다.
        </p>

        <!-- 가격대별 비교표 -->
        <div class="overflow-x-auto">
          <table class="w-full text-body">
            <thead>
              <tr class="border-b border-border/80">
                <th class="px-3 py-2.5 text-left text-caption font-semibold text-muted-foreground">판매가</th>
                <th
                  v-for="key in MARKET_ORDER"
                  :key="key"
                  class="px-3 py-2.5 text-right text-caption font-semibold"
                  :style="{ color: MARKET_META[key].color }"
                >
                  {{ MARKET_META[key].name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in priceCompareResults"
                :key="row.price"
                class="border-b border-border/40 hover:bg-accent/15 transition-colors"
              >
                <td class="px-3 py-2.5 text-body font-semibold">{{ formatWon(row.price) }}</td>
                <td
                  v-for="result in row.results"
                  :key="result.marketKey"
                  class="px-3 py-2.5 text-right tabular-nums"
                  :class="result.marketKey === row.best?.marketKey ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'"
                >
                  <div>{{ formatWon(result.totalFee) }}</div>
                  <div class="text-tiny">({{ formatPercent(result.totalFeeRate) }})</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AdSlot slot="category" />

    <div class="text-center space-x-3">
      <RouterLink to="/" class="retro-button">
        내 상품 직접 비교하기
      </RouterLink>
    </div>
  </div>
</template>
