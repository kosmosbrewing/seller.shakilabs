<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShMetricBars — 이 파일은 seller 레트로 패널 크롬만 입힌다.
// 호출부 5곳의 props는 그대로 유지한다(음수 순이익을 왼쪽으로 그리던 동작은 domain="signed"로 보존).
import { ShMetricBars } from "@shakilabs/ui";
import type { MetricBarGroup } from "@shakilabs/ui";

defineProps<{
  title: string;
  note: string;
  metrics: readonly MetricBarGroup[];
  formatValue: (value: number) => string;
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <ShMetricBars
      class="seller-metric-bars"
      :metrics="metrics"
      :note="note"
      :format-value="formatValue"
      domain="signed"
      highlight-tone="success"
    >
      <!-- 타이틀바는 앱 고유 크롬이라 슬롯으로 유지한다. aria 계약상 titleId를 h2에 그대로 단다 -->
      <template #header="{ titleId }">
        <div class="retro-titlebar rounded-t-2xl">
          <h2 :id="titleId" class="retro-title">{{ title }}</h2>
        </div>
      </template>
    </ShMetricBars>
  </section>
</template>

<style scoped>
/* 타이틀바를 패널 상단에 꽉 채우려면 차트 루트에 패딩을 줄 수 없다.
   대신 설명문·막대 영역에만 retro-panel-content와 동일한 여백을 재현한다. */
.seller-metric-bars {
  --seller-chart-pad-x: 0.875rem;
  --seller-chart-pad-y: 0.75rem;
  gap: 0;
}

@media (min-width: 640px) {
  .seller-metric-bars {
    --seller-chart-pad-x: 1.25rem;
    --seller-chart-pad-y: 1rem;
  }
}

.seller-metric-bars :deep(.sh-chart__header) {
  gap: 0;
}

.seller-metric-bars :deep(.sh-chart__note) {
  padding: var(--seller-chart-pad-y) var(--seller-chart-pad-x) 0;
}

/* 상단 1.25rem = 기존 space-y-5(설명문 ↔ 첫 지표 간격) */
.seller-metric-bars :deep(.sh-metric-bars__groups) {
  padding: 1.25rem var(--seller-chart-pad-x) var(--seller-chart-pad-y);
}
</style>
