<script setup lang="ts">
// 마켓 수수료 다음에 볼 계산 — 결제 수수료·택배비는 화면 안 비교 기준을 바꾸는 탭이 아니라
// 별도 계산기(라우트)로 가는 링크라서 패키지 ShNextActions(0.3.40)로 그린다(반폭 칸이면 목록).
// select 계약("payment" | "shipping")은 그대로 둔다 — HomeView의 related_tool_click
// (to_tool seller_*, placement "cost_axis") 집계가 이 값을 쓴다.
import { RouterLink } from "vue-router";
import { ShNextActions, type NextActionItem } from "@shakilabs/ui";

type CostAxisTarget = "payment" | "shipping";

const emit = defineEmits<{
  select: [target: CostAxisTarget];
}>();

const items: readonly NextActionItem[] = [
  { key: "payment", title: "결제 수수료 비교", to: "/payment-compare", note: "토스페이먼츠·네이버페이 등 PG사별 카드 수수료" },
  { key: "shipping", title: "택배비 비교", to: "/shipping-compare", note: "일반 택배 6사 · 편의점 택배 2사 운임" },
];

function onSelect(item: NextActionItem): void {
  if (item.key === "payment" || item.key === "shipping") emit("select", item.key);
}
</script>

<template>
  <ShNextActions :items="items" :link-component="RouterLink" @select="onSelect" />
</template>
