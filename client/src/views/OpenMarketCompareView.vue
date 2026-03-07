<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { BadgeCheck, CircleHelp } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import { DEFAULT_SITE_URL } from "@/lib/site";
import {
  MARKET_COMPARE_UPDATED,
  OPEN_MARKETS,
  type CompareCell,
  type OpenMarketKey,
} from "@/data/openMarketCompare";

type CompareColumnKey = "setupFee" | "salesFeeRange" | "shippingFeeRate" | "settlementCycle" | "note";

interface CompareColumn {
  key: CompareColumnKey;
  label: string;
}

const seoTitle = "스마트스토어 vs 쿠팡 vs 11번가 vs G마켓 오픈마켓 비교";
const seoDescription =
  "스마트스토어, 쿠팡, 11번가, G마켓의 입점비·판매 수수료·배송비 수수료·정산주기를 한눈에 비교합니다.";
const pageUrl = `${DEFAULT_SITE_URL}/market-compare`;

const compareColumns: CompareColumn[] = [
  { key: "setupFee", label: "입점비" },
  { key: "salesFeeRange", label: "판매 수수료" },
  { key: "shippingFeeRate", label: "배송비 수수료" },
  { key: "settlementCycle", label: "정산주기" },
  { key: "note", label: "비고" },
];

const freeEntryCount = computed(
  () => OPEN_MARKETS.filter((m) => m.setupFee.core === "무료").length
);

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

function isFreeValue(value: string): boolean {
  return value.includes("무료") || value.includes("없음");
}

function getCellBg(columnKey: CompareColumnKey, cell: CompareCell, marketKey: OpenMarketKey): string {
  if (columnKey === "setupFee" && isFreeValue(cell.core)) {
    return "compare-cell-highlight";
  }
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
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">오픈마켓 비교</h1>
        <div class="flex flex-col items-end gap-1.5">
          <FreshBadge :message="`${MARKET_COMPARE_UPDATED} 수수료 데이터 반영`" />
        </div>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          스마트스토어, 쿠팡, 11번가, G마켓의 입점 조건과 수수료 구조를 같은 기준으로 비교했습니다.
          실시간 계산이 필요하면 수수료 계산기에서 바로 확인할 수 있습니다.
        </p>

        <div class="flex flex-wrap gap-1.5 text-caption">
          <span class="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-semibold text-foreground">
            무료 입점 {{ freeEntryCount }} / {{ OPEN_MARKETS.length }}
          </span>
          <span
            v-if="lowestFeeLabel"
            class="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 font-semibold text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20"
          >
            <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            영세 기준 최저 시작 수수료 {{ lowestFeeLabel }}
          </span>
        </div>

        <p class="scroll-hint">표가 잘리지 않도록 좌우 스크롤을 지원합니다.</p>
        <div class="overflow-x-auto">
          <table class="min-w-[860px] w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">오픈마켓</th>
                <th
                  v-for="col in compareColumns"
                  :key="col.key"
                  class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground"
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
                :class="market.key === lowestFeeMarket ? 'bg-profit/5' : ''"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold text-white"
                      :style="{ backgroundColor: market.color }"
                    >
                      {{ market.shortName }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-body font-semibold">{{ market.name }}</span>
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
                  class="px-4 py-3 align-top"
                >
                  <div class="compare-cell" :class="getCellBg(col.key, market[col.key], market.key)">
                    <div class="flex items-start gap-1.5">
                      <p class="compare-cell-value">
                        {{ market[col.key].core }}
                      </p>
                      <div
                        v-if="market[col.key].tooltip || market[col.key].condition"
                        class="relative group shrink-0"
                      >
                        <button
                          type="button"
                          class="compare-tooltip-trigger"
                          aria-label="상세 설명 보기"
                        >
                          <CircleHelp class="h-3.5 w-3.5" />
                        </button>
                        <div class="compare-tooltip-panel">
                          <p class="compare-tooltip-title">상세 설명</p>
                          <p v-if="market[col.key].tooltip" class="mt-1.5">{{ market[col.key].tooltip }}</p>
                          <p
                            v-if="market[col.key].condition"
                            class="compare-tooltip-condition"
                          >
                            조건: {{ market[col.key].condition }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-[1.2rem] border border-border/70 bg-muted/20 px-3.5 py-3 text-[11px] leading-5 text-muted-foreground sm:text-caption">
          수수료율은 카테고리, 매출 등급, 계약 조건에 따라 달라질 수 있습니다. 실제 입점 전에는 각 마켓의 최신 수수료 정책을 반드시 다시 확인하세요.
        </div>
      </div>
    </div>

    <AdSlot slot="market-compare" label="오픈마켓 비교 페이지 광고" />

    <div class="text-center">
      <RouterLink to="/" class="retro-button">
        홈으로 돌아가 계산기 사용하기
      </RouterLink>
    </div>
  </div>
</template>
