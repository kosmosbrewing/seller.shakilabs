<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";
import { SELLER_TOOLS } from "@/data/sellerNavigation";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "수수료 계산", to: "/", href: "/seller" },
  ...SELLER_TOOLS.map((tool) => ({
    key: tool.key,
    label: tool.label,
    to: tool.path,
  })),
];

function isActive(item: PrimaryNavigationItem): boolean {
  return route.path === item.to;
}

const activeItem = computed(() => tabs.find(isActive));
</script>

<template>
  <!-- 모바일(<48rem)은 헤더의 좌측 드로어가 대신한다(v3 §3.3-1).
       링크는 드로어에 그대로 렌더되므로 크롤 경로는 유지된다. -->
  <ShPrimaryNavigation
    class="tab-navigation--desktop-only"
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>

<style scoped>
@media (max-width: 47.99rem) {
  .tab-navigation--desktop-only {
    display: none;
  }
}
</style>
