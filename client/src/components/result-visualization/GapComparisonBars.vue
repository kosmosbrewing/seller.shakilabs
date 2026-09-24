<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShGapBars(1위 대비 차이 막대) — 이 파일은 seller 레트로 패널 크롬만 입힌다.
// 값이 비슷한 선택지를 0부터 그린 총액 막대(MetricComparisonBars)로는 차이가 보이지 않을 때 쓴다.
import { ShGapBars } from "@shakilabs/ui";
import type { GapBarItem, GapDirection } from "@shakilabs/ui";

defineProps<{
  title: string;
  note: string;
  items: readonly GapBarItem[];
  formatValue: (value: number) => string;
  better: GapDirection;
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <ShGapBars
      class="seller-gap-bars"
      :items="items"
      :note="note"
      :format-value="formatValue"
      :better="better"
      highlight-tone="success"
    >
      <!-- 타이틀바는 앱 고유 크롬이라 슬롯으로 유지한다. aria 계약상 titleId를 h2에 그대로 단다 -->
      <template #header="{ titleId }">
        <div class="retro-titlebar rounded-t-2xl">
          <h2 :id="titleId" class="retro-title">{{ title }}</h2>
        </div>
      </template>
    </ShGapBars>
  </section>
</template>

<style scoped>
/* 타이틀바를 패널 상단에 꽉 채우려면 차트 루트에 패딩을 줄 수 없다.
   설명문·목록에만 retro-panel-content와 같은 여백을 준다(MetricComparisonBars와 동일). */
.seller-gap-bars {
  --seller-chart-pad-x: 0.875rem;
  --seller-chart-pad-y: 0.75rem;
  gap: 0;
}

@media (min-width: 640px) {
  .seller-gap-bars {
    --seller-chart-pad-x: 1.25rem;
    --seller-chart-pad-y: 1rem;
  }
}

.seller-gap-bars :deep(.sh-chart__header) {
  gap: 0;
}

.seller-gap-bars :deep(.sh-chart__note) {
  padding: var(--seller-chart-pad-y) var(--seller-chart-pad-x) 0;
}

.seller-gap-bars :deep(.sh-gap-bars__list) {
  padding: 1.25rem var(--seller-chart-pad-x) var(--seller-chart-pad-y);
}
</style>
