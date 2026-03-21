<script setup lang="ts">
import type { Component } from "vue";
import { ArrowRight, Calculator, CreditCard, Building2 } from "lucide-vue-next";

type RelatedServiceItem = {
  title: string;
  description: string;
  href: string;
  icon: Component;
};

const items: RelatedServiceItem[] = [
  {
    title: "연봉 실수령액 계산",
    description: "판매 수익에서 급여·세금을 빼면 실제 손에 쥐는 금액을 확인합니다.",
    href: "/finance/salary",
    icon: Calculator,
  },
  {
    title: "카드 수수료 비교",
    description: "결제 대행사별 카드 수수료율을 비교해 최적의 결제 수단을 선택합니다.",
    href: "/card/fee-compare",
    icon: CreditCard,
  },
  {
    title: "개인 vs 법인 비교",
    description: "사업자 유형별 세후소득 차이를 비교해 절세 전략을 점검합니다.",
    href: "/biz/individual-vs-corp",
    icon: Building2,
  },
];
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">관련 서비스</h2>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-caption leading-relaxed text-muted-foreground">
        수수료를 계산했다면 급여·카드 수수료·사업자 비용도 함께 비교해 보세요.
      </p>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="item in items"
          :key="item.href"
          :href="item.href"
          class="group flex flex-col rounded-[1.6rem] border border-border/70 bg-card p-4 text-left transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:border-primary/25 hover:bg-muted/15"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-body font-bold text-foreground">{{ item.title }}</p>
              <p class="mt-1.5 text-caption text-muted-foreground">{{ item.description }}</p>
            </div>
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <component :is="item.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
            바로 가기
            <ArrowRight class="h-3.5 w-3.5" />
          </p>
        </a>
      </div>
    </div>
  </section>
</template>
