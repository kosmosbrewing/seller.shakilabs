import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { nextTick } from "vue";
import { showAlert } from "@/composables/useAlert";
import { trackPageView } from "@/lib/analytics";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/market-compare",
    name: "MarketCompare",
    component: () => import("@/views/OpenMarketCompareView.vue"),
  },
  {
    path: "/payment-compare",
    name: "PaymentCompare",
    component: () => import("@/views/PaymentCompareView.vue"),
  },
  {
    path: "/shipping-compare",
    name: "ShippingCompare",
    component: () => import("@/views/ShippingCompareView.vue"),
  },

  // 기존 URL 리다이렉트 → /market-compare
  { path: "/smartstore", redirect: "/market-compare" },
  { path: "/coupang", redirect: "/market-compare" },
  { path: "/11st", redirect: "/market-compare" },
  { path: "/gmarket", redirect: "/market-compare" },
  { path: "/clothing-fee-compare", redirect: "/market-compare" },
  { path: "/food-fee-compare", redirect: "/market-compare" },
  { path: "/electronics-fee-compare", redirect: "/market-compare" },
  { path: "/beauty-fee-compare", redirect: "/market-compare" },
  { path: "/living-fee-compare", redirect: "/market-compare" },
  { path: "/price/:amount(\\d+)", redirect: "/market-compare" },

  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 80 };
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const needsAuthState = Boolean(to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.guestOnly);

  if (needsAuthState && !authStore.isInitialized) {
    try {
      await authStore.loadUser({ throwOnError: true });
    } catch {
      showAlert("사용자 정보를 불러오지 못했습니다.", { type: "error" });
      return false;
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return "/";
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    showAlert("로그인이 필요합니다.", { type: "error" });
    return "/";
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    showAlert("관리자 권한이 필요합니다.", { type: "error" });
    return "/";
  }

  return true;
});

router.afterEach((to, _from, failure) => {
  if (failure) return;
  void nextTick(() => {
    trackPageView(to.fullPath, document.title);
  });
});

export default router;
