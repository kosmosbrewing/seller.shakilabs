<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import { RouterLink } from "vue-router";
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
    <RouterLink to="/" class="retro-button inline-flex mt-4">
      홈으로 돌아가기
    </RouterLink>
  </div>
</template>
