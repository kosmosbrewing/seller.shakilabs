<script setup lang="ts">
import { ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
const PRICE_QUICK = [
  { value: 10_000, label: "1만" },
  { value: 30_000, label: "3만" },
  { value: 50_000, label: "5만" },
  { value: 100_000, label: "10만" },
] as const;
import {
  SMARTSTORE_TIER_LABELS,
  SMARTSTORE_SOURCE_LABELS,
  COUPANG_MODE_LABELS,
  FULFILLMENT_SIZE_LABELS,
  OWN_STORE_META,
  OWN_STORE_ORDER,
  type SmartStoreTier,
  type SmartStoreSource,
  type CoupangMode,
  type FulfillmentSize,
  type CategoryKey,
} from "@/data/marketFees";
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

</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar flex-col items-start gap-2 rounded-t-2xl sm:flex-row sm:items-center sm:gap-3">
      <h2 class="retro-title">상품 정보 입력</h2>
      <FreshBadge />
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
        <div v-if="showAdvanced" class="p-3 space-y-3">
          <!-- 스마트스토어 매출등급 -->
          <div>
            <label class="block text-caption font-semibold text-foreground mb-1.5">
              스마트스토어 매출 등급
            </label>
            <div class="flex flex-wrap gap-1.5">
              <Button
                v-for="(label, key) in SMARTSTORE_TIER_LABELS"
                :key="key"
                type="button"
                variant="outline"
                size="chip"
                :class="smartstoreTier === key ? smartstoreChipActive : ''"
                @click="emit('update:smartstoreTier', key as SmartStoreTier)"
              >
                {{ label }}
              </Button>
            </div>
          </div>

          <!-- 스마트스토어 유입 경로 -->
          <div>
            <label class="block text-caption font-semibold text-foreground mb-1.5">
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
            <label class="block text-caption font-semibold text-foreground mb-1.5">
              쿠팡 판매 방식
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
            <label class="block text-caption font-semibold text-foreground mb-1.5">
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
              <span class="text-body font-semibold text-foreground">자사몰(PG) 수수료 함께 비교</span>
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
      </details>

    </div>
  </div>
</template>
