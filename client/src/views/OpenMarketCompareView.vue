<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { BadgeAlert, BadgeCheck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareHint from "@/components/common/CompareHint.vue";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_SITE_URL } from "@/lib/site";
import {
  MARKET_COMPARE_UPDATED,
  OPEN_MARKETS,
  type CompareCell,
  type OpenMarketKey,
} from "@/data/openMarketCompare";

type CompareColumnKey = "salesFeeRange" | "shippingFeeRate" | "settlementCycle" | "note";

interface CompareColumn {
  key: CompareColumnKey;
  label: string;
  nowrap?: boolean;
}

const seoTitle = "스마트스토어 vs 쿠팡 vs 11번가 vs G마켓 오픈마켓 비교";
const seoDescription =
  "스마트스토어, 쿠팡, 11번가, G마켓의 입점비·판매 수수료·배송비 수수료·정산주기를 한눈에 비교합니다.";
const pageUrl = `${DEFAULT_SITE_URL}/market-compare`;

const compareColumns: CompareColumn[] = [
  { key: "salesFeeRange", label: "판매 수수료", nowrap: true },
  { key: "shippingFeeRate", label: "배송비 수수료", nowrap: true },
  { key: "settlementCycle", label: "정산주기", nowrap: true },
  { key: "note", label: "비고" },
];

const lowestFeeMarket = computed<OpenMarketKey | null>(() => {
  let lowest: { key: OpenMarketKey; rate: number } | null = null;
  for (const market of OPEN_MARKETS) {
    const rate = market.microBusinessRate;
    if (!lowest || rate < lowest.rate) {
      lowest = { key: market.key, rate };
    }
  }
  return lowest?.key ?? null;
});

const lowestFeeLabel = computed<string | null>(() => {
  const key = lowestFeeMarket.value;
  if (!key) return null;
  const market = OPEN_MARKETS.find((m) => m.key === key);
  const rate = market?.microBusinessRate ?? null;
  if (!market || rate == null) return null;
  return `${market.shortName} ${formatRate(rate)}%~`;
});

const jsonLd = computed(() => [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": seoTitle,
    "description": seoDescription,
    "url": pageUrl,
    "inLanguage": "ko-KR",
    "dateModified": "2026-03-07",
    "isPartOf": {
      "@type": "WebSite",
      "name": "오픈마켓 수수료 계산기",
      "url": DEFAULT_SITE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "오픈마켓 비교 항목",
    "url": pageUrl,
    "numberOfItems": OPEN_MARKETS.length,
    "itemListElement": OPEN_MARKETS.map((market, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": market.name,
        "description": `${market.salesFeeRange.core} · ${market.settlementCycle.core}`,
      },
    })),
  },
]);

function formatRate(rate: number): string {
  return rate.toFixed(2).replace(/\.?0+$/, "");
}

function getReadableBadgeTextClass(marketKey: OpenMarketKey): string {
  return "text-white";
}

function getCellBg(columnKey: CompareColumnKey, cell: CompareCell, marketKey: OpenMarketKey): string {
  if (columnKey === "salesFeeRange" && marketKey === lowestFeeMarket.value) {
    return "compare-cell-highlight";
  }
  if (columnKey === "shippingFeeRate" && cell.core.includes("주문관리만")) {
    return "compare-cell-highlight";
  }
  if (columnKey === "note" && cell.core.includes("물류비")) {
    return "compare-cell-caution";
  }
  return "";
}
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="jsonLd" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar flex-col items-start gap-2 rounded-t-2xl sm:flex-row sm:items-center sm:gap-3">
        <h1 class="retro-title">오픈마켓 비교</h1>
        <div class="flex w-full flex-col items-start gap-1.5 sm:w-auto sm:items-end">
          <FreshBadge :message="`${MARKET_COMPARE_UPDATED} 반영`" />
        </div>
      </div>

      <div class="retro-panel-content space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-body text-muted-foreground">
            {{ OPEN_MARKETS.length }}개 오픈마켓의 판매 수수료·배송비 수수료·정산주기를 비교합니다.
          </p>
          <span
            v-if="lowestFeeLabel"
            class="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-caption font-semibold text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20 dark:text-emerald-300"
          >
            <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            영세 기준 최저 수수료 {{ lowestFeeLabel }}
          </span>
        </div>

        <p class="scroll-hint">표를 좌우로 밀면 다른 비교 항목을 계속 확인할 수 있습니다.</p>

        <div class="overflow-x-auto">
          <table class="w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="sticky left-0 z-20 whitespace-nowrap bg-card px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4">오픈마켓</th>
                <th
                  v-for="col in compareColumns"
                  :key="col.key"
                  class="whitespace-nowrap px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="market in OPEN_MARKETS"
                :key="market.key"
                class="border-b border-border/40 transition-colors hover:bg-accent/15"
                :class="market.key === lowestFeeMarket ? 'bg-profit/5 dark:bg-profit/12' : ''"
              >
                <td
                  class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4"
                  :class="'bg-card'"
                >
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                      :class="getReadableBadgeTextClass(market.key)"
                      :style="{ backgroundColor: market.color }"
                    >
                      {{ market.shortName }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-body font-semibold">
                          <span class="hidden sm:inline">{{ market.name }}</span>
                          <span class="sm:hidden">{{ market.shortName }}</span>
                        </span>
                        <span
                          v-if="market.key === lowestFeeMarket"
                          class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[11px] font-semibold text-white"
                        >
                          <BadgeCheck class="h-3.5 w-3.5" />
                          최저
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  v-for="col in compareColumns"
                  :key="`${market.key}-${col.key}`"
                  class="px-3 py-3 align-top sm:px-4"
                >
                  <div class="compare-cell" :class="getCellBg(col.key, market[col.key], market.key)">
                    <span class="compare-cell-value" :class="col.nowrap ? 'whitespace-nowrap' : ''">{{ market[col.key].core }}</span>
                    <CompareHint
                      v-if="market[col.key].tooltip || market[col.key].condition"
                      :tooltip="market[col.key].tooltip"
                      :condition="market[col.key].condition"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-2 flex items-start gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/70 px-3.5 py-3 text-[11px] leading-5 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/20 dark:text-amber-100 sm:text-caption">
          <BadgeAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <div class="space-y-1">
            <p>수수료율은 카테고리, 매출 등급, 계약 조건에 따라 달라질 수 있습니다.</p>
            <p>실제 입점 전에는 각 마켓의 최신 수수료 정책을 반드시 다시 확인하세요.</p>
          </div>
        </div>
      </div>
    </div>

    <AdSlot slot="market-compare" label="오픈마켓 비교 페이지 광고" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-panel-content text-center space-y-2">
        <p class="text-caption text-muted-foreground">내 상품의 수수료를 직접 계산해보세요.</p>
        <RouterLink :class="buttonVariants({ variant: 'default' })" to="/">
          수수료 계산기 사용하기
        </RouterLink>
      </div>
    </section>
  </div>
</template>
