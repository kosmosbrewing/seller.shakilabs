<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
import { FEE_DATA_UPDATED } from "@/data/marketFees";
import { PAYMENT_DATA_UPDATED } from "@/data/paymentGateways";
import { SHIPPING_DATA_UPDATED } from "@/data/shippingRates";
</script>

<template>
  <SEOHead
    title="서비스 안내"
    description="seller.shakilabs.com은 스마트스토어, 쿠팡, 11번가, G마켓의 수수료를 무료로 비교하는 셀러 전용 도구입니다."
  />

  <div class="container py-5 space-y-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <h2 class="text-heading font-bold">오픈마켓 수수료 비교 계산기</h2>
        <p class="text-body text-muted-foreground">
          seller.shakilabs.com은 오픈마켓 셀러를 위한 무료 수수료 비교 도구입니다.
          같은 상품을 스마트스토어, 쿠팡, 11번가, G마켓/옥션에서 판매할 때
          수수료와 순이익이 얼마나 차이나는지 한눈에 비교할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">주요 기능</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>4개 마켓 수수료 즉시 비교 (로그인/연동 불필요)</li>
          <li>카테고리별, 매출등급별, 판매방식별 세분화 계산</li>
          <li>월간/연간 시뮬레이션으로 장기 비용 차이 확인</li>
          <li>카카오톡 공유, URL 파라미터 공유 지원</li>
        </ul>

        <h2 class="text-heading font-bold">수수료 데이터 기준</h2>
        <ul class="text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>마켓 수수료: {{ FEE_DATA_UPDATED }} 기준</li>
          <li>결제 수수료: {{ PAYMENT_DATA_UPDATED }} 기준</li>
          <li>택배비: {{ SHIPPING_DATA_UPDATED }} 기준</li>
        </ul>
        <p class="text-body text-muted-foreground">
          각 마켓·서비스 공식 수수료율을 기반으로 하며, 수수료 변경 시 업데이트됩니다.
          프로모션 할인, 광고비, 반품/교환 비용 등은 포함되지 않습니다.
        </p>

        <h2 class="text-heading font-bold">문의</h2>
        <p class="text-body text-muted-foreground">
          오류 제보나 기능 건의는
          <a href="mailto:skdba1313@gmail.com" class="retro-link">skdba1313@gmail.com</a>으로
          보내주세요.
        </p>
      </div>
    </div>

    <div class="text-center">
      <RouterLink to="/" class="retro-button">
        수수료 비교하기
      </RouterLink>
    </div>
  </div>
</template>
