<script setup lang="ts">
// 홈의 다음 계산 한 블록 — 패키지 ShNextActions(0.3.40)가 그린다(1×2 왼쪽 반폭이면 목록).
// 예전에는 1×2 왼쪽 비용 링크와 결과 아래 카드가 같은 계산기로 두 번 보냈다. 한 페이지에 "이어서 계산하기"는 하나.
// 분석은 함대 공통 스킴(related_tool_impression/click, placement "after_result")을 파라미터 그대로 쓴다.
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ShNextActions, type NextActionItem } from '@shakilabs/ui'
import { SELLER_RELATED_ACTIONS } from '@/data/sellerRelatedActions'
import { trackEvent } from '@/lib/analytics'

const baseParams = {
  app_id: 'seller',
  from_tool: 'market_fee_compare',
  placement: 'after_result',
}

onMounted(() => {
  SELLER_RELATED_ACTIONS.forEach((item) => {
    trackEvent('related_tool_impression', {
      ...baseParams,
      to_tool: item.key,
    })
  })
})

function trackRelatedClick(item: NextActionItem): void {
  trackEvent('related_tool_click', {
    ...baseParams,
    to_tool: item.key,
  })
}
</script>

<template>
  <ShNextActions :items="SELLER_RELATED_ACTIONS" :link-component="RouterLink" @select="trackRelatedClick" />
</template>
