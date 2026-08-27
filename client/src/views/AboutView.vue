<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { buildFaqPageJsonLd } from "@/composables/useSEO";
import { SELLER_ABOUT_GUIDE, SELLER_HOME_GUIDE } from "@/data/seoGuides";
import { buttonVariants } from "@/components/ui/button";
import { useConstantsStore } from "@/stores/constants";
import { FEE_DATA_UPDATED, FEE_DATA_VERIFIED } from "@/data/marketFees";
import { SETTLEMENT_VERIFIED } from "@/data/settlementCycles";
import { PAYMENT_DATA_UPDATED, PAYMENT_DATA_VERIFIED } from "@/data/paymentGateways";
import { SHIPPING_DATA_UPDATED, SHIPPING_DATA_VERIFIED } from "@/data/shippingRates";

const constantsStore = useConstantsStore();

// 페이지 하단 SeoRichGuide에 노출되는 SELLER_HOME_GUIDE FAQ와 동일 텍스트 (페이지당 FAQPage 1개)
const jsonLd = buildFaqPageJsonLd(SELLER_HOME_GUIDE.faqs);
</script>

<template>
  <SEOHead
    title="서비스 안내"
    description="shakilabs.com/seller는 스마트스토어, 쿠팡, 11번가, G마켓의 수수료를 무료로 비교하는 셀러 전용 도구입니다."
    :json-ld="jsonLd"
  />

  <div class="container py-5 space-y-5">
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
      </div>

      <div class="retro-panel-content space-y-4">
        <h2 class="text-heading font-bold">오픈마켓 수수료 비교 계산기</h2>
        <p class="text-body text-muted-foreground">
          shakilabs.com/seller는 오픈마켓 셀러를 위한 무료 수수료 비교 도구입니다.
          같은 상품을 스마트스토어, 쿠팡, 11번가, G마켓/옥션에서 판매할 때
          수수료와 순이익이 얼마나 차이나는지 한눈에 비교할 수 있습니다.
        </p>

        <h2 class="text-heading font-bold">주요 기능</h2>
        <ul class="about-feature-list text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>4개 마켓 수수료 즉시 비교 (로그인/연동 불필요)</li>
          <li>카테고리별, 매출등급별, 판매방식별 세분화 계산</li>
          <li>월간/연간 시뮬레이션으로 장기 비용 차이 확인</li>
          <li>카카오톡 공유, URL 파라미터 공유 지원</li>
        </ul>

        <h2 class="text-heading font-bold">수수료 데이터 기준</h2>
        <ul class="about-feature-list text-body text-muted-foreground space-y-1 list-disc list-inside">
          <li>마켓 수수료: {{ FEE_DATA_UPDATED }} 변경 · {{ FEE_DATA_VERIFIED }} 공식 문서 재검증</li>
          <li>결제 수수료: {{ PAYMENT_DATA_UPDATED }} 변경 · {{ PAYMENT_DATA_VERIFIED }} 공식 문서 재검증</li>
          <li>택배비: {{ SHIPPING_DATA_UPDATED }} 변경 · {{ SHIPPING_DATA_VERIFIED }} 공식 문서 재검증</li>
          <li>정산주기: {{ SETTLEMENT_VERIFIED }} 각 마켓 공식 안내·약관 원문 확인</li>
        </ul>
        <p class="text-body text-muted-foreground">
          각 마켓·서비스 공식 수수료율을 기반으로 하며, 수수료 변경 시 업데이트됩니다.
          프로모션 할인, 광고비, 반품/교환 비용 등은 포함되지 않습니다.
        </p>

        <h2 class="text-heading font-bold">문의</h2>
        <p class="text-body text-muted-foreground">
          오류 제보나 기능 건의는
          <a :href="`mailto:${constantsStore.supportEmail}`" class="retro-link">{{ constantsStore.supportEmail }}</a>으로
          보내주세요.
        </p>

        <!-- 운영 주체 신원 블록 — 애드센스 심사에서 요구하는 운영자·연락처 명시 -->
        <div class="retro-panel-muted space-y-2 p-4">
          <p class="text-body font-bold text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p class="text-caption leading-relaxed text-muted-foreground">
            모든 수수료율과 계산 기준은 각 오픈마켓 판매자센터·PG사·택배사의 공식 고시 자료,
            국세청 부가가치세·간이과세 고시와 대조해 검증하며, 요율이 바뀌면 확인일을 명시해 갱신합니다.
            오류 제보를 보내주시면 확인 후 신속히 반영합니다.
          </p>
        </div>
      </div>
    </div>

    <div class="text-center">
      <a :class="buttonVariants({ variant: 'default' })" href="/seller">
        수수료 비교하기
      </a>
    </div>

    <SeoRichGuide
      :title="SELLER_ABOUT_GUIDE.title"
      :intro="SELLER_ABOUT_GUIDE.intro"
      :sections="SELLER_ABOUT_GUIDE.sections"
      :disclaimer="SELLER_ABOUT_GUIDE.disclaimer"
    />
    <SeoRichGuide
      :title="SELLER_HOME_GUIDE.title"
      :intro="SELLER_HOME_GUIDE.intro"
      :sections="SELLER_HOME_GUIDE.sections"
      :faqs="SELLER_HOME_GUIDE.faqs"
    />
  </div>
</template>
