<script setup lang="ts">
import { ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { CATEGORIES, type CategoryInfo } from "@/data/categories";
import { PRICE_PRESETS, QTY_PRESETS } from "@/data/pricePresets";
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
import { parsePrice, parseShippingFee, parseMonthlyQty } from "@/lib/validators";

const props = defineProps<{
  price: number;
  shippingFee: number;
  category: CategoryKey;
  smartstoreTier: SmartStoreTier;
  smartstoreSource: SmartStoreSource;
  coupangMode: CoupangMode;
  fulfillmentSize: FulfillmentSize;
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
  "update:monthlyQty": [value: number];
}>();

const showAdvanced = ref(false);
const showMonthly = ref(false);

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

// 월 판매건수 입력
const qtyDisplay = ref(String(props.monthlyQty));

watch(() => props.monthlyQty, (val) => {
  qtyDisplay.value = String(val);
});

function handleQtyInput(e: Event): void {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  const parsed = Number.parseInt(raw, 10);
  const validated = parseMonthlyQty(parsed);
  if (validated != null) {
    emit("update:monthlyQty", validated);
  }
}
</script>

<template>
  <div class="retro-panel">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 class="retro-title">내 상품 수수료 한눈에 비교하기</h2>
      <FreshBadge />
    </div>

    <div class="retro-panel-content space-y-4">
      <!-- 판매가 입력 -->
      <div>
        <label for="price-input" class="block text-caption font-semibold text-foreground mb-1.5">
          판매가
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
              price === preset.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
            ]"
            @click="emit('update:price', preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- 카테고리 선택 -->
      <div>
        <label class="block text-caption font-semibold text-foreground mb-1.5">
          카테고리
        </label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
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

      <!-- 배송비 -->
      <div>
        <label for="shipping-input" class="block text-caption font-semibold text-foreground mb-1.5">
          배송비 (유료배송 기준)
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
      </div>

      <!-- 상세 설정 (접힌 상태) -->
      <details class="retro-details" :open="showAdvanced || undefined">
        <summary class="retro-details-summary" @click.prevent="showAdvanced = !showAdvanced">
          <span>상세 설정</span>
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
                  smartstoreTier === key
                    ? 'bg-[#03C75A] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-[#03C75A]/10 hover:text-[#03C75A]'
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
                  smartstoreSource === key
                    ? 'bg-[#03C75A] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-[#03C75A]/10 hover:text-[#03C75A]'
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
                  coupangMode === key
                    ? 'bg-[#E31937] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-[#E31937]/10 hover:text-[#E31937]'
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
                  fulfillmentSize === key
                    ? 'bg-[#E31937] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-[#E31937]/10 hover:text-[#E31937]'
                ]"
                @click="emit('update:fulfillmentSize', key as FulfillmentSize)"
              >
                {{ label }}
              </button>
            </div>
          </div>
        </div>
      </details>

      <!-- 월간 시뮬레이션 (접힌 상태) -->
      <details class="retro-details" :open="showMonthly || undefined">
        <summary class="retro-details-summary" @click.prevent="showMonthly = !showMonthly">
          <span>월간 시뮬레이션</span>
          <ChevronDown class="retro-details-chevron" :class="{ 'rotate-180': showMonthly }" />
        </summary>
        <div v-if="showMonthly" class="p-3 space-y-3">
          <div>
            <label for="qty-input" class="block text-caption font-semibold text-foreground mb-1.5">
              월 예상 판매 건수
            </label>
            <div class="relative">
              <input
                id="qty-input"
                type="text"
                inputmode="numeric"
                class="retro-input tabular-nums text-right pr-8"
                :value="qtyDisplay"
                @input="handleQtyInput"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-body text-muted-foreground">건</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="preset in QTY_PRESETS"
                :key="preset.value"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200',
                  monthlyQty === preset.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                ]"
                @click="emit('update:monthlyQty', preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>
