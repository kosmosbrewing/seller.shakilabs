<script setup lang="ts">
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import { PAYMENT_GATEWAYS, getPaymentGatewayEffectiveRate } from "@/data/paymentGateways";

const minimum = Math.min(...PAYMENT_GATEWAYS.map(getPaymentGatewayEffectiveRate));
const metrics = [{
  key: "rate",
  label: "영세 기준 카드 수수료 실부담",
  values: PAYMENT_GATEWAYS.map((gateway) => {
    const rate = getPaymentGatewayEffectiveRate(gateway);
    return {
      key: gateway.key,
      label: gateway.name,
      value: rate,
      highlight: Math.abs(rate - minimum) < 1e-9,
    };
  }),
}];
const formatRate = (value: number) => `${value.toFixed(3).replace(/\.?0+$/, "")}%`;
</script>

<template>
  <MetricComparisonBars
    title="결제 서비스 최저 요율 그래프"
    note="공개된 영세 기준값을 VAT 포함 실부담으로 환산했습니다. 고정비·PG 병행·개별 계약 조건은 아래 표와 출처를 함께 확인해야 합니다."
    :metrics="metrics"
    :format-value="formatRate"
  />
</template>
