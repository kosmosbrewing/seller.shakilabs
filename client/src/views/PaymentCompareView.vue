<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { BadgeCheck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import { DEFAULT_SITE_URL } from "@/lib/site";
import {
  PAYMENT_DATA_UPDATED,
  PAYMENT_GATEWAYS,
  type PaymentGatewayKey,
} from "@/data/paymentGateways";

type CompareColumnKey = "setupFee" | "annualFee" | "cardFee" | "settlementCycle" | "note";

interface CompareColumn {
  key: CompareColumnKey;
  label: string;
}

const seoTitle = "토스페이먼츠·네이버페이·카카오페이·PAYCO 간편결제 수수료 비교";
const seoDescription =
  "토스페이먼츠, 네이버페이 주문형·결제형, 카카오페이, PAYCO의 가입비·연회비·카드 수수료·정산 조건을 한눈에 비교합니다.";
const pageUrl = `${DEFAULT_SITE_URL}/payment-compare`;

const compareColumns: CompareColumn[] = [
  { key: "setupFee", label: "가입비" },
  { key: "annualFee", label: "연회비" },
  { key: "cardFee", label: "수수료(카드)" },
  { key: "settlementCycle", label: "정산주기" },
  { key: "note", label: "비고" },
];

function parseFirstRate(value: string): number | null {
  const match = value.match(/(\d+(?:\.\d+)?)%/);
  if (!match) return null;
  return Number.parseFloat(match[1]);
}

const lowestCardFeeGateway = computed<PaymentGatewayKey | null>(() => {
  let lowest: { key: PaymentGatewayKey; rate: number } | null = null;
  for (const gateway of PAYMENT_GATEWAYS) {
    const rate = parseFirstRate(gateway.cardFee);
    if (rate == null) continue;
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
  const rate = gateway ? parseFirstRate(gateway.cardFee) : null;
  if (!gateway || rate == null) return null;
  return `${gateway.shortName} ${rate}%`;
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
        "description": `${gateway.cardFee} · ${gateway.settlementCycle}`,
      },
    })),
  },
]);

const freeEntryCount = computed(
  () => PAYMENT_GATEWAYS.filter((gateway) => gateway.setupFee === "무료").length
);

function isFreeValue(value: string): boolean {
  return value.includes("무료") || value.includes("없음");
}

function getCellBg(columnKey: CompareColumnKey, value: string, gatewayKey: PaymentGatewayKey): string {
  if ((columnKey === "setupFee" || columnKey === "annualFee") && isFreeValue(value)) {
    return "bg-emerald-50/60 dark:bg-emerald-950/15";
  }
  if (columnKey === "cardFee" && gatewayKey === lowestCardFeeGateway.value) {
    return "bg-emerald-50/60 dark:bg-emerald-950/15";
  }
  return "";
}
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="jsonLd" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">간편결제 비교</h1>
        <div class="flex flex-col items-end gap-1.5">
          <FreshBadge :message="`${PAYMENT_DATA_UPDATED} 결제 수수료 비교 반영`" />
        </div>
      </div>

      <div class="retro-panel-content space-y-4">
        <p class="text-body text-muted-foreground">
          오픈마켓 수수료 외에도 결제 수수료와 고정비는 셀러 수익성에 직접 영향을 줍니다.
          자사몰 또는 외부 채널에서 많이 검토하는 {{ PAYMENT_GATEWAYS.length }}개 서비스를 같은 기준으로 비교했습니다.
        </p>

        <div class="flex flex-wrap gap-1.5 text-caption">
          <span class="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-semibold text-foreground">
            무료 도입 {{ freeEntryCount }} / {{ PAYMENT_GATEWAYS.length }}
          </span>
          <span
            v-if="lowestCardFeeLabel"
            class="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 font-semibold text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20"
          >
            <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            최저 시작 수수료 {{ lowestCardFeeLabel }}
          </span>
        </div>

        <p class="scroll-hint">표가 잘리지 않도록 좌우 스크롤을 지원합니다.</p>
        <div class="overflow-x-auto">
          <table class="min-w-[860px] w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">결제 서비스</th>
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
                v-for="gateway in PAYMENT_GATEWAYS"
                :key="gateway.key"
                class="border-b border-border/40 transition-colors hover:bg-accent/15"
                :class="gateway.key === lowestCardFeeGateway ? 'bg-profit/5' : ''"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold text-white"
                      :style="{ backgroundColor: gateway.color }"
                    >
                      {{ gateway.shortName }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-body font-semibold">{{ gateway.name }}</span>
                        <span
                          v-if="gateway.key === lowestCardFeeGateway"
                          class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[11px] font-semibold text-white"
                        >
                          <BadgeCheck class="h-3.5 w-3.5" />
                          최저
                        </span>
                      </div>
                      <p class="text-tiny text-muted-foreground">{{ gateway.badge }}</p>
                    </div>
                  </div>
                </td>
                <td
                  v-for="col in compareColumns"
                  :key="`${gateway.key}-${col.key}`"
                  class="px-4 py-3 align-top"
                  :class="getCellBg(col.key, gateway[col.key], gateway.key)"
                >
                  <p class="whitespace-pre-line text-[12px] leading-[1.45] font-semibold text-foreground">
                    {{ gateway[col.key] }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-[1.2rem] border border-border/70 bg-muted/20 px-3.5 py-3 text-[11px] leading-5 text-muted-foreground sm:text-caption">
          정산주기는 계약 조건, 매출 규모, PG 연동 구조에 따라 달라질 수 있습니다. 실제 도입 전에는 각 서비스의 최신 가맹 정책과 개별 견적을 반드시 다시 확인하세요.
        </div>
      </div>
    </div>

    <AdSlot slot="payment-compare" label="결제 서비스 비교 페이지 광고" />

    <div class="text-center">
      <RouterLink to="/" class="retro-button">
        홈으로 돌아가 계산기 사용하기
      </RouterLink>
    </div>
  </div>
</template>
