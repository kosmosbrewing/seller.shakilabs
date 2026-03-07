<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import {
  PAYMENT_DATA_UPDATED,
  PAYMENT_GATEWAYS,
  type PaymentGatewayKey,
} from "@/data/paymentGateways";

interface CompareRow {
  key: string;
  label: string;
  helper?: string;
  values: Record<PaymentGatewayKey, string>;
}

const seoTitle = "간편결제 수수료 비교 | 토스페이먼츠 vs 네이버페이 vs 카카오페이 vs PAYCO";
const seoDescription =
  "토스페이먼츠, 네이버페이 주문형·결제형, 카카오페이, PAYCO의 가입비·연회비·카드 수수료·정산 조건을 한눈에 비교합니다.";

const compareRows = computed<CompareRow[]>(() => [
  {
    key: "setupFee",
    label: "가입비",
    helper: "초기 도입 비용",
    values: Object.fromEntries(PAYMENT_GATEWAYS.map((gateway) => [gateway.key, gateway.setupFee])) as Record<
      PaymentGatewayKey,
      string
    >,
  },
  {
    key: "annualFee",
    label: "연회비",
    helper: "고정 유지 비용",
    values: Object.fromEntries(PAYMENT_GATEWAYS.map((gateway) => [gateway.key, gateway.annualFee])) as Record<
      PaymentGatewayKey,
      string
    >,
  },
  {
    key: "cardFee",
    label: "수수료 (카드)",
    helper: "매출 규모별 범위",
    values: Object.fromEntries(PAYMENT_GATEWAYS.map((gateway) => [gateway.key, gateway.cardFee])) as Record<
      PaymentGatewayKey,
      string
    >,
  },
  {
    key: "settlementCycle",
    label: "정산주기",
    helper: "운영 정책 확인 필요",
    values: Object.fromEntries(PAYMENT_GATEWAYS.map((gateway) => [gateway.key, gateway.settlementCycle])) as Record<
      PaymentGatewayKey,
      string
    >,
  },
  {
    key: "note",
    label: "비고",
    helper: "도입 판단 포인트",
    values: Object.fromEntries(PAYMENT_GATEWAYS.map((gateway) => [gateway.key, gateway.note])) as Record<
      PaymentGatewayKey,
      string
    >,
  },
]);

const freeEntryCount = computed(
  () => PAYMENT_GATEWAYS.filter((gateway) => gateway.setupFee === "무료").length
);
const noAnnualFeeCount = computed(
  () => PAYMENT_GATEWAYS.filter((gateway) => gateway.annualFee === "없음" || gateway.annualFee.startsWith("무료")).length
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">간편결제 비교</h1>
        <FreshBadge :message="`${PAYMENT_DATA_UPDATED} 결제 수수료 비교 반영`" />
      </div>

      <div class="retro-panel-content space-y-4">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start">
          <div class="space-y-3">
            <p class="text-body text-muted-foreground">
              오픈마켓 수수료 외에도 결제 수수료와 고정비는 셀러 수익성에 직접 영향을 줍니다.
              아래 비교판은 자사몰 또는 외부 채널에서 많이 검토하는 5개 결제 서비스를 한 장에 정리한 것입니다.
            </p>
            <div class="rounded-[1.5rem] border border-primary/20 bg-primary/10 px-4 py-3.5">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">한눈에 보기</p>
              <p class="mt-1.5 text-body font-bold text-foreground">
                무료 도입 {{ freeEntryCount }}개 · 연회비 부담 적은 옵션 {{ noAnnualFeeCount }}개
              </p>
              <p class="mt-1 text-caption text-muted-foreground">
                PG형은 인프라 범위가 넓고, 간편결제형은 초기 진입비가 낮은 편입니다.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">비교 대상</p>
              <p class="mt-1.5 text-body font-bold text-foreground">5개 서비스</p>
            </div>
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">핵심 항목</p>
              <p class="mt-1.5 text-body font-bold text-foreground">가입비·연회비·수수료</p>
            </div>
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">도입 관점</p>
              <p class="mt-1.5 text-body font-bold text-foreground">PG형 vs 간편결제형</p>
            </div>
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">주의</p>
              <p class="mt-1.5 text-body font-bold text-foreground">실계약 전 정책 재확인</p>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-[980px] w-full border-separate border-spacing-0 text-body">
            <thead>
              <tr>
                <th class="w-[180px] px-3 py-3 text-left text-caption font-semibold text-muted-foreground">
                  비교 항목
                </th>
                <th
                  v-for="gateway in PAYMENT_GATEWAYS"
                  :key="gateway.key"
                  class="px-2 py-3 align-top"
                >
                  <div class="rounded-[1.35rem] border border-border/70 bg-card px-3.5 py-3 text-left shadow-sm">
                    <p class="text-[11px] font-bold uppercase tracking-[0.14em]" :class="gateway.accentClass">
                      {{ gateway.badge }}
                    </p>
                    <p class="mt-1.5 text-body font-bold text-foreground">
                      {{ gateway.name }}
                    </p>
                    <p class="mt-1 text-caption text-muted-foreground">{{ gateway.shortName }}</p>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in compareRows"
                :key="row.key"
                class="align-top"
              >
                <th class="px-3 py-2.5 text-left">
                  <div class="rounded-[1.1rem] bg-muted/30 px-3.5 py-3">
                    <p class="text-body font-bold text-foreground">{{ row.label }}</p>
                    <p v-if="row.helper" class="mt-1 text-caption text-muted-foreground">
                      {{ row.helper }}
                    </p>
                  </div>
                </th>
                <td
                  v-for="gateway in PAYMENT_GATEWAYS"
                  :key="`${row.key}-${gateway.key}`"
                  class="px-2 py-2.5"
                >
                  <div class="flex min-h-[96px] items-center rounded-[1.1rem] border border-border/60 bg-background px-3.5 py-3">
                    <p class="whitespace-pre-line text-body font-semibold leading-relaxed text-foreground">
                      {{ row.values[gateway.key] }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-[1.4rem] border border-border/70 bg-muted/20 px-4 py-3.5 text-caption text-muted-foreground">
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
