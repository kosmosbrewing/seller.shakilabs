<script setup lang="ts">
import { computed } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useHead } from "@unhead/vue";
import { MONTHLY_FEES } from "@/data/marketFees";

const monthlyFeeText = computed(() => {
  const c = MONTHLY_FEES.coupang!;
  const e = MONTHLY_FEES.elevenst!;
  const g = MONTHLY_FEES.gmarket!;
  return `쿠팡은 ${c.threshold} 시 ${c.amount.toLocaleString("ko-KR")}원, 11번가는 ${e.threshold} 시 ${e.amount.toLocaleString("ko-KR")}원, G마켓/옥션은 ${g.threshold} 시 ${g.amount.toLocaleString("ko-KR")}원이 추가될 수 있습니다. 이 계산기에서는 건당 수수료만 비교하며, 월정액은 별도로 보셔야 합니다.`;
});

const faqs = computed(() => [
  {
    q: "스마트스토어가 낮게 나오는 이유는?",
    a: "오픈마켓 4종 비교 기준에서는 스마트스토어가 카테고리별 판매수수료 대신 주문관리 수수료(1.95~3.63%, VAT 포함)와 유입경로별 판매 수수료(1.00~3.00%, VAT 포함)를 조합해 계산합니다. 그래서 일부 조건에서는 다른 오픈마켓보다 낮게 나올 수 있습니다. 다만 신규 혜택, 프로모션, 실제 유입 구조에 따라 결과는 달라질 수 있습니다.",
  },
  {
    q: "로켓그로스가 더 높게 나오는 이유는?",
    a: "현재 계산기 기준에서는 로켓그로스에 카테고리 수수료(7.8~10.6%) 외 물류비(건당 700~4,300원)가 추가됩니다. 그래서 상품가가 낮거나 부피가 큰 상품일수록 총 수수료가 더 높게 나올 수 있습니다.",
  },
  {
    q: "배송비에도 수수료가 붙나요?",
    a: "오픈마켓 4종 비교 기준에서는 유료배송 시 배송비에도 수수료가 반영될 수 있습니다. 스마트스토어는 배송비에 주문관리 수수료만 적용하고, 쿠팡·11번가·G마켓/옥션은 배송비의 3.3%를 반영합니다. 자사몰(PG) 비교는 배송비를 따로 계산하지 않습니다.",
  },
  {
    q: "매출등급에 따라 뭐가 달라지나요?",
    a: "현재 계산기에서는 연 매출 기준으로 영세, 중소1, 중소2, 중소3, 일반의 5개 구간을 사용합니다. 등급에 따라 스마트스토어 주문관리 수수료가 달라질 수 있습니다. 2025.10 인하분이 반영되어 영세부터 중소3까지는 기존보다 소폭 낮아졌습니다.",
  },
  {
    q: "월정액도 따로 있나요?",
    a: `네. ${monthlyFeeText.value}`,
  },
  {
    q: "자사몰은 어떤 비용을 더 봐야 하나요?",
    a: "현재 비교에는 PG사의 카드 결제 수수료만 반영되어 있습니다. 호스팅비, 트래픽 확보 비용(광고/SEO), 토스페이먼츠 고정비(설정 22만/연 11만), 카카오페이 PG 연동비 등은 별도로 검토하셔야 합니다.",
  },
  {
    q: "결과는 어디까지 믿어도 되나요?",
    a: "현재 계산기는 각 마켓의 대표 수수료와 기본 과금 항목을 기준으로 비교합니다. 세부 카테고리, 프로모션 할인, 광고비, 반품·교환 비용, 월정액 등은 운영 조건에 따라 달라질 수 있습니다. 그래서 실제 정산 금액과는 차이가 날 수 있습니다.",
  },
]);

// FAQ JSON-LD (FAQPage 구조화 데이터)
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.value.map((faq) => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a,
    },
  })),
}));

useHead(() => ({
  script: [
    {
      key: "faq-json-ld",
      type: "application/ld+json",
      textContent: JSON.stringify(faqJsonLd.value),
    },
  ],
}));
</script>

<template>
  <div class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">자주 묻는 질문</h2>
    </div>
    <div class="retro-panel-content">
      <Accordion type="single" collapsible>
        <AccordionItem v-for="(faq, idx) in faqs" :key="idx" :value="`faq-${idx}`">
          <AccordionTrigger class="text-caption text-left">
            {{ faq.q }}
          </AccordionTrigger>
          <AccordionContent>
            {{ faq.a }}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
