<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { CATEGORIES } from "@/data/categories";
import { PRICE_PRESETS } from "@/data/pricePresets";
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
import { parsePrice, parseShippingFee } from "@/lib/validators";

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
const selectedCategory = computed(() =>
  CATEGORIES.find((item) => item.key === props.category)
);
const selectedPricePreset = computed(() =>
  PRICE_PRESETS.find((item) => item.value === props.price)
);

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
      <p class="text-caption text-muted-foreground">
        기본값 3개(판매가/카테고리/배송비)만 입력해도 바로 비교됩니다. 고급 설정은 필요할 때만 펼쳐보세요.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div class="retro-step">
          <span class="retro-step-index">1</span>
          <span class="text-caption font-semibold text-foreground">판매가 입력</span>
        </div>
        <div class="retro-step">
          <span class="retro-step-index">2</span>
          <span class="text-caption font-semibold text-foreground">카테고리 선택</span>
        </div>
        <div class="retro-step">
          <span class="retro-step-index">3</span>
          <span class="text-caption font-semibold text-foreground">배송비 입력</span>
        </div>
      </div>

      <div class="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
        <div class="rounded-xl border border-border/60 bg-background/35 p-3 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-caption font-bold text-foreground">필수 입력값</p>
            <span class="text-tiny text-muted-foreground">변경 즉시 반영</span>
          </div>

          <div>
            <label for="price-input" class="block text-caption font-semibold text-foreground mb-1.5">
              1. 판매가
            </label>
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
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="preset in PRICE_PRESETS"
                :key="preset.value"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  'touch-target',
                  price === preset.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                ]"
                @click="emit('update:price', preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
            <p class="mt-1 text-tiny text-muted-foreground">권장 범위 100원 ~ 1억원</p>
          </div>

          <div>
            <label class="block text-caption font-semibold text-foreground mb-1.5">
              2. 카테고리
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="cat in CATEGORIES"
                :key="cat.key"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  'touch-target',
                  category === cat.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                ]"
                @click="emit('update:category', cat.key)"
              >
                {{ cat.emoji }} {{ cat.label }}
              </button>
            </div>
          </div>

          <div>
            <label for="shipping-input" class="block text-caption font-semibold text-foreground mb-1.5">
              3. 배송비 (유료배송 기준)
            </label>
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
            <p class="mt-1 text-tiny text-muted-foreground">무료배송이면 0원으로 두세요</p>
          </div>
        </div>

        <aside class="retro-panel-muted p-3.5">
          <p class="text-caption font-bold text-foreground">현재 입력 요약</p>
          <div class="mt-3 space-y-2">
            <div class="flex items-center justify-between text-caption">
              <span class="text-muted-foreground">판매가</span>
              <strong class="tabular-nums text-foreground">₩{{ priceDisplay }}</strong>
            </div>
            <div class="flex items-center justify-between text-caption">
              <span class="text-muted-foreground">카테고리</span>
              <strong class="text-foreground">
                {{ selectedCategory?.emoji }} {{ selectedCategory?.label }}
              </strong>
            </div>
            <div class="flex items-center justify-between text-caption">
              <span class="text-muted-foreground">배송비</span>
              <strong class="tabular-nums text-foreground">₩{{ shippingDisplay }}</strong>
            </div>
          </div>
          <div class="mt-3 rounded-lg border border-border/60 bg-background/55 px-2.5 py-2 text-tiny text-muted-foreground">
            {{ selectedPricePreset?.label ?? "사용자 지정 가격" }} 기준으로 결과가 즉시 갱신됩니다.
          </div>
        </aside>
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
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  'touch-target',
                  smartstoreTier === key
                    ? 'bg-market-smartstore text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-market-smartstore/10 hover:text-market-smartstore'
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
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  'touch-target',
                  smartstoreSource === key
                    ? 'bg-market-smartstore text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-market-smartstore/10 hover:text-market-smartstore'
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
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  'touch-target',
                  coupangMode === key
                    ? 'bg-market-coupang text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-market-coupang/10 hover:text-market-coupang'
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
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  'touch-target',
                  fulfillmentSize === key
                    ? 'bg-market-coupang text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-market-coupang/10 hover:text-market-coupang'
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
