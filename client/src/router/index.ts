import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { showAlert } from "@/composables/useAlert";
import { trackPageView } from "@/lib/analytics";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
    meta: { title: "오픈마켓 수수료 비교 계산기 | 스마트스토어 vs 쿠팡 vs 11번가" },
  },
  {
    path: "/smartstore",
    name: "Smartstore",
    component: () => import("@/views/MarketDetailView.vue"),
    props: { marketKey: "smartstore" },
    meta: { title: "스마트스토어 수수료 총정리 | 반영 데이터 기준" },
  },
  {
    path: "/coupang",
    name: "Coupang",
    component: () => import("@/views/MarketDetailView.vue"),
    props: { marketKey: "coupang" },
    meta: { title: "쿠팡 수수료 총정리 | 마켓플레이스·로켓그로스 비교" },
  },
  {
    path: "/11st",
    name: "ElevenSt",
    component: () => import("@/views/MarketDetailView.vue"),
    props: { marketKey: "elevenst" },
    meta: { title: "11번가 수수료 총정리 | 카테고리별 수수료율 안내" },
  },
  {
    path: "/gmarket",
    name: "Gmarket",
    component: () => import("@/views/MarketDetailView.vue"),
    props: { marketKey: "gmarket" },
    meta: { title: "G마켓/옥션 수수료 총정리 | 카테고리별 수수료율 안내" },
  },
  {
    path: "/clothing-fee-compare",
    name: "ClothingCompare",
    component: () => import("@/views/CategoryCompareView.vue"),
    props: { categorySlug: "clothing" },
    meta: { title: "의류 판매 수수료 비교 | 스마트스토어 vs 쿠팡 vs 11번가" },
  },
  {
    path: "/food-fee-compare",
    name: "FoodCompare",
    component: () => import("@/views/CategoryCompareView.vue"),
    props: { categorySlug: "food" },
    meta: { title: "식품 판매 수수료 비교 | 스마트스토어 vs 쿠팡 vs 11번가" },
  },
  {
    path: "/electronics-fee-compare",
    name: "ElectronicsCompare",
    component: () => import("@/views/CategoryCompareView.vue"),
    props: { categorySlug: "electronics" },
    meta: { title: "전자기기 판매 수수료 비교 | 스마트스토어 vs 쿠팡 vs 11번가" },
  },
  {
    path: "/beauty-fee-compare",
    name: "BeautyCompare",
    component: () => import("@/views/CategoryCompareView.vue"),
    props: { categorySlug: "beauty" },
    meta: { title: "화장품 판매 수수료 비교 | 스마트스토어 vs 쿠팡 vs 11번가" },
  },
  {
    path: "/living-fee-compare",
    name: "LivingCompare",
    component: () => import("@/views/CategoryCompareView.vue"),
    props: { categorySlug: "living" },
    meta: { title: "생활용품 판매 수수료 비교 | 스마트스토어 vs 쿠팡 vs 11번가" },
  },
  {
    path: "/price/:amount(\\d+)",
    name: "PriceCompare",
    component: () => import("@/views/PriceCompareView.vue"),
    props: (route) => ({
      priceAmount: Number.parseInt(String(route.params.amount), 10),
    }),
    meta: { title: "판매가별 마켓 수수료 비교 | 반영 데이터 기준" },
  },
  {
    path: "/payment-compare",
    name: "PaymentCompare",
    component: () => import("@/views/PaymentCompareView.vue"),
    meta: { title: "간편결제 수수료 비교 | 토스페이먼츠 vs 네이버페이 vs 카카오페이 vs PAYCO" },
  },
  {
    path: "/shipping-compare",
    name: "ShippingCompare",
    component: () => import("@/views/ShippingCompareView.vue"),
    meta: { title: "택배비 비교 계산기 | 8개 택배사 예상 운임 비교" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
    meta: { title: "서비스 안내 | 오픈마켓 수수료 비교 계산기" },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
    meta: { title: "개인정보 처리방침 | 오픈마켓 수수료 비교 계산기" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "페이지를 찾을 수 없습니다 | ShakiLabs" },
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
  const title =
    typeof to.meta.title === "string"
      ? to.meta.title
      : "오픈마켓 수수료 비교 계산기 | 스마트스토어 vs 쿠팡 vs 11번가";
  document.title = title;

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
  const title = typeof to.meta.title === "string" ? to.meta.title : document.title;
  trackPageView(to.fullPath, title);
});

export default router;
