<script setup lang="ts">
import { ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { CATEGORIES } from "@/data/categories";
import {
  SMARTSTORE_TIER_LABELS,
  SMARTSTORE_SOURCE_LABELS,
  COUPANG_MODE_LABELS,
  FULFILLMENT_SIZE_LABELS,
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
}>();

const emit = defineEmits<{
  "update:price": [value: number];
  "update:shippingFee": [value: number];
  "update:category": [value: CategoryKey];
  "update:smartstoreTier": [value: SmartStoreTier];
  "update:smartstoreSource": [value: SmartStoreSource];
  "update:coupangMode": [value: CoupangMode];
  "update:fulfillmentSize": [value: FulfillmentSize];
}>();

const showAdvanced = ref(false);

const SHIPPING_PRESETS = [
  { value: 0, label: "무료배송" },
  { value: 3000, label: "3,000원" },
  { value: 5000, label: "5,000원" },
] as const;

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

const PRICE_STEPS = [
  { delta: -10_000, label: "-1만" },
  { delta: -1_000, label: "-1천" },
  { delta: 1_000, label: "+1천" },
  { delta: 10_000, label: "+1만" },
] as const;

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

</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">내 상품 수수료 한눈에 비교하기</h2>
      <FreshBadge />
    </div>

    <div class="retro-panel-content space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- 판매가 카드 -->
        <div class="rounded-xl border border-border/60 overflow-hidden">
          <div class="bg-muted/40 px-3 py-2">
            <span class="text-caption font-bold text-foreground">판매가</span>
          </div>
          <div class="p-3 space-y-2">
            <div class="relative">
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
            <div class="flex gap-1">
              <button
                v-for="step in PRICE_STEPS"
                :key="step.delta"
                type="button"
                :class="[
                  'flex-1 rounded-lg border px-1 py-1.5 text-tiny font-semibold tabular-nums transition-colors',
                  step.delta < 0
                    ? 'border-border bg-background text-muted-foreground hover:border-fee/40 hover:text-fee'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary'
                ]"
                @click="adjustPrice(step.delta)"
              >
                {{ step.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 카테고리 카드 -->
        <div class="rounded-xl border border-border/60 overflow-hidden">
          <div class="bg-muted/40 px-3 py-2">
            <span class="text-caption font-bold text-foreground">카테고리</span>
          </div>
          <div class="p-2 grid grid-cols-2 gap-1.5">
            <button
              v-for="cat in CATEGORIES"
              :key="cat.key"
              type="button"
              :class="[
                'touch-target rounded-lg border px-2.5 py-2 text-left text-caption font-semibold transition-colors',
                category === cat.key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              ]"
              @click="emit('update:category', cat.key)"
            >
              {{ cat.emoji }} {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- 배송비 카드 -->
        <div class="rounded-xl border border-border/60 overflow-hidden">
          <div class="bg-muted/40 px-3 py-2">
            <span class="text-caption font-bold text-foreground">배송비</span>
          </div>
          <div class="p-3 space-y-2">
            <div class="relative">
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
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="sp in SHIPPING_PRESETS"
                :key="sp.value"
                type="button"
                :class="[
                  'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                  shippingFee === sp.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                ]"
                @click="emit('update:shippingFee', sp.value)"
              >
                {{ sp.label }}
              </button>
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
              <button
                v-for="(label, key) in SMARTSTORE_TIER_LABELS"
                :key="key"
                type="button"
                :class="[
                  'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                  smartstoreTier === key
                    ? 'border-market-smartstore bg-market-smartstore text-white'
                    : 'border-border text-muted-foreground hover:text-foreground'
                ]"
                @click="emit('update:smartstoreTier', key as SmartStoreTier)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- 스마트스토어 유입 경로 -->
          <div>
            <label class="block text-caption font-semibold text-foreground mb-1.5">
              스마트스토어 유입 경로
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(label, key) in SMARTSTORE_SOURCE_LABELS"
                :key="key"
                type="button"
                :class="[
                  'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                  smartstoreSource === key
                    ? 'border-market-smartstore bg-market-smartstore text-white'
                    : 'border-border text-muted-foreground hover:text-foreground'
                ]"
                @click="emit('update:smartstoreSource', key as SmartStoreSource)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- 쿠팡 판매 방식 -->
          <div>
            <label class="block text-caption font-semibold text-foreground mb-1.5">
              쿠팡 판매 방식
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(label, key) in COUPANG_MODE_LABELS"
                :key="key"
                type="button"
                :class="[
                  'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                  coupangMode === key
                    ? 'border-market-coupang bg-market-coupang text-white'
                    : 'border-border text-muted-foreground hover:text-foreground'
                ]"
                @click="emit('update:coupangMode', key as CoupangMode)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- 로켓그로스 물류 크기 (쿠팡 로켓그로스 선택 시) -->
          <div v-if="coupangMode === 'rocketGrowth'">
            <label class="block text-caption font-semibold text-foreground mb-1.5">
              로켓그로스 물류 크기
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(label, key) in FULFILLMENT_SIZE_LABELS"
                :key="key"
                type="button"
                :class="[
                  'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                  fulfillmentSize === key
                    ? 'border-market-coupang bg-market-coupang text-white'
                    : 'border-border text-muted-foreground hover:text-foreground'
                ]"
                @click="emit('update:fulfillmentSize', key as FulfillmentSize)"
              >
                {{ label }}
              </button>
            </div>
          </div>
        </div>
      </details>

    </div>
  </div>
</template>
