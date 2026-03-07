<script setup lang="ts">
import { computed } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useHead } from "@unhead/vue";

const faqs = [
  {
    q: "스마트스토어 수수료가 가장 낮은 이유가 뭔가요?",
    a: "스마트스토어는 카테고리별 수수료가 없고, 주문관리 수수료(1.947~3.63%)와 판매 수수료(0.91~2.73%)만 적용됩니다. 2025.06 개편으로 기존 유입수수료가 폐지되고 판매수수료 체계로 변경되었습니다.",
  },
  {
    q: "쿠팡 로켓그로스는 왜 수수료가 더 높나요?",
    a: "로켓그로스는 카테고리 수수료(7.8~10.5%) 외에 물류비(건당 700~4,300원)가 추가됩니다. 2025.01 개편으로 6단계 크기 구분이 적용되며, 저가 상품일수록 물류비 비중이 커져 실질 수수료율이 높아집니다.",
  },
  {
    q: "배송비에도 수수료가 붙나요?",
    a: "네, 모든 마켓에서 유료배송 시 배송비에 수수료가 부과됩니다. 스마트스토어는 배송비에 주문관리 수수료만 적용하고, 쿠팡·11번가·G마켓/옥션은 배송비의 3.3%가 수수료로 부과됩니다.",
  },
  {
    q: "스마트스토어 매출등급은 어떻게 결정되나요?",
    a: "연 매출 기준으로 영세(3억 이하), 중소1(3~5억), 중소2(5~10억), 중소3(10~30억), 일반(30억 초과) 5단계로 구분됩니다. 2025.10 인하가 반영되어 영세~중소3까지 소폭 인하되었습니다.",
  },
  {
    q: "서버 이용료(월정액)도 있나요?",
    a: "네. 쿠팡은 월 판매 100만원 초과 시 55,000원, 11번가는 월 구매확정 500만원 초과 시 77,000원, G마켓/옥션은 월 판매 500만원 초과 시 55,000원이 부과됩니다. 이 계산기에서는 건당 수수료만 비교하며, 월정액은 별도입니다.",
  },
  {
    q: "이 계산기의 수수료는 정확한가요?",
    a: "각 마켓의 대표 카테고리 수수료율을 기준으로 계산합니다. 세부 카테고리에 따라 실제 수수료율이 다를 수 있으며, 프로모션 할인, 광고비, 반품/교환 비용, 서버 이용료 등은 포함되지 않으므로 실제 정산 금액과 차이가 있을 수 있습니다.",
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
