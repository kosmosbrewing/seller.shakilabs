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
  PAYMENT_DATA_UPDATED,
  PAYMENT_GATEWAYS,
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

const lowestCardFeeGateway = computed<PaymentGatewayKey | null>(() => {
  let lowest: { key: PaymentGatewayKey; rate: number } | null = null;
  for (const gateway of PAYMENT_GATEWAYS) {
    const rate = gateway.microBusinessRate;
    if (!lowest || rate < lowest.rate) {
      lowest = { key: gateway.key, rate };
    }
  }
  return lowest?.key ?? null;
});

const lowestCardFeeLabel = computed<string | null>(() => {
  const gatewayKey = lowestCardFeeGateway.value;
  if (!gatewayKey) return null;
  const gateway = PAYMENT_GATEWAYS.find((entry) => entry.key === gatewayKey);
  const rate = gateway?.microBusinessRate ?? null;
  if (!gateway || rate == null) return null;
  return `${gateway.shortName} ${formatRate(rate)}%`;
});

const lowestCardFeeHint = computed(() => {
  if (lowestCardFeeGateway.value !== "kakaopay") return null;
  return {
    tooltip: "간편결제 단독 수수료 기준입니다.",
    condition: "PG 연동 구조에 따라 실제 총 비용은 추가될 수 있습니다.",
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
    return { core: `가입 ${setup} · 연 ${annual}` };
  }
  return gateway[key as keyof Pick<PaymentGatewayMeta, "cardFee" | "settlementCycle" | "note">];
}

function getGatewayBadgeTextClass(gatewayKey: PaymentGatewayKey): string {
  if (gatewayKey === "kakaopay") {
    return "text-[#3B1E00]";
  }
  return "text-white";
}

function getCellBg(columnKey: CompareColumnKey, cell: CompareCell, gatewayKey: PaymentGatewayKey): string {
  if (columnKey === "fixedCost" && isFreeValue(cell.core)) {
    return "compare-cell-highlight";
  }
  if (columnKey === "cardFee" && gatewayKey === lowestCardFeeGateway.value) {
    return "compare-cell-highlight";
  }
  return "";
}

</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="jsonLd" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar flex-col items-start gap-2 rounded-t-2xl sm:flex-row sm:items-center sm:gap-3">
        <h1 class="retro-title">결제 서비스 비교</h1>
        <div class="flex w-full flex-col items-start gap-1.5 sm:w-auto sm:items-end">
          <FreshBadge :message="`${PAYMENT_DATA_UPDATED} 반영`" />
        </div>
      </div>

      <div class="retro-panel-content space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-body text-muted-foreground">
            {{ PAYMENT_GATEWAYS.length }}개 결제 서비스의 가입비·연회비·카드 수수료·정산 조건을 비교합니다.
          </p>
          <span
            v-if="lowestCardFeeLabel"
            class="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-caption font-semibold text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20 dark:text-emerald-300"
          >
            <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            영세 기준 최저 수수료 {{ lowestCardFeeLabel }}
            <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center">
              <CompareHint
                v-if="lowestCardFeeHint"
                :tooltip="lowestCardFeeHint.tooltip"
                :condition="lowestCardFeeHint.condition"
              />
            </span>
          </span>
        </div>

        <p class="scroll-hint">표를 좌우로 밀면 다른 비교 항목을 계속 확인할 수 있습니다.</p>

        <div class="overflow-x-auto">
          <table class="w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="sticky left-0 z-20 whitespace-nowrap bg-card px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4">결제 서비스</th>
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
                v-for="gateway in PAYMENT_GATEWAYS"
                :key="gateway.key"
                class="border-b border-border/40 transition-colors hover:bg-accent/15"
                :class="gateway.key === lowestCardFeeGateway ? 'bg-profit/5 dark:bg-profit/12' : ''"
              >
                <td
                  class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4"
                  :class="'bg-card'"
                >
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                      :class="getGatewayBadgeTextClass(gateway.key)"
                      :style="{ backgroundColor: gateway.color }"
                    >
                      {{ gateway.shortName }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-body font-semibold">
                          <span class="hidden sm:inline">{{ gateway.name }}</span>
                          <span class="sm:hidden">{{ gateway.shortName }}</span>
                        </span>
                        <span
                          v-if="gateway.key === lowestCardFeeGateway"
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
                  class="px-3 py-3 align-top sm:px-4"
                >
                  <div class="compare-cell" :class="getCellBg(col.key, getCell(gateway, col.key), gateway.key)">
                    <span class="inline-flex max-w-full items-center gap-0.5 align-middle">
                      <span class="compare-cell-value" :class="col.nowrap ? 'whitespace-nowrap' : ''">{{ getCell(gateway, col.key).core }}</span>
                      <CompareHint
                        v-if="getCell(gateway, col.key).tooltip || getCell(gateway, col.key).condition"
                        :tooltip="getCell(gateway, col.key).tooltip"
                        :condition="getCell(gateway, col.key).condition"
                      />
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-2 flex items-start gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/70 px-3.5 py-3 text-[11px] leading-5 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/20 dark:text-amber-100 sm:text-caption">
          <BadgeAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <div class="space-y-1">
            <p>정산주기는 계약 조건, 매출 규모, PG 연동 구조에 따라 달라질 수 있습니다.</p>
            <p>실제 도입 전에는 각 서비스의 최신 가맹 정책과 개별 견적을 반드시 다시 확인하세요.</p>
          </div>
        </div>
      </div>
    </div>

    <AdSlot slot="payment-compare" label="결제 서비스 비교 페이지 광고" />

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
