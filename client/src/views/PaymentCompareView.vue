<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { BadgeAlert, BadgeCheck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { SELLER_PAYMENT_GUIDE } from "@/data/seoGuides";
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
  PAYMENT_DATA_VERIFIED,
  PAYMENT_GATEWAYS,
  PAYMENT_SOURCES,
  NAVERPAY_COMPARISON,
  getPaymentGatewayEffectiveRate,
  type CompareCell,
  type PaymentGatewayKey,
  type PaymentGatewayMeta,
} from "@/data/paymentGateways";

type CompareColumnKey = "fixedCost" | "cardFee" | "settlementCycle" | "note";

interface CompareColumn {
  key: CompareColumnKey;
  label: string;
  nowrap?: boolean;
}

const seoTitle = "토스페이먼츠·네이버페이·카카오페이·PAYCO 결제 서비스 비교";
const seoDescription =
  "토스페이먼츠, 네이버페이 주문형·결제형, 카카오페이, PAYCO의 고정비·카드 수수료·정산 조건을 한눈에 비교합니다.";
const pageUrl = `${DEFAULT_SITE_URL}/payment-compare`;

const compareColumns: CompareColumn[] = [
  { key: "fixedCost", label: "고정비", nowrap: true },
  { key: "cardFee", label: "수수료(카드)", nowrap: true },
  { key: "settlementCycle", label: "정산 기준" },
  { key: "note", label: "비고" },
];

const lowestCardFeeGateways = computed<PaymentGatewayKey[]>(() => {
  let lowestRate = Number.POSITIVE_INFINITY;
  const winners: PaymentGatewayKey[] = [];

  for (const gateway of PAYMENT_GATEWAYS) {
    const rate = getPaymentGatewayEffectiveRate(gateway);
    if (rate < lowestRate - 1e-9) {
      lowestRate = rate;
      winners.length = 0;
      winners.push(gateway.key);
      continue;
    }
    if (Math.abs(rate - lowestRate) < 1e-9) {
      winners.push(gateway.key);
    }
  }

  return winners;
});

const lowestCardFeeLabel = computed<string | null>(() => {
  if (lowestCardFeeGateways.value.length === 0) return null;
  const winners = PAYMENT_GATEWAYS.filter((gateway) => lowestCardFeeGateways.value.includes(gateway.key));
  const rate = winners[0] ? getPaymentGatewayEffectiveRate(winners[0]) : null;
  if (winners.length === 0 || rate == null) return null;
  return `${winners.map((gateway) => gateway.shortName).join(" · ")} ${formatRate(rate)}%`;
});

const lowestCardFeeHint = computed(() => {
  if (lowestCardFeeGateways.value.length === 0) return null;
  const hasKakaoPay = lowestCardFeeGateways.value.includes("kakaopay");
  return {
    tooltip: "토스·카카오·PAYCO는 VAT 포함 실부담 기준으로 10%를 가산해 비교했습니다.",
    condition: hasKakaoPay ? "카카오페이는 단독 간편결제 기준이며 PG 경유 시 실제 총 비용은 더 커질 수 있습니다." : undefined,
  };
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
    "name": "간편결제 서비스 비교 항목",
    "url": pageUrl,
    "numberOfItems": PAYMENT_GATEWAYS.length,
    "itemListElement": PAYMENT_GATEWAYS.map((gateway, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "FinancialProduct",
        "name": gateway.name,
        "description": `${gateway.cardFee.core} · ${gateway.settlementCycle.core}`,
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

function getCell(gateway: PaymentGatewayMeta, key: CompareColumnKey): CompareCell {
  if (key === "fixedCost") {
    const setup = gateway.setupFee.core;
    const annual = gateway.annualFee.core;
    if (isFreeValue(setup) && isFreeValue(annual)) {
      return { core: "무료" };
    }
    return { core: `${setup} · ${annual}` };
  }
  return gateway[key as keyof Pick<PaymentGatewayMeta, "cardFee" | "settlementCycle" | "note">];
}

const paymentCopyHeaders = ["결제 서비스", ...compareColumns.map((c) => c.label)];
const paymentCopyRows = computed(() =>
  PAYMENT_GATEWAYS.map((gw) => [
    gw.name,
    ...compareColumns.map((col) => getCell(gw, col.key).core),
  ])
);

function getGatewayBadgeTextClass(gatewayKey: PaymentGatewayKey): string {
  if (gatewayKey === "kakaopay") {
    return "text-[#3B1E00]";
  }
  return "text-white";
}

function isLowestCardFeeGateway(gatewayKey: PaymentGatewayKey): boolean {
  return lowestCardFeeGateways.value.includes(gatewayKey);
}

const share = usePageShare({
  title: seoTitle,
  description: seoDescription,
  summaryText: `${PAYMENT_GATEWAYS.length}개 결제 서비스 고정비·카드 수수료·정산 조건 비교`,
  buttonLabel: "비교하러 가기",
});

function getCellBg(columnKey: CompareColumnKey, cell: CompareCell, gatewayKey: PaymentGatewayKey): string {
  void cell;
  if (columnKey === "cardFee" && isLowestCardFeeGateway(gatewayKey)) {
    return "compare-cell-highlight";
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
          <h1 class="retro-title">결제 서비스 비교</h1>
          <FreshBadge :message="`${PAYMENT_DATA_VERIFIED} 기준`" />
        </div>
        <SectionShareButton @click="share.openShare" />
      </div>

      <div class="retro-panel-content space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="space-y-1">
            <p class="text-[11px] text-muted-foreground sm:text-body">
              결제 서비스의 가입비·연회비·카드 수수료·정산 조건을 비교합니다.
            </p>
            <p class="text-[10px] text-muted-foreground/90 sm:text-caption">
              카드 수수료 표기는 공식 원문 기준이며, VAT 별도 항목은 상단 최저 실부담 계산에서 10%를 가산합니다.
            </p>
          </div>
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <span
              v-if="lowestCardFeeLabel"
              class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold leading-tight text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20 dark:text-emerald-300 sm:text-caption"
            >
              <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              영세 기준 최저 실부담 {{ lowestCardFeeLabel }}
              <CompareHint
                v-if="lowestCardFeeHint"
                :tooltip="lowestCardFeeHint.tooltip"
                :condition="lowestCardFeeHint.condition"
                compact
              />
            </span>
            <span class="md:hidden"><CopyTableButton :headers="paymentCopyHeaders" :rows="paymentCopyRows" /></span>
          </div>
        </div>

        <!-- 모바일: 카드 레이아웃 -->
        <div class="space-y-3 md:hidden">
          <div
            v-for="gateway in PAYMENT_GATEWAYS"
            :key="`m-${gateway.key}`"
            class="overflow-hidden rounded-2xl border bg-card"
            :class="isLowestCardFeeGateway(gateway.key) ? 'border-profit/40' : 'border-border/70'"
          >
            <div class="flex items-center gap-2.5 px-3.5 py-3">
              <span
                class="inline-flex h-8 min-w-10 shrink-0 items-center justify-center rounded-xl px-1.5 text-tiny font-bold whitespace-nowrap"
                :class="getGatewayBadgeTextClass(gateway.key)"
                :style="{ backgroundColor: gateway.color }"
              >
                {{ gateway.shortName }}
              </span>
              <span class="min-w-0 flex-1 truncate text-body font-bold text-foreground">{{ gateway.name }}</span>
            </div>
            <div class="space-y-0 border-t border-border/60">
              <div
                v-for="col in compareColumns"
                :key="`m-${gateway.key}-${col.key}`"
                class="flex items-center justify-between gap-3 border-b border-border/40 px-3.5 py-2.5 last:border-b-0"
              >
                <span class="shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-caption">{{ col.label }}</span>
                <span class="min-w-0 text-right text-[11px] font-semibold text-foreground sm:text-caption">
                  <span class="inline-flex max-w-full items-center justify-end gap-0.5 whitespace-normal break-words">
                    {{ getCell(gateway, col.key).core }}
                    <!-- 카드 수수료: 등급별 칩 힌트 -->
                    <CompareHint v-if="col.key === 'cardFee' && gateway.cardFeeTiers">
                      <div class="space-y-1.5">
                        <p class="font-semibold text-foreground">등급별 카드 수수료</p>
                        <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                          <span v-for="t in gateway.cardFeeTiers.tiers" :key="t.tier" class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5">
                            <span class="text-muted-foreground">{{ t.tier }}</span>
                            <span class="font-semibold">{{ t.rate }}</span>
                          </span>
                        </div>
                        <p class="text-[9px] text-muted-foreground">{{ gateway.cardFeeTiers.vatNote }}</p>
                      </div>
                    </CompareHint>
                    <!-- 비고: noteFeatures 또는 네이버 비교 테이블 -->
                    <CompareHint v-else-if="col.key === 'note' && (gateway.noteFeatures || gateway.key === 'naverOrder' || gateway.key === 'naverPayment')" :extra-wide="gateway.key === 'naverOrder' || gateway.key === 'naverPayment'" :wide="gateway.key !== 'naverOrder' && gateway.key !== 'naverPayment'">
                      <div class="space-y-2">
                        <!-- 네이버: 결제형 vs 주문형 비교 -->
                        <template v-if="gateway.key === 'naverOrder' || gateway.key === 'naverPayment'">
                          <p class="font-semibold text-foreground">결제형 vs 주문형 차이점</p>
                          <table class="w-full text-[10px]">
                            <thead>
                              <tr class="border-b border-border/50">
                                <th scope="col" class="pb-1.5 pr-1.5 text-left font-medium text-muted-foreground">구분</th>
                                <th scope="col" class="pb-1.5 pr-1.5 text-left font-medium text-muted-foreground">결제형</th>
                                <th scope="col" class="pb-1.5 text-left font-medium text-muted-foreground">주문형</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="row in NAVERPAY_COMPARISON" :key="row.label" class="border-b border-border/20 last:border-0 align-top">
                                <td class="py-1 pr-1.5 font-medium text-muted-foreground whitespace-nowrap">{{ row.label }}</td>
                                <td class="py-1 pr-1.5" :class="gateway.key === 'naverPayment' ? 'font-semibold text-primary' : ''">{{ row.payment }}</td>
                                <td class="py-1" :class="gateway.key === 'naverOrder' ? 'font-semibold text-primary' : ''">{{ row.order }}</td>
                              </tr>
                            </tbody>
                          </table>
                          <hr v-if="gateway.noteFeatures" class="border-border/40" />
                        </template>
                        <!-- 서비스 특징 -->
                        <template v-if="gateway.noteFeatures">
                          <p class="font-semibold text-foreground">{{ gateway.name }} 특징</p>
                          <table class="w-full text-[10px]">
                            <tbody>
                              <tr v-for="feat in gateway.noteFeatures" :key="feat.label" class="border-b border-border/20 last:border-0">
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
                      v-else-if="getCell(gateway, col.key).tooltip || getCell(gateway, col.key).condition"
                      :tooltip="getCell(gateway, col.key).tooltip"
                      :condition="getCell(gateway, col.key).condition"
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
                <th scope="col" class="sticky left-0 z-20 whitespace-nowrap bg-card px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4">결제 서비스</th>
                <th
                  scope="col"
                  v-for="(col, colIdx) in compareColumns"
                  :key="col.key"
                  class="whitespace-nowrap px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4"
                >
                  <span v-if="colIdx === compareColumns.length - 1" class="flex w-full items-center justify-between gap-1.5">
                    {{ col.label }}
                    <CopyTableButton :headers="paymentCopyHeaders" :rows="paymentCopyRows" />
                  </span>
                  <template v-else>{{ col.label }}</template>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="gateway in PAYMENT_GATEWAYS"
                :key="gateway.key"
                class="compare-hover-row border-b border-border/40 transition-colors"
                :class="isLowestCardFeeGateway(gateway.key) ? 'compare-hover-row-best bg-emerald-50/70 dark:bg-emerald-950/15' : ''"
              >
                <td
                  class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
                  :class="isLowestCardFeeGateway(gateway.key) ? 'bg-emerald-50/70 dark:bg-emerald-950/15' : 'bg-card'"
                >
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-10 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                      :class="getGatewayBadgeTextClass(gateway.key)"
                      :style="{ backgroundColor: gateway.color }"
                    >
                      {{ gateway.shortName }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-body font-semibold">{{ gateway.name }}</span>
                        <span
                          v-if="isLowestCardFeeGateway(gateway.key)"
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
                  :key="`${gateway.key}-${col.key}`"
                  class="px-3 py-3 align-top transition-colors sm:px-4"
                  :class="getCellBg(col.key, getCell(gateway, col.key), gateway.key)"
                >
                  <span class="inline-flex max-w-full items-center gap-0.5 align-middle">
                    <span class="compare-cell-value" :class="col.nowrap ? 'whitespace-nowrap' : ''">{{ getCell(gateway, col.key).core }}</span>
                    <!-- 카드 수수료: 등급별 칩 힌트 -->
                    <CompareHint v-if="col.key === 'cardFee' && gateway.cardFeeTiers">
                      <div class="space-y-1.5">
                        <p class="font-semibold text-foreground">등급별 카드 수수료</p>
                        <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                          <span v-for="t in gateway.cardFeeTiers.tiers" :key="t.tier" class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5">
                            <span class="text-muted-foreground">{{ t.tier }}</span>
                            <span class="font-semibold">{{ t.rate }}</span>
                          </span>
                        </div>
                        <p class="text-[9px] text-muted-foreground">{{ gateway.cardFeeTiers.vatNote }}</p>
                      </div>
                    </CompareHint>
                    <!-- 비고: noteFeatures 또는 네이버 비교 테이블 -->
                    <CompareHint v-else-if="col.key === 'note' && (gateway.noteFeatures || gateway.key === 'naverOrder' || gateway.key === 'naverPayment')" :extra-wide="gateway.key === 'naverOrder' || gateway.key === 'naverPayment'" :wide="gateway.key !== 'naverOrder' && gateway.key !== 'naverPayment'">
                      <div class="space-y-2">
                        <!-- 네이버: 결제형 vs 주문형 비교 -->
                        <template v-if="gateway.key === 'naverOrder' || gateway.key === 'naverPayment'">
                          <p class="font-semibold text-foreground">결제형 vs 주문형 차이점</p>
                          <table class="w-full text-[10px]">
                            <thead>
                              <tr class="border-b border-border/50">
                                <th scope="col" class="pb-1.5 pr-1.5 text-left font-medium text-muted-foreground">구분</th>
                                <th scope="col" class="pb-1.5 pr-1.5 text-left font-medium text-muted-foreground">결제형</th>
                                <th scope="col" class="pb-1.5 text-left font-medium text-muted-foreground">주문형</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="row in NAVERPAY_COMPARISON" :key="row.label" class="border-b border-border/20 last:border-0 align-top">
                                <td class="py-1 pr-1.5 font-medium text-muted-foreground whitespace-nowrap">{{ row.label }}</td>
                                <td class="py-1 pr-1.5" :class="gateway.key === 'naverPayment' ? 'font-semibold text-primary' : ''">{{ row.payment }}</td>
                                <td class="py-1" :class="gateway.key === 'naverOrder' ? 'font-semibold text-primary' : ''">{{ row.order }}</td>
                              </tr>
                            </tbody>
                          </table>
                          <hr v-if="gateway.noteFeatures" class="border-border/40" />
                        </template>
                        <!-- 서비스 특징 -->
                        <template v-if="gateway.noteFeatures">
                          <p class="font-semibold text-foreground">{{ gateway.name }} 특징</p>
                          <table class="w-full text-[10px]">
                            <tbody>
                              <tr v-for="feat in gateway.noteFeatures" :key="feat.label" class="border-b border-border/20 last:border-0">
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
                      v-else-if="getCell(gateway, col.key).tooltip || getCell(gateway, col.key).condition"
                      :tooltip="getCell(gateway, col.key).tooltip"
                      :condition="getCell(gateway, col.key).condition"
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
            <p>정산주기는 계약 조건, 매출 규모, PG 연동 구조에 따라 달라질 수 있습니다.</p>
            <p>실제 도입 전에는 각 서비스의 최신 가맹 정책과 개별 견적을 반드시 다시 확인하세요.</p>
          </div>
        </div>

        <CompareSourceFooter :sources="PAYMENT_SOURCES" :updated-at="PAYMENT_DATA_VERIFIED" />
      </div>
    </div>

    <AdSlot slot="payment-compare" label="결제 서비스 비교 페이지 광고" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-panel-content text-center space-y-2">
        <p class="text-caption text-muted-foreground">
          마켓 수수료에
          <br class="hidden sm:block" />
          PG 비용까지 합쳐서 직접 계산해보세요.
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

    <SeoRichGuide
      :title="SELLER_PAYMENT_GUIDE.title"
      :intro="SELLER_PAYMENT_GUIDE.intro"
      :sections="SELLER_PAYMENT_GUIDE.sections"
      :faqs="SELLER_PAYMENT_GUIDE.faqs"
      :disclaimer="SELLER_PAYMENT_GUIDE.disclaimer"
    />
  </div>
</template>
