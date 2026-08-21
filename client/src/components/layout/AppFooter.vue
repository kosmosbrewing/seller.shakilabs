<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ShSiteFooter } from "@shakilabs/ui";
import { FOOTER_ALL_LINK, FOOTER_SECTIONS } from "@/data/footerNav";
import { useConstantsStore } from "@/stores/constants";

const constantsStore = useConstantsStore();
const year = new Date().getFullYear();
const SUPPORT_EMAIL = constantsStore.supportEmail;

const policyLinks = [
  { to: "/about", label: "사이트 안내" },
  { to: "/terms", label: "이용약관" },
  { to: "/privacy", label: "개인정보 처리방침" },
  // 블로그는 root 앱(shakilabs.com/blog) 소유라 seller 라우터에 없다.
  // href를 주면 ShSiteFooter가 RouterLink 대신 <a href>로 렌더해
  // /seller/blog로 깨지지 않고 도메인 절대경로로 나간다.
  { to: "", href: "/blog", label: "블로그" },
  { to: "", href: `mailto:${SUPPORT_EMAIL}`, label: "문의" },
];

const note = computed(() => `수수료 데이터 기준: ${constantsStore.feeDataUpdated} | 본 계산 결과는 참고용이며, 실제 정산 금액과 차이가 있을 수 있습니다.`);
</script>

<template>
  <ShSiteFooter
    app="seller"
    :sections="FOOTER_SECTIONS"
    :all-link="FOOTER_ALL_LINK"
    :policy-links="policyLinks"
    :note="note"
    site-label="shakilabs.com/seller"
    :copyright="`Copyright © ${year} shakilabs.com`"
    :link-component="RouterLink"
  />
</template>
