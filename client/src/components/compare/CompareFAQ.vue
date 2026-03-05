<script setup lang="ts">
import { computed } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useHead } from "@vueuse/head";

const faqs = [
  {
    q: "스마트스토어 수수료가 가장 낮은 이유가 뭔가요?",
    a: "스마트스토어는 카테고리별 수수료가 없고, 주문관리 수수료(1.98~3.63%)와 판매 수수료(2.73%)만 적용됩니다. 2025년 6월 개편으로 네이버쇼핑 유입 2% 추가 수수료가 폐지되어 더 유리해졌습니다.",
  },
  {
    q: "쿠팡 로켓그로스는 왜 수수료가 더 높나요?",
    a: "로켓그로스는 카테고리 수수료(8.1~10.8%) 외에 물류비(건당 1,500~3,500원)가 추가됩니다. 저가 상품일수록 물류비 비중이 커져 실질 수수료율이 높아집니다.",
  },
  {
    q: "배송비에도 수수료가 붙나요?",
    a: "마켓마다 다릅니다. 스마트스토어는 배송비에 주문관리 수수료만 적용합니다. 11번가와 G마켓/옥션은 유료배송 시 배송비의 3.3%가 수수료로 부과됩니다. 쿠팡은 배송비 수수료가 없습니다.",
  },
  {
    q: "스마트스토어 매출등급은 어떻게 결정되나요?",
    a: "연 매출 기준으로 영세(3억 이하), 중소(3~30억), 일반(30억 초과)으로 구분됩니다. 신규 입점 시 영세 등급이 적용되며, 스타트 제로수수료 혜택으로 12개월간 주문관리 수수료가 면제됩니다.",
  },
  {
    q: "이 계산기의 수수료는 정확한가요?",
    a: "2025년 6월 기준 각 마켓 공식 수수료율을 반영했습니다. 다만 프로모션 할인, 광고비, 반품/교환 비용 등은 포함되지 않으므로 실제 정산 금액과 차이가 있을 수 있습니다.",
  },
];

// FAQ JSON-LD (FAQPage 구조화 데이터)
const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
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
      children: JSON.stringify(faqJsonLd.value),
    },
  ],
}));
</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h3 class="retro-title">자주 묻는 질문</h3>
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
