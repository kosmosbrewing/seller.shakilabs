<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
import { buttonVariants } from "@/components/ui/button";
</script>

<template>
  <SEOHead
    title="페이지를 찾을 수 없습니다"
    description="요청하신 페이지를 찾을 수 없습니다."
    :noindex="true"
  />

  <div class="container py-20 text-center space-y-4">
    <p class="text-display text-muted-foreground">404</p>
    <p class="text-heading font-bold text-foreground">페이지를 찾을 수 없습니다</p>
    <p class="text-body text-muted-foreground">
      마켓 수수료가 꼬였어요. 홈으로 돌아가볼까요?
    </p>
    <RouterLink :class="[buttonVariants({ variant: 'default' }), 'mt-4']" to="/">
      홈으로 돌아가기
    </RouterLink>
  </div>
</template>
