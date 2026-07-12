<script setup lang="ts">
import { ShSurface, ShText } from "@shakilabs/ui";
</script>

<template>
  <ShSurface as="section" padding="none" class="overflow-hidden">
    <div class="retro-titlebar rounded-t-2xl">
      <ShText as="h2" variant="title">30초 수수료 비교 안내</ShText>
    </div>
    <div class="retro-panel-content space-y-4">
      <p class="text-body text-muted-foreground">
        판매가, 카테고리, 배송비만 입력하면 스마트스토어/쿠팡/11번가/G마켓의 건당 수수료와 순이익을 바로 보여줍니다.
      </p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="retro-panel-muted p-3">
          <ShText variant="label" tone="primary">입력</ShText>
          <ShText class="mt-1.5" variant="heading">핵심 정보 3개 입력</ShText>
          <ShText class="mt-1.5" variant="caption" tone="muted">
            판매가, 카테고리, 배송비만 넣으면
            <br class="hidden sm:block" />
            어디가 유리한지 바로 계산됩니다.
          </ShText>
        </div>
        <div class="retro-panel-muted p-3">
          <ShText variant="label" tone="primary">비교</ShText>
          <ShText class="mt-1.5" variant="heading">최적 마켓 확인</ShText>
          <ShText class="mt-1.5" variant="caption" tone="muted">
            1위 마켓과 2위 차이 금액을
            <br class="hidden sm:block" />
            한 번에 확인할 수 있습니다.
          </ShText>
        </div>
        <div class="retro-panel-muted p-3">
          <ShText variant="label" tone="primary">검토</ShText>
          <ShText class="mt-1.5" variant="heading">상세표로 검증</ShText>
          <ShText class="mt-1.5" variant="caption" tone="muted">
            상세 비교표와 월간 시뮬레이션으로
            <br class="hidden sm:block" />
            차이를 바로 검증할 수 있습니다.
          </ShText>
        </div>
      </div>
    </div>
  </ShSurface>
</template>
