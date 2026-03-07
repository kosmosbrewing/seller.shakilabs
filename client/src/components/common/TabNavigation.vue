<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const tabs = [
  { key: "home", label: "실시간 계산기", to: "/" },
  { key: "category", label: "카테고리 비교", to: "/clothing-fee-compare" },
  { key: "price", label: "가격대 비교", to: "/price/30000" },
  { key: "market", label: "마켓 가이드", to: "/smartstore" },
] as const;

const activePath = computed(() => route.path);

function isActiveTab(key: (typeof tabs)[number]["key"]): boolean {
  if (key === "home") return activePath.value === "/";
  if (key === "category") return activePath.value.includes("-fee-compare");
  if (key === "price") return activePath.value.startsWith("/price");
  // 마켓 가이드: /smartstore, /coupang, /11st, /gmarket
  return ["/smartstore", "/coupang", "/11st", "/gmarket"].some((p) =>
    activePath.value === p
  );
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container">
      <div class="flex h-12 items-center gap-2 overflow-x-auto" style="scrollbar-width: none">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center px-3 text-body font-semibold transition-all duration-200',
            isActiveTab(tab.key)
              ? 'text-primary-foreground'
              : 'text-primary-foreground/70 hover:text-primary-foreground/90',
          ]"
        >
          {{ tab.label }}
          <span
            v-if="isActiveTab(tab.key)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
