<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import { CATEGORIES } from "@/data/categories";
import { MARKET_META, MARKET_ORDER } from "@/data/marketFees";
import { calcAllMarkets, findBestMarket, calcMonthlySim } from "@/utils/calculator";
import { formatWon, formatPercent, formatWonShort } from "@/lib/utils";

const props = defineProps<{
  priceAmount: number;
}>();

const price = computed(() => {
  const p = props.priceAmount;
  return Number.isFinite(p) && p > 0 ? p : 30000;
});

// 전 카테고리 비교 결과
const categoryResults = computed(() => {
  return CATEGORIES.map((cat) => {
    const results = calcAllMarkets({
      price: price.value,
      shippingFee: 3000,
      category: cat.key,
      smartstoreTier: "micro",
      smartstoreSource: "naverShopping",
      coupangMode: "marketplace",
      fulfillmentSize: "small",
    });
    const best = findBestMarket(results);
    const monthly = calcMonthlySim(results, 100);
    return { category: cat, results, best, monthly };
  });
});

const seoTitle = computed(() =>
  `판매가 ${formatWonShort(price.value)} 상품 마켓별 수수료 비교 | 2025년 기준`
);
const seoDescription = computed(() =>
  `${formatWonShort(price.value)} 상품을 스마트스토어, 쿠팡, 11번가, G마켓에서 팔면 수수료와 순이익이 얼마나 차이날까요?`
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container py-5 space-y-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">판매가 {{ formatWon(price) }} 수수료 비교</h1>
        <FreshBadge />
      </div>

      <div class="retro-panel-content space-y-6">
        <p class="text-body text-muted-foreground text-center">
          {{ formatWon(price) }} 상품의 카테고리별 마켓 수수료를 비교합니다. (배송비 3,000원 기준)
        </p>

        <div v-for="row in categoryResults" :key="row.category.key" class="space-y-2">
          <h2 class="text-heading font-bold">{{ row.category.emoji }} {{ row.category.label }}</h2>

          <div class="overflow-x-auto">
            <table class="w-full text-body">
              <thead>
                <tr class="border-b border-border/80">
                  <th class="px-3 py-2 text-left text-caption font-semibold text-muted-foreground">마켓</th>
                  <th class="px-3 py-2 text-right text-caption font-semibold text-muted-foreground">수수료</th>
                  <th class="px-3 py-2 text-right text-caption font-semibold text-muted-foreground">수수료율</th>
                  <th class="px-3 py-2 text-right text-caption font-semibold text-muted-foreground">건당 순이익</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="result in row.results"
                  :key="result.marketKey"
                  class="border-b border-border/40 hover:bg-accent/15"
                >
                  <td class="px-3 py-2">
                    <span class="font-semibold" :class="result.marketKey === row.best?.marketKey ? 'text-emerald-600 dark:text-emerald-400' : ''">
                      {{ MARKET_META[result.marketKey].name }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums text-red-500 dark:text-red-400 font-semibold">
                    {{ formatWon(result.totalFee) }}
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {{ formatPercent(result.totalFeeRate) }}
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums font-bold">
                    {{ formatWon(result.netProfit) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <AdSlot slot="price" />

    <div class="text-center">
      <RouterLink to="/" class="retro-button">
        내 상품 직접 비교하기
      </RouterLink>
    </div>
  </div>
</template>
