<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { BadgeAlert, BadgeCheck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareHint from "@/components/common/CompareHint.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import CopyTableButton from "@/components/common/CopyTableButton.vue";
import SectionShareButton from "@/components/common/SectionShareButton.vue";
import ShareModal from "@/components/share/ShareModal.vue";
import { buttonVariants } from "@/components/ui/button";
import { usePageShare } from "@/composables/usePageShare";
import { BUILD_DATE } from "@/lib/buildMeta";
import { DEFAULT_SITE_URL } from "@/lib/site";
import {
  MARKET_COMPARE_VERIFIED,
  OPEN_MARKET_SOURCES,
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
    "dateModified": BUILD_DATE,
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

const marketCopyHeaders = ["오픈마켓", ...compareColumns.map((c) => c.label)];
const marketCopyRows = computed(() =>
  OPEN_MARKETS.map((market) => [
    market.name,
    ...compareColumns.map((col) => market[col.key].core),
  ])
);

const share = usePageShare({
  title: seoTitle,
  description: seoDescription,
  summaryText: `${OPEN_MARKETS.length}개 오픈마켓 판매 수수료·배송비 수수료·정산주기 비교`,
  buttonLabel: "비교하러 가기",
});

function getReadableBadgeTextClass(marketKey: OpenMarketKey): string {
  void marketKey;
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
      <div class="retro-titlebar rounded-t-2xl">
        <div class="flex items-center gap-2">
          <h1 class="retro-title">오픈마켓 비교</h1>
          <FreshBadge :message="`${MARKET_COMPARE_VERIFIED} 기준`" />
        </div>
        <SectionShareButton @click="share.openShare" />
      </div>

      <div class="retro-panel-content space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-[11px] text-muted-foreground sm:text-body">
            오픈마켓의 판매 수수료·배송비 수수료·정산주기를 비교합니다.
          </p>
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <span
              v-if="lowestFeeLabel"
              class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold leading-tight text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20 dark:text-emerald-300 sm:text-caption"
            >
              <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              영세 기준 최저 수수료 {{ lowestFeeLabel }}
            </span>
            <span class="md:hidden"><CopyTableButton :headers="marketCopyHeaders" :rows="marketCopyRows" /></span>
          </div>
        </div>

        <!-- 모바일: 카드 레이아웃 -->
        <div class="space-y-3 md:hidden">
          <div
            v-for="market in OPEN_MARKETS"
            :key="`m-${market.key}`"
            class="overflow-hidden rounded-2xl border bg-card"
            :class="market.key === lowestFeeMarket ? 'border-profit/40' : 'border-border/70'"
          >
            <div class="flex items-center gap-2.5 px-3.5 py-3">
              <span
                class="inline-flex h-8 min-w-10 shrink-0 items-center justify-center rounded-xl px-1.5 text-tiny font-bold whitespace-nowrap"
                :class="getReadableBadgeTextClass(market.key)"
                :style="{ backgroundColor: market.color }"
              >
                {{ market.shortName }}
              </span>
              <span class="min-w-0 flex-1 truncate text-body font-bold text-foreground">{{ market.name }}</span>
            </div>
            <div class="space-y-0 border-t border-border/60">
              <div
                v-for="col in compareColumns"
                :key="`m-${market.key}-${col.key}`"
                class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5 last:border-b-0"
              >
                <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">{{ col.label }}</span>
                <span class="min-w-0 text-right text-[11px] font-semibold text-foreground sm:text-caption">
                  <span class="inline-flex max-w-full items-center justify-end gap-0.5 whitespace-normal break-words">
                    {{ market[col.key].core }}
                    <!-- 판매 수수료: 등급/카테고리별 테이블 힌트 -->
                    <CompareHint v-if="col.key === 'salesFeeRange' && market.salesFeeBreakdown" wide>
                      <div class="space-y-2.5">
                        <div v-for="(section, sIdx) in market.salesFeeBreakdown.sections" :key="sIdx">
                          <hr v-if="sIdx > 0" class="border-border/30 mb-2" />
                          <p class="font-semibold text-foreground mb-1">{{ section.subtitle }}</p>
                          <p v-if="section.note" class="text-[9px] text-muted-foreground mb-1.5">{{ section.note }}</p>
                          <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                            <span v-for="row in section.rows" :key="row.label" class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5">
                              <span class="text-muted-foreground">{{ row.label }}</span>
                              <span class="font-semibold">{{ row.rate }}</span>
                            </span>
                          </div>
                        </div>
                        <p v-if="market.salesFeeBreakdown.footnote" class="text-[9px] text-muted-foreground">
                          {{ market.salesFeeBreakdown.footnote }}
                        </p>
                      </div>
                    </CompareHint>
                    <!-- 비고: noteFeatures 또는 물류비 테이블 -->
                    <CompareHint v-else-if="col.key === 'note' && (market.noteFeatures || market.noteBreakdown)" wide>
                      <div class="space-y-2">
                        <!-- 물류비 등 테이블 (쿠팡) -->
                        <template v-if="market.noteBreakdown">
                          <div v-for="(section, sIdx) in market.noteBreakdown.sections" :key="sIdx">
                            <hr v-if="sIdx > 0" class="border-border/30 mb-2" />
                            <p class="font-semibold text-foreground mb-1">{{ section.subtitle }}</p>
                            <p v-if="section.note" class="text-[9px] text-muted-foreground mb-1.5">{{ section.note }}</p>
                            <table class="w-full text-[10px] tabular-nums">
                              <tbody>
                                <tr v-for="row in section.rows" :key="row.label" class="border-b border-border/20 last:border-0">
                                  <td class="py-1 pr-2">{{ row.label }}</td>
                                  <td class="py-1 text-right font-semibold whitespace-nowrap">{{ row.rate }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <hr v-if="market.noteFeatures" class="border-border/40" />
                        </template>
                        <!-- 마켓 특징 -->
                        <template v-if="market.noteFeatures">
                          <p class="font-semibold text-foreground">{{ market.name }} 특징</p>
                          <table class="w-full text-[10px]">
                            <tbody>
                              <tr v-for="feat in market.noteFeatures" :key="feat.label" class="border-b border-border/20 last:border-0">
                                <td class="py-1 pr-2 font-medium text-muted-foreground whitespace-nowrap">{{ feat.label }}</td>
                                <td class="py-1">{{ feat.value }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </template>
                      </div>
                    </CompareHint>
                    <!-- 기타 일반 힌트 -->
                    <CompareHint
                      v-else-if="market[col.key].tooltip || market[col.key].condition"
                      :tooltip="market[col.key].tooltip"
                      :condition="market[col.key].condition"
                    />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 데스크톱: 테이블 레이아웃 -->
        <div class="hidden md:block">
        <p class="scroll-hint">표를 좌우로 밀면 다른 비교 항목을 계속 확인할 수 있습니다.</p>

        <div class="overflow-x-auto">
          <table class="w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th scope="col" class="sticky left-0 z-20 whitespace-nowrap bg-card px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4">오픈마켓</th>
                <th
                  scope="col"
                  v-for="(col, colIdx) in compareColumns"
                  :key="col.key"
                  class="whitespace-nowrap px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4"
                >
                  <span v-if="colIdx === compareColumns.length - 1" class="flex w-full items-center justify-between gap-1.5">
                    {{ col.label }}
                    <CopyTableButton :headers="marketCopyHeaders" :rows="marketCopyRows" />
                  </span>
                  <template v-else>{{ col.label }}</template>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="market in OPEN_MARKETS"
                :key="market.key"
                class="compare-hover-row border-b border-border/40 transition-colors"
                :class="market.key === lowestFeeMarket ? 'compare-hover-row-best bg-emerald-50/70 dark:bg-emerald-950/15' : ''"
              >
                <td
                  class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
                  :class="market.key === lowestFeeMarket ? 'bg-emerald-50/70 dark:bg-emerald-950/15' : 'bg-card'"
                >
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-10 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                      :class="getReadableBadgeTextClass(market.key)"
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
                  class="px-3 py-3 align-top transition-colors sm:px-4"
                  :class="getCellBg(col.key, market[col.key], market.key)"
                >
                  <span class="inline-flex items-center gap-0.5">
                    <span class="compare-cell-value" :class="col.nowrap ? 'whitespace-nowrap' : ''">{{ market[col.key].core }}</span>
                    <!-- 판매 수수료: 등급/카테고리별 테이블 힌트 -->
                    <CompareHint v-if="col.key === 'salesFeeRange' && market.salesFeeBreakdown" wide>
                      <div class="space-y-2.5">
                        <div v-for="(section, sIdx) in market.salesFeeBreakdown.sections" :key="sIdx">
                          <hr v-if="sIdx > 0" class="border-border/30 mb-2" />
                          <p class="font-semibold text-foreground mb-1">{{ section.subtitle }}</p>
                          <p v-if="section.note" class="text-[9px] text-muted-foreground mb-1.5">{{ section.note }}</p>
                          <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                            <span v-for="row in section.rows" :key="row.label" class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5">
                              <span class="text-muted-foreground">{{ row.label }}</span>
                              <span class="font-semibold">{{ row.rate }}</span>
                            </span>
                          </div>
                        </div>
                        <p v-if="market.salesFeeBreakdown.footnote" class="text-[9px] text-muted-foreground">
                          {{ market.salesFeeBreakdown.footnote }}
                        </p>
                      </div>
                    </CompareHint>
                    <!-- 비고: noteFeatures 또는 물류비 테이블 -->
                    <CompareHint v-else-if="col.key === 'note' && (market.noteFeatures || market.noteBreakdown)" wide>
                      <div class="space-y-2">
                        <!-- 물류비 등 테이블 (쿠팡) -->
                        <template v-if="market.noteBreakdown">
                          <div v-for="(section, sIdx) in market.noteBreakdown.sections" :key="sIdx">
                            <hr v-if="sIdx > 0" class="border-border/30 mb-2" />
                            <p class="font-semibold text-foreground mb-1">{{ section.subtitle }}</p>
                            <p v-if="section.note" class="text-[9px] text-muted-foreground mb-1.5">{{ section.note }}</p>
                            <table class="w-full text-[10px] tabular-nums">
                              <tbody>
                                <tr v-for="row in section.rows" :key="row.label" class="border-b border-border/20 last:border-0">
                                  <td class="py-1 pr-2">{{ row.label }}</td>
                                  <td class="py-1 text-right font-semibold whitespace-nowrap">{{ row.rate }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <hr v-if="market.noteFeatures" class="border-border/40" />
                        </template>
                        <!-- 마켓 특징 -->
                        <template v-if="market.noteFeatures">
                          <p class="font-semibold text-foreground">{{ market.name }} 특징</p>
                          <table class="w-full text-[10px]">
                            <tbody>
                              <tr v-for="feat in market.noteFeatures" :key="feat.label" class="border-b border-border/20 last:border-0">
                                <td class="py-1 pr-2 font-medium text-muted-foreground whitespace-nowrap">{{ feat.label }}</td>
                                <td class="py-1">{{ feat.value }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </template>
                      </div>
                    </CompareHint>
                    <!-- 기타 일반 힌트 -->
                    <CompareHint
                      v-else-if="market[col.key].tooltip || market[col.key].condition"
                      :tooltip="market[col.key].tooltip"
                      :condition="market[col.key].condition"
                    />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <div class="mt-2 flex items-start gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/70 px-3.5 py-3 text-[10px] leading-4 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/20 dark:text-amber-100 sm:text-caption">
          <BadgeAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <div class="space-y-1">
            <p>수수료율은 카테고리, 매출 등급, 계약 조건에 따라 달라질 수 있습니다.</p>
            <p>실제 입점 전에는 각 마켓의 최신 수수료 정책을 반드시 다시 확인하세요.</p>
          </div>
        </div>

        <CompareSourceFooter :sources="OPEN_MARKET_SOURCES" :updated-at="MARKET_COMPARE_VERIFIED" />
      </div>
    </div>

    <AdSlot slot="market-compare" label="오픈마켓 비교 페이지 광고" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-panel-content text-center space-y-2">
        <p class="text-caption text-muted-foreground">
          내 상품 기준으로
          <br class="hidden sm:block" />
          어느 마켓이 가장 유리한지 바로 계산해보세요.
        </p>
        <RouterLink :class="buttonVariants({ variant: 'default' })" to="/">
          수수료 계산기 사용하기
        </RouterLink>
      </div>
    </section>

    <ShareModal
      :show="share.showShareModal.value"
      :kakao-busy="share.kakaoBusy.value"
      :summary-text="share.summaryText"
      @close="share.closeShare"
      @share-kakao="share.shareKakao"
      @copy-link="share.copyLink"
    />
  </div>
</template>
