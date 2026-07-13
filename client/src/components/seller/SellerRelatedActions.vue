<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { ShSurface, ShText } from '@shakilabs/ui'
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

function trackRelatedClick(toTool: string): void {
  trackEvent('related_tool_click', {
    ...baseParams,
    to_tool: toTool,
  })
}
</script>

<template>
  <section aria-labelledby="seller-related-actions-title">
    <div class="mb-4 border-t border-foreground pt-4">
      <ShText as="p" variant="label" tone="primary">계산 결과 다음 단계</ShText>
      <ShText id="seller-related-actions-title" as="h2" variant="title" class="mt-2">
        빠뜨리기 쉬운 비용을 이어서 확인하세요
      </ShText>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <ShSurface
        v-for="item in SELLER_RELATED_ACTIONS"
        :key="item.key"
        as="a"
        variant="outlined"
        padding="md"
        :href="item.href"
        class="group flex min-h-40 flex-col no-underline transition-colors hover:border-primary"
        @click="trackRelatedClick(item.key)"
      >
        <ShText as="h3" variant="heading">{{ item.title }}</ShText>
        <ShText variant="caption" tone="muted" class="mt-2 flex-1">
          {{ item.description }}
        </ShText>
        <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
          {{ item.title }}
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </span>
      </ShSurface>
    </div>
  </section>
</template>
