<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ChevronDown } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CompareHint from "@/components/common/CompareHint.vue";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
const PRICE_QUICK = [
  { value: 10_000, label: "1만" },
  { value: 30_000, label: "3만" },
  { value: 50_000, label: "5만" },
  { value: 100_000, label: "10만" },
] as const;
import {
  SMARTSTORE,
  SMARTSTORE_TIER_LABELS,
  SMARTSTORE_SOURCE_LABELS,
  COUPANG,
  COUPANG_MODE_LABELS,
  FULFILLMENT_SIZE_LABELS,
  ELEVENST,
  GMARKET,
  OWN_STORE_META,
  OWN_STORE_ORDER,
  resolveOwnStoreEffectiveRate,
  isOwnStoreVatExclusive,
  type SmartStoreTier,
  type SmartStoreSource,
  type CoupangMode,
  type FulfillmentSize,
  type CategoryKey,
} from "@/data/marketFees";
import { estimateTier } from "@/utils/calculator";
import { parsePrice, parseShippingFee, PRICE_MIN, PRICE_MAX } from "@/lib/validators";

const props = defineProps<{
  price: number;
  shippingFee: number;
  category: CategoryKey;
  smartstoreTier: SmartStoreTier;
  smartstoreSource: SmartStoreSource;
  coupangMode: CoupangMode;
  fulfillmentSize: FulfillmentSize;
  includeOwnStore: boolean;
  monthlyQty: number;
}>();

const emit = defineEmits<{
  "update:price": [value: number];
  "update:shippingFee": [value: number];
  "update:category": [value: CategoryKey];
  "update:smartstoreTier": [value: SmartStoreTier];
  "update:smartstoreSource": [value: SmartStoreSource];
  "update:coupangMode": [value: CoupangMode];
  "update:fulfillmentSize": [value: FulfillmentSize];
  "update:includeOwnStore": [value: boolean];
}>();

const showAdvanced = ref(false);

// 마켓별 브랜드 칩 활성 스타일
const smartstoreChipActive = "border-market-smartstore bg-market-smartstore text-white hover:border-market-smartstore hover:bg-market-smartstore/90 hover:text-white active:border-market-smartstore active:bg-market-smartstore/95 active:text-white";
const coupangChipActive = "border-market-coupang bg-market-coupang text-white hover:border-market-coupang hover:bg-market-coupang/90 hover:text-white active:border-market-coupang active:bg-market-coupang/95 active:text-white";

const SHIPPING_PRESETS = [
  { value: 0, label: "무료배송" },
  { value: 3000, label: "3,000원" },
  { value: 5000, label: "5,000원" },
] as const;
const SHIPPING_STEP_UNIT = 1_000;

// 가격 입력 처리 (콤마 포맷)
const priceDisplay = ref(props.price.toLocaleString("ko-KR"));

watch(() => props.price, (val) => {
  priceDisplay.value = val.toLocaleString("ko-KR");
});

function handlePriceInput(e: Event): void {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const parsed = Number.parseInt(raw, 10);
  const validated = parsePrice(parsed);
  if (validated != null) {
    emit("update:price", validated);
  }
}

function handlePriceBlur(): void {
  priceDisplay.value = props.price.toLocaleString("ko-KR");
}

const PRICE_STEP_UNIT = 10_000;

function adjustPrice(delta: number): void {
  const next = Math.max(PRICE_MIN, Math.min(PRICE_MAX, props.price + delta));
  emit("update:price", next);
}

// 배송비 입력
const shippingDisplay = ref(props.shippingFee.toLocaleString("ko-KR"));

watch(() => props.shippingFee, (val) => {
  shippingDisplay.value = val.toLocaleString("ko-KR");
});

function handleShippingInput(e: Event): void {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const parsed = Number.parseInt(raw, 10);
  const validated = parseShippingFee(parsed);
  if (validated != null) {
    emit("update:shippingFee", validated);
  }
}

function handleShippingBlur(): void {
  shippingDisplay.value = props.shippingFee.toLocaleString("ko-KR");
}

function adjustShipping(delta: number): void {
  const next = Math.max(0, props.shippingFee + delta);
  emit("update:shippingFee", next);
}

function handleOwnStoreChange(e: Event): void {
  emit("update:includeOwnStore", (e.target as HTMLInputElement).checked);
}

// 연매출 추정 → 등급 추천
const tierEstimation = computed(() => estimateTier(props.price, props.monthlyQty));

function formatRevenue(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1).replace(/\.0$/, "")}억원`;
  if (amount >= 10_000) return `${Math.floor(amount / 10_000).toLocaleString("ko-KR")}만원`;
  return `${amount.toLocaleString("ko-KR")}원`;
}

// 수수료율 퍼센트 표시 (trailing zero 제거, 최소 1자리 유지)
function fmtRate(rate: number): string {
  const pct = (rate * 100).toFixed(3).replace(/0+$/, "").replace(/\.$/, ".0");
  return `${pct}%`;
}

// 등급별 짧은 라벨
const TIER_SHORT: Record<SmartStoreTier, string> = {
  micro: "영세",
  small1: "중소1",
  small2: "중소2",
  small3: "중소3",
  normal: "일반",
};

// 카테고리별 짧은 라벨
const CAT_SHORT: Record<CategoryKey, string> = {
  clothing: "의류",
  food: "식품",
  electronics: "가전",
  living: "생활",
  beauty: "뷰티",
};

// 카테고리별 수수료 비교용 (쿠팡 힌트)
const MARKET_CAT_FEES = [
  { label: "쿠팡", fees: COUPANG.categoryFee },
  { label: "11번가", fees: ELEVENST.categoryFee },
  { label: "G마켓", fees: GMARKET.categoryFee },
] as const;

// 자사몰 PG별 등급 수수료 (세로 레이아웃용)
const TIER_KEYS: SmartStoreTier[] = ["micro", "small1", "small2", "small3", "normal"];

const ownStoreHintGroups = computed(() =>
  OWN_STORE_ORDER.map((key) => {
    const rows = TIER_KEYS.map((tier) => ({
      tier: TIER_SHORT[tier],
      rate: fmtRate(resolveOwnStoreEffectiveRate(key, tier)),
    }));

    if (key === "own_payco") {
      return {
        name: OWN_STORE_META[key].shortName,
        rows: [
          { tier: "영세", rate: rows[0]?.rate ?? "" },
          { tier: "공개 상한", rate: rows[4]?.rate ?? "" },
        ],
        note: "VAT 포함 실부담 기준 · 상세 단계는 PAYCO 문의 필요",
      };
    }

    return {
      name: OWN_STORE_META[key].shortName,
      rows,
      note: isOwnStoreVatExclusive(key) ? "VAT 포함 실부담 기준" : null,
    };
  })
);

</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <div class="flex items-center gap-2">
        <h2 class="retro-title">상품 정보 입력</h2>
        <FreshBadge />
      </div>
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- 판매가 카드 -->
        <div class="rounded-xl border border-border/60 p-3">
          <div class="space-y-1.5">
            <p class="inline-flex items-center gap-1.5 text-body font-bold text-foreground">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
              <label for="price-input">판매가</label>
            </p>
          </div>
          <div class="mt-3 space-y-2">
            <div class="flex items-stretch gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="chip"
                class="w-11 shrink-0 px-0 tabular-nums active:text-foreground"
                @click="adjustPrice(-PRICE_STEP_UNIT)"
              >
                -
              </Button>
              <div class="relative min-w-0 flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body text-muted-foreground">₩</span>
                <input
                  id="price-input"
                  type="text"
                  inputmode="numeric"
                  class="retro-input pl-7 tabular-nums text-right"
                  :value="priceDisplay"
                  @input="handlePriceInput"
                  @blur="handlePriceBlur"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="chip"
                class="w-11 shrink-0 px-0 tabular-nums active:text-foreground"
                @click="adjustPrice(PRICE_STEP_UNIT)"
              >
                +
              </Button>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              <Button
                v-for="preset in PRICE_QUICK"
                :key="preset.value"
                type="button"
                :variant="price === preset.value ? 'default' : 'outline'"
                size="chip"
                :class="[
                  'w-full justify-center px-0',
                  price === preset.value ? 'text-white hover:text-white active:text-white' : 'active:text-foreground'
                ]"
                @click="emit('update:price', preset.value)"
              >
                {{ preset.label }}
              </Button>
            </div>
          </div>
        </div>

        <!-- 카테고리 카드 -->
        <div class="rounded-xl border border-border/60 p-3">
          <div class="space-y-1.5">
            <p class="inline-flex items-center gap-1.5 text-body font-bold text-foreground">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">2</span>
              <span>카테고리</span>
            </p>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            <Button
              v-for="cat in CATEGORIES"
              :key="cat.key"
              type="button"
              :variant="category === cat.key ? 'default' : 'outline'"
              size="chip"
              :class="[
                'h-full justify-center gap-1 whitespace-nowrap px-1.5 text-center text-[11px] leading-tight',
                category === cat.key ? 'text-white hover:text-white active:text-white' : 'active:text-foreground'
              ]"
              @click="emit('update:category', cat.key)"
            >
              <span class="leading-none">{{ cat.emoji }}</span>
              <span>{{ cat.label }}</span>
            </Button>
          </div>
        </div>

        <!-- 배송비 카드 -->
        <div class="rounded-xl border border-border/60 p-3">
          <div class="space-y-1.5">
            <p class="inline-flex items-center gap-1.5 text-body font-bold text-foreground">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">3</span>
              <label for="shipping-input">배송비</label>
            </p>
          </div>
          <div class="mt-3 space-y-2">
            <div class="flex items-stretch gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="chip"
                class="w-11 shrink-0 px-0 tabular-nums active:text-foreground"
                @click="adjustShipping(-SHIPPING_STEP_UNIT)"
              >
                -
              </Button>
              <div class="relative min-w-0 flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body text-muted-foreground">₩</span>
                <input
                  id="shipping-input"
                  type="text"
                  inputmode="numeric"
                  class="retro-input pl-7 tabular-nums text-right"
                  :value="shippingDisplay"
                  @input="handleShippingInput"
                  @blur="handleShippingBlur"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="chip"
                class="w-11 shrink-0 px-0 tabular-nums active:text-foreground"
                @click="adjustShipping(SHIPPING_STEP_UNIT)"
              >
                +
              </Button>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="sp in SHIPPING_PRESETS"
                :key="sp.value"
                type="button"
                :variant="shippingFee === sp.value ? 'default' : 'outline'"
                size="chip"
                :class="[
                  'min-w-[4.5rem] flex-1 justify-center',
                  shippingFee === sp.value ? 'text-white hover:text-white active:text-white' : 'active:text-foreground'
                ]"
                @click="emit('update:shippingFee', sp.value)"
              >
                {{ sp.label }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 상세 설정 (접힌 상태) -->
      <details class="retro-details" :open="showAdvanced || undefined">
        <summary class="retro-details-summary" @click.prevent="showAdvanced = !showAdvanced">
          <div class="flex flex-col items-start gap-0.5">
            <span>고급 마켓 조건 설정</span>
            <span v-if="!showAdvanced" class="text-tiny text-muted-foreground">
              {{ SMARTSTORE_TIER_LABELS[smartstoreTier] }} · {{ SMARTSTORE_SOURCE_LABELS[smartstoreSource] }} · {{ COUPANG_MODE_LABELS[coupangMode] }}
            </span>
          </div>
          <ChevronDown class="retro-details-chevron" :class="{ 'rotate-180': showAdvanced }" />
        </summary>
        <div v-if="showAdvanced" class="px-3 pb-3 pt-1 space-y-2">
          <!-- 매출등급 -->
          <div>
            <label class="flex items-center gap-1 text-caption font-semibold text-foreground">
              매출등급
              <CompareHint extraWide>
                <div class="space-y-2.5">
                  <!-- 스마트스토어 주문관리 수수료 -->
                  <div>
                    <p class="font-semibold text-foreground mb-1">주문관리 수수료</p>
                    <p class="text-[9px] text-muted-foreground mb-1">VAT 포함 · 상품가+배송비</p>
                    <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                      <span
                        v-for="(_, tier) in SMARTSTORE_TIER_LABELS"
                        :key="tier"
                        class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
                        :class="tier === smartstoreTier ? 'bg-primary/15 ring-1 ring-primary/30 text-primary font-semibold' : 'bg-muted/60'"
                      >
                        <span :class="tier !== smartstoreTier ? 'text-muted-foreground' : ''">{{ TIER_SHORT[tier as SmartStoreTier] }}</span>
                        <span class="font-semibold">{{ fmtRate(SMARTSTORE.orderFee[tier as SmartStoreTier]) }}</span>
                      </span>
                    </div>
                  </div>

                  <hr class="border-border/40" />

                  <!-- PG사별 등급 수수료 -->
                  <div>
                    <p class="font-semibold text-foreground mb-1">PG사별 카드 수수료</p>
                    <div v-for="group in ownStoreHintGroups" :key="`tier-${group.name}`" class="mt-1.5">
                      <p class="text-[10px] font-semibold text-foreground mb-1">{{ group.name }}</p>
                      <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                        <span v-for="row in group.rows" :key="row.tier" class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5">
                          <span class="text-muted-foreground">{{ row.tier }}</span>
                          <span class="font-semibold">{{ row.rate }}</span>
                        </span>
                      </div>
                      <p v-if="group.note" class="mt-1 text-[9px] text-muted-foreground">{{ group.note }}</p>
                    </div>
                  </div>
                </div>
              </CompareHint>
            </label>
            <p class="text-tiny text-muted-foreground -mt-1 mb-1.5">
              <span>&middot; 스마트스토어·PG 수수료에 공통 적용됩니다</span>
              <br />
              <span>&middot; 추정 연매출 {{ formatRevenue(tierEstimation.estimatedRevenue) }} ({{ props.price.toLocaleString("ko-KR") }}원 &times; {{ props.monthlyQty }}건 &times; 12개월)</span>
            </p>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="(label, key) in SMARTSTORE_TIER_LABELS"
                :key="key"
                type="button"
                variant="outline"
                size="chip"
                :class="smartstoreTier === key ? smartstoreChipActive : ''"
                class="relative"
                @click="emit('update:smartstoreTier', key as SmartStoreTier)"
              >
                {{ label }}
                <span
                  v-if="key === tierEstimation.recommendedTier"
                  class="ml-1 inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-bold"
                  :class="smartstoreTier === key
                    ? 'bg-white/90 text-market-smartstore'
                    : 'bg-market-smartstore text-white'"
                >
                  추천
                </span>
              </Button>
            </div>
          </div>

          <!-- 스마트스토어 유입 경로 -->
          <div>
            <label class="block text-caption font-semibold text-foreground mb-1">
              스마트스토어 유입 경로
            </label>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="(label, key) in SMARTSTORE_SOURCE_LABELS"
                :key="key"
                type="button"
                variant="outline"
                size="chip"
                :class="smartstoreSource === key ? smartstoreChipActive : ''"
                @click="emit('update:smartstoreSource', key as SmartStoreSource)"
              >
                {{ label }}
              </Button>
            </div>
          </div>

          <!-- 쿠팡 판매 방식 -->
          <div>
            <label class="flex items-center gap-1 text-caption font-semibold text-foreground mb-1">
              쿠팡 판매 방식
              <CompareHint>
                <div class="space-y-2">
                  <p class="font-semibold text-foreground">카테고리별 판매 수수료</p>
                  <div v-for="market in MARKET_CAT_FEES" :key="market.label" class="space-y-0.5">
                    <p class="text-[10px] font-medium text-muted-foreground">{{ market.label }}</p>
                    <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                      <span
                        v-for="(label, key) in CAT_SHORT"
                        :key="`${market.label}-${key}`"
                        class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
                        :class="key === category ? 'bg-primary/15 ring-1 ring-primary/30 text-primary font-semibold' : 'bg-muted/60'"
                      >
                        <span :class="key !== category ? 'text-muted-foreground' : ''">{{ label }}</span>
                        <span class="font-semibold">{{ fmtRate(market.fees[key as CategoryKey]) }}</span>
                      </span>
                    </div>
                  </div>
                  <p class="text-[9px] text-muted-foreground">
                    배송비 수수료: 공통 <strong class="text-foreground">3.3%</strong> (유료배송 시)
                  </p>
                </div>
              </CompareHint>
            </label>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="(label, key) in COUPANG_MODE_LABELS"
                :key="key"
                type="button"
                variant="outline"
                size="chip"
                :class="coupangMode === key ? coupangChipActive : ''"
                @click="emit('update:coupangMode', key as CoupangMode)"
              >
                {{ label }}
              </Button>
            </div>
          </div>

          <!-- 로켓그로스 물류 크기 (쿠팡 로켓그로스 선택 시) -->
          <div v-if="coupangMode === 'rocketGrowth'">
            <label class="block text-caption font-semibold text-foreground mb-1">
              로켓그로스 물류 크기
            </label>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="(label, key) in FULFILLMENT_SIZE_LABELS"
                :key="key"
                type="button"
                variant="outline"
                size="chip"
                :class="fulfillmentSize === key ? coupangChipActive : ''"
                @click="emit('update:fulfillmentSize', key as FulfillmentSize)"
              >
                {{ label }}
              </Button>
            </div>
          </div>

        </div>
      </details>

      <!-- 자사몰(PG) 비교 토글 -->
      <label
        class="group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all"
        :class="includeOwnStore
          ? 'border-primary/40 bg-primary/5'
          : 'border-border/60 bg-background/70 hover:border-border'"
      >
        <input
          type="checkbox"
          class="sr-only"
          :checked="includeOwnStore"
          @change="handleOwnStoreChange"
        />
        <span
          class="relative mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
          :class="includeOwnStore ? 'bg-primary' : 'bg-border'"
        >
          <span
            class="absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="includeOwnStore ? 'translate-x-[18px]' : 'translate-x-[3px]'"
          />
        </span>
        <div class="min-w-0 flex-1">
          <span class="inline-flex items-center gap-1 text-body font-semibold text-foreground">
            자사몰(PG) 수수료 함께 비교
            <CompareHint compact>
              <div class="space-y-2">
                <p class="font-semibold text-foreground">PG사별 등급 수수료</p>
                <div v-for="group in ownStoreHintGroups" :key="group.name" class="mt-1.5">
                  <p class="text-[10px] font-semibold text-foreground mb-1">{{ group.name }}</p>
                  <div class="flex flex-wrap gap-1 text-[10px] tabular-nums">
                    <span v-for="row in group.rows" :key="row.tier" class="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5">
                      <span class="text-muted-foreground">{{ row.tier }}</span>
                      <span class="font-semibold">{{ row.rate }}</span>
                    </span>
                  </div>
                  <p v-if="group.note" class="mt-1 text-[9px] text-muted-foreground">{{ group.note }}</p>
                </div>
                <p class="text-[9px] text-muted-foreground">
                  비교 결과는 <strong class="text-foreground">선택한 매출등급 기준</strong>으로 계산됩니다
                </p>
              </div>
            </CompareHint>
          </span>
          <span class="text-tiny text-muted-foreground">&middot; 선택한 매출등급 · VAT 포함 실부담 기준으로 비교합니다</span>
          <div class="mt-1.5 flex flex-wrap gap-1">
            <span
              v-for="key in OWN_STORE_ORDER"
              :key="key"
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="key === 'own_kakaopay' ? 'text-[#3B1E00]' : 'text-white'"
              :style="{ backgroundColor: OWN_STORE_META[key].color }"
            >
              {{ OWN_STORE_META[key].shortName }}
            </span>
          </div>
        </div>
      </label>

    </div>
  </div>
</template>
