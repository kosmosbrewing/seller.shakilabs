<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  MARKET_META,
  MARKET_ORDER,
  SMARTSTORE,
  COUPANG,
  ELEVENST,
  GMARKET,
  SMARTSTORE_TIER_LABELS,
  COUPANG_MODE_LABELS,
  FULFILLMENT_SIZE_LABELS,
  type MarketKey,
} from "@/data/marketFees";
import { CATEGORIES } from "@/data/categories";
import { formatPercent } from "@/lib/utils";

const props = defineProps<{
  marketKey: MarketKey;
}>();

const meta = computed(() => MARKET_META[props.marketKey]);

// 마켓 키 → URL 매핑
const MARKET_PATHS: Record<MarketKey, string> = {
  smartstore: "/smartstore",
  coupang: "/coupang",
  elevenst: "/11st",
  gmarket: "/gmarket",
};

// SEO
const seoTitle = computed(() => {
  const name = meta.value.name;
  return `${name} 수수료 총정리 | 반영 데이터 기준`;
});

const seoDescription = computed(() => {
  const name = meta.value.name;
  return `${name} 판매 수수료, 카테고리별 요율, 배송비 수수료를 상세히 정리했습니다.`;
});

// 마켓별 FAQ
const faqs = computed(() => {
  if (props.marketKey === "smartstore") {
    return [
      { q: "스마트스토어 수수료는 어떻게 구성되나요?", a: "주문관리 수수료(매출등급별 1.98~3.63%)와 판매 수수료(유입경로별 0.91~2.73%)로 구성됩니다. 카테고리별 추가 수수료는 없습니다." },
      { q: "스타트 제로수수료란?", a: "신규 사업자 대상으로 12개월간 주문관리 수수료가 면제되는 혜택입니다. 페이백 방식으로 운영됩니다." },
      { q: "반영된 개편 내용은?", a: "네이버쇼핑 유입 2% 추가 수수료 폐지 이후의 판매 수수료 체계를 기준으로 반영했습니다." },
    ];
  }
  if (props.marketKey === "coupang") {
    return [
      { q: "마켓플레이스와 로켓그로스 차이는?", a: "마켓플레이스는 카테고리 수수료만, 로켓그로스는 카테고리 수수료 + 물류비(건당)가 적용됩니다." },
      { q: "로켓그로스 물류비는 얼마인가요?", a: "소형 1,500원, 중형 2,500원, 대형 3,500원입니다. 크기와 무게 기준으로 구분됩니다." },
    ];
  }
  return [
    { q: "배송비에도 수수료가 붙나요?", a: "네, 유료배송 시 배송비의 3.3%가 수수료로 부과됩니다." },
    { q: "카테고리별 수수료율이 다른가요?", a: "네, 전자기기 카테고리가 다른 카테고리보다 수수료율이 낮습니다." },
  ];
});
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container py-5 space-y-5">
    <!-- 마켓 전환 탭 -->
    <div class="flex flex-wrap gap-1.5">
      <RouterLink
        v-for="key in MARKET_ORDER"
        :key="key"
        :to="MARKET_PATHS[key]"
        :class="[
          'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
          marketKey === key
            ? 'text-white'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
        ]"
        :style="marketKey === key ? { backgroundColor: MARKET_META[key].color } : {}"
      >
        {{ MARKET_META[key].name }}
      </RouterLink>
    </div>

    <!-- 마켓 헤더 -->
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <div class="flex items-center gap-3">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-heading font-bold text-white"
            :style="{ backgroundColor: meta.color }"
          >
            {{ meta.name.charAt(0) }}
          </span>
          <h1 class="retro-title">{{ meta.name }} 수수료 안내</h1>
        </div>
        <FreshBadge />
      </div>

      <div class="retro-panel-content space-y-4">
        <!-- 스마트스토어 상세 -->
        <template v-if="marketKey === 'smartstore'">
          <h2 class="text-heading font-bold">주문관리 수수료 (매출등급별)</h2>
          <div class="retro-board-list">
            <div v-for="(label, key) in SMARTSTORE_TIER_LABELS" :key="key" class="retro-board-item">
              <span class="text-body">{{ label }}</span>
              <span class="text-body font-bold tabular-nums">{{ formatPercent(SMARTSTORE.orderFee[key]) }}</span>
            </div>
          </div>

          <h2 class="text-heading font-bold">판매 수수료 (유입경로별, VAT 별도)</h2>
          <div class="retro-board-list">
            <div class="retro-board-item">
              <span class="text-body">네이버쇼핑 유입</span>
              <span class="text-body font-bold tabular-nums">{{ formatPercent(SMARTSTORE.saleFee.naverShopping) }} (VAT 포함 {{ formatPercent(SMARTSTORE.saleFee.naverShopping * 1.1) }})</span>
            </div>
            <div class="retro-board-item">
              <span class="text-body">마케팅링크 유입</span>
              <span class="text-body font-bold tabular-nums">{{ formatPercent(SMARTSTORE.saleFee.marketingLink) }} (VAT 포함 {{ formatPercent(SMARTSTORE.saleFee.marketingLink * 1.1) }})</span>
            </div>
          </div>

          <p class="text-caption text-muted-foreground">
            배송비에는 주문관리 수수료만 적용되며, 판매 수수료는 미적용됩니다.
          </p>
        </template>

        <!-- 쿠팡 상세 -->
        <template v-else-if="marketKey === 'coupang'">
          <h2 class="text-heading font-bold">카테고리별 판매 수수료</h2>
          <div class="retro-board-list">
            <div v-for="cat in CATEGORIES" :key="cat.key" class="retro-board-item">
              <span class="text-body">{{ cat.emoji }} {{ cat.label }}</span>
              <span class="text-body font-bold tabular-nums">{{ formatPercent(COUPANG.categoryFee[cat.key]) }}</span>
            </div>
          </div>

          <h2 class="text-heading font-bold">로켓그로스 물류비 (건당)</h2>
          <div class="retro-board-list">
            <div v-for="(label, key) in FULFILLMENT_SIZE_LABELS" :key="key" class="retro-board-item">
              <span class="text-body">{{ label }}</span>
              <span class="text-body font-bold tabular-nums">{{ COUPANG.fulfillmentFee[key].toLocaleString('ko-KR') }}원</span>
            </div>
          </div>
        </template>

        <!-- 11번가 상세 -->
        <template v-else-if="marketKey === 'elevenst'">
          <h2 class="text-heading font-bold">카테고리별 판매 수수료</h2>
          <div class="retro-board-list">
            <div v-for="cat in CATEGORIES" :key="cat.key" class="retro-board-item">
              <span class="text-body">{{ cat.emoji }} {{ cat.label }}</span>
              <span class="text-body font-bold tabular-nums">{{ formatPercent(ELEVENST.categoryFee[cat.key]) }}</span>
            </div>
          </div>
          <p class="text-caption text-muted-foreground">
            유료배송 시 배송비의 {{ formatPercent(ELEVENST.shippingFeeRate) }}가 수수료로 부과됩니다.
          </p>
        </template>

        <!-- G마켓 상세 -->
        <template v-else>
          <h2 class="text-heading font-bold">카테고리별 판매 수수료</h2>
          <div class="retro-board-list">
            <div v-for="cat in CATEGORIES" :key="cat.key" class="retro-board-item">
              <span class="text-body">{{ cat.emoji }} {{ cat.label }}</span>
              <span class="text-body font-bold tabular-nums">{{ formatPercent(GMARKET.categoryFee[cat.key]) }}</span>
            </div>
          </div>
          <p class="text-caption text-muted-foreground">
            유료배송 시 배송비의 {{ formatPercent(GMARKET.shippingFeeRate) }}가 수수료로 부과됩니다.
          </p>
        </template>
      </div>
    </div>

    <AdSlot slot="market-detail" />

    <!-- FAQ -->
    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h3 class="retro-title">자주 묻는 질문</h3>
      </div>
      <div class="retro-panel-content">
        <Accordion type="single" collapsible>
          <AccordionItem v-for="(faq, idx) in faqs" :key="idx" :value="`faq-${idx}`">
            <AccordionTrigger class="text-caption text-left">{{ faq.q }}</AccordionTrigger>
            <AccordionContent>{{ faq.a }}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>

    <!-- 다른 마켓 비교 링크 -->
    <div class="text-center">
      <RouterLink to="/" class="retro-button">
        다른 마켓과 비교하기
      </RouterLink>
    </div>
  </div>
</template>
