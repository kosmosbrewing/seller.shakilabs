<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "수수료 계산", to: "/", href: "/seller" },
  { key: "market", label: "오픈마켓 비교", to: "/market-compare" },
  { key: "payment", label: "결제 비교", to: "/payment-compare" },
  { key: "shipping", label: "택배비 비교", to: "/shipping-compare" },
];

function isActive(item: PrimaryNavigationItem): boolean {
  return route.path === item.to;
}

const activeItem = computed(() => tabs.find(isActive));
</script>

<template>
  <ShPrimaryNavigation
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
    :mobile-columns="2"
  />
</template>
