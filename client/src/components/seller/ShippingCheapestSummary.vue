<script setup lang="ts">
// 1×2 틀 결과 칸 맨 위의 최저 운임 요약.
// 왜 새 숫자를 만들지 않고 옮기기만 하나: 일반·편의점 택배 표 머리에 있던 "현재 최저 예상 운임" 배지 두 개를
// 입력 바로 옆으로 모은 것이다 — 표 행의 '최저' 표시와 초록 강조는 그대로 남아 있어 표에서도 최저가가 보인다.
// 금액 문법은 결과 히어로 공통(라벨 muted → text-display 굵게 브랜드색 tabular). 택배사 이름이 섞여
// font-brand(브랜드 서브셋 폰트)는 쓰지 않는다 — 서브셋에 없는 글자가 다른 서체로 갈린다.
import { BadgeCheck } from "lucide-vue-next";

defineProps<{
  generalLabel: string | null;
  convenienceLabel: string | null;
}>();
</script>

<template>
  <section
    v-if="generalLabel || convenienceLabel"
    class="retro-panel overflow-hidden"
    aria-labelledby="shipping-cheapest-heading"
  >
    <div class="retro-panel-content space-y-3">
      <h2 id="shipping-cheapest-heading" class="inline-flex items-center gap-1.5 text-body font-bold text-foreground">
        <BadgeCheck class="h-4 w-4 text-status-success" aria-hidden="true" />
        현재 최저 예상 운임
      </h2>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div v-if="generalLabel" class="min-w-0">
          <dt class="text-caption text-muted-foreground">일반 택배</dt>
          <dd class="mt-1 text-display font-bold tabular-nums text-primary">{{ generalLabel }}</dd>
        </div>
        <div v-if="convenienceLabel" class="min-w-0">
          <dt class="text-caption text-muted-foreground">편의점 택배</dt>
          <dd class="mt-1 text-display font-bold tabular-nums text-primary">{{ convenienceLabel }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
