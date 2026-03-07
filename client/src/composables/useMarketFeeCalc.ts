// 마켓별 수수료 비교 계산 composable
// URL 파라미터와 양방향 동기화

import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  type CategoryKey,
  type SmartStoreTier,
  type SmartStoreSource,
  type CoupangMode,
  type FulfillmentSize,
} from "@/data/marketFees";
import {
  DEFAULT_PRICE,
  DEFAULT_SHIPPING_FEE,
  DEFAULT_MONTHLY_QTY,
} from "@/data/pricePresets";
import {
  calcAllMarkets,
  findBestMarket,
  calcMonthlySim,
  type FeeBreakdown,
  type MonthlySimResult,
} from "@/utils/calculator";
import { parseQueryInt, queryFirst, buildQuery, isSameQuery } from "@/lib/routeState";
import {
  parsePrice,
  parseShippingFee,
  parseCategory,
  parseSmartStoreTier,
  parseSmartStoreSource,
  parseCoupangMode,
  parseFulfillmentSize,
  parseMonthlyQty,
  sanitizeCompareInput,
  sanitizeMonthlyQty,
} from "@/lib/validators";

export function useMarketFeeCalc() {
  const route = useRoute();
  const router = useRouter();

  // 입력 상태
  const price = ref(DEFAULT_PRICE);
  const shippingFee = ref(DEFAULT_SHIPPING_FEE);
  const category = ref<CategoryKey>("clothing");
  const smartstoreTier = ref<SmartStoreTier>("micro");
  const smartstoreSource = ref<SmartStoreSource>("naverShopping");
  const coupangMode = ref<CoupangMode>("marketplace");
  const fulfillmentSize = ref<FulfillmentSize>("small");
  const monthlyQty = ref(DEFAULT_MONTHLY_QTY);

  // URL → 상태 복원
  function restoreFromQuery(): void {
    const q = route.query;

    const qPrice = parsePrice(parseQueryInt(q.price));
    if (qPrice != null) price.value = qPrice;

    const qShipping = parseShippingFee(parseQueryInt(q.shipping));
    if (qShipping != null) shippingFee.value = qShipping;

    const qCat = parseCategory(queryFirst(q.cat));
    if (qCat != null) category.value = qCat;

    const qTier = parseSmartStoreTier(queryFirst(q.tier));
    if (qTier != null) smartstoreTier.value = qTier;

    const qSource = parseSmartStoreSource(queryFirst(q.source));
    if (qSource != null) smartstoreSource.value = qSource;

    const qMode = parseCoupangMode(queryFirst(q.mode));
    if (qMode != null) coupangMode.value = qMode;

    const qSize = parseFulfillmentSize(queryFirst(q.size));
    if (qSize != null) fulfillmentSize.value = qSize;

    const qQty = parseMonthlyQty(parseQueryInt(q.qty));
    if (qQty != null) monthlyQty.value = qQty;
  }

  // 상태 → URL 동기화 (기본값은 생략)
  function syncToQuery(): void {
    const query = buildQuery({
      price: price.value !== DEFAULT_PRICE ? price.value : null,
      shipping: shippingFee.value !== DEFAULT_SHIPPING_FEE ? shippingFee.value : null,
      cat: category.value !== "clothing" ? category.value : null,
      tier: smartstoreTier.value !== "micro" ? smartstoreTier.value : null,
      source: smartstoreSource.value !== "naverShopping" ? smartstoreSource.value : null,
      mode: coupangMode.value !== "marketplace" ? coupangMode.value : null,
      size: fulfillmentSize.value !== "small" ? fulfillmentSize.value : null,
      qty: monthlyQty.value !== DEFAULT_MONTHLY_QTY ? monthlyQty.value : null,
    });

    if (!isSameQuery(route.query, query)) {
      router.replace({ query });
    }
  }

  // 계산 결과 (반응형)
  const results = computed<FeeBreakdown[]>(() => {
    const validatedInput = sanitizeCompareInput({
      price: price.value,
      shippingFee: shippingFee.value,
      category: category.value,
      smartstoreTier: smartstoreTier.value,
      smartstoreSource: smartstoreSource.value,
      coupangMode: coupangMode.value,
      fulfillmentSize: fulfillmentSize.value,
    });
    return calcAllMarkets(validatedInput);
  });

  const bestMarket = computed(() => findBestMarket(results.value));

  const monthlySimResults = computed<MonthlySimResult[]>(() => {
    const validatedQty = sanitizeMonthlyQty(monthlyQty.value);
    return calcMonthlySim(results.value, validatedQty);
  });

  // URL에서 복원 (최초 1회)
  restoreFromQuery();

  // 입력 변경 → URL 동기화 (디바운스 300ms)
  let syncTimer: ReturnType<typeof setTimeout> | null = null;
  watch(
    [price, shippingFee, category, smartstoreTier, smartstoreSource, coupangMode, fulfillmentSize, monthlyQty],
    () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(syncToQuery, 300);
    }
  );

  // 컴포넌트 파괴 시 타이머 정리
  onUnmounted(() => {
    if (syncTimer) clearTimeout(syncTimer);
  });

  return {
    // 입력
    price,
    shippingFee,
    category,
    smartstoreTier,
    smartstoreSource,
    coupangMode,
    fulfillmentSize,
    monthlyQty,

    // 결과
    results,
    bestMarket,
    monthlySimResults,
  };
}
