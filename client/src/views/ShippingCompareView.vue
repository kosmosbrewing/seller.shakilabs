<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { BadgeCheck, Package2, Truck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import {
  REMOTE_AREA_GUIDE,
  SHIPPING_DATA_UPDATED,
  SHIPPING_SIZE_LABELS,
  SHIPPING_SIZE_ORDER,
  SHIPPING_WEIGHT_PRESETS,
  SHIPPING_CARRIERS,
  estimateShippingRates,
  parseShippingSumCm,
  parseShippingWeight,
  resolveShippingSize,
  type ShippingSizeKey,
} from "@/data/shippingRates";
import { formatNumber, formatWon } from "@/lib/utils";

const seoTitle = "택배비 비교 계산기 | 8개 택배사 예상 운임 비교";
const seoDescription =
  "CJ대한통운, 한진, 로젠, 우체국, 경동, 롯데, CU, GS25의 예상 택배비를 무게와 크기 기준으로 비교합니다.";

const weightKg = ref(3);
const selectedSize = ref<ShippingSizeKey>("medium");
const sumCm = ref<number | null>(100);

const weightDisplay = ref(String(weightKg.value));
const sumDisplay = ref(sumCm.value != null ? String(sumCm.value) : "");

watch(weightKg, (value) => {
  weightDisplay.value = String(value);
});

watch(sumCm, (value) => {
  sumDisplay.value = value != null ? String(value) : "";
});

const resolvedSize = computed<ShippingSizeKey>(() => resolveShippingSize(sumCm.value) ?? selectedSize.value);
const resolvedSizeLabel = computed(() => SHIPPING_SIZE_LABELS[resolvedSize.value]);
const carrierMap = computed(
  () => new Map(SHIPPING_CARRIERS.map((carrier) => [carrier.key, carrier]))
);

const allResults = computed(() =>
  estimateShippingRates({
    weightKg: weightKg.value,
    size: selectedSize.value,
    sumCm: sumCm.value,
  })
);

const generalResults = computed(() => allResults.value.filter((item) => item.carrier.category === "general"));
const convenienceResults = computed(() => allResults.value.filter((item) => item.carrier.category === "convenience"));
const cheapestOverall = computed(() => allResults.value.find((item) => item.isAvailable) ?? null);
const cheapestGeneral = computed(() => generalResults.value.find((item) => item.isAvailable) ?? null);
const cheapestConvenience = computed(() => convenienceResults.value.find((item) => item.isAvailable) ?? null);

function handleWeightInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(raw);
  const validated = parseShippingWeight(parsed);
  if (validated != null) {
    weightKg.value = validated;
  }
}

function handleWeightBlur(): void {
  weightDisplay.value = String(weightKg.value);
}

function handleSumInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/[^0-9]/g, "");
  if (!raw) {
    sumCm.value = null;
    return;
  }

  const parsed = Number.parseInt(raw, 10);
  const validated = parseShippingSumCm(parsed);
  if (validated != null) {
    sumCm.value = validated;
  }
}

function handleSumBlur(): void {
  sumDisplay.value = sumCm.value != null ? String(sumCm.value) : "";
}

function selectSize(size: ShippingSizeKey): void {
  selectedSize.value = size;
  sumCm.value = null;
}
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">택배비 비교</h1>
        <FreshBadge :message="`${SHIPPING_DATA_UPDATED} 공개 운임 기준 추정`" />
      </div>

      <div class="retro-panel-content space-y-5">
        <div class="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-start">
          <div class="space-y-3">
            <p class="text-body text-muted-foreground">
              상품 무게와 크기에 따라 일반 택배 6사와 편의점 택배 2개의 예상 운임을 비교합니다.
              실제 계약 단가와 지역 할증은 제외한 공개 운임 기준 추정이므로, 최종 발송 전에는 계약 요율을 다시 확인해야 합니다.
            </p>
            <div class="rounded-[1.5rem] border border-primary/20 bg-primary/10 px-4 py-3.5">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80">현재 조건 기준</p>
              <p class="mt-1.5 text-body font-bold text-foreground">
                {{ formatNumber(weightKg) }}kg · {{ resolvedSizeLabel }}
                <span v-if="sumCm != null" class="text-muted-foreground">(3변 합 {{ sumCm }}cm)</span>
              </p>
              <p class="mt-1 text-caption text-muted-foreground">
                가장 저렴한 옵션은
                <span class="font-bold text-foreground">{{ cheapestOverall?.carrier.name ?? "계산 불가" }}</span>
                입니다.
              </p>
              <p class="mt-1 text-caption text-muted-foreground">
                일반 비교는 별도 입력이 없으므로 <span class="font-bold text-foreground">동일권 기준 최소 공개 운임</span>을 우선 사용합니다.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">비교 대상</p>
              <p class="mt-1.5 text-body font-bold text-foreground">8개 택배사</p>
            </div>
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">입력값</p>
              <p class="mt-1.5 text-body font-bold text-foreground">무게 + 크기</p>
            </div>
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">출력값</p>
              <p class="mt-1.5 text-body font-bold text-foreground">기본운임 + 추가요금</p>
            </div>
            <div class="rounded-[1.35rem] bg-muted/25 px-3.5 py-3">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">주의</p>
              <p class="mt-1.5 text-body font-bold text-foreground">지역·계약단가 제외</p>
            </div>
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div class="rounded-2xl border border-border/60 overflow-hidden">
            <div class="bg-muted/40 px-4 py-3">
              <span class="text-caption font-bold text-foreground">무게 입력</span>
            </div>
            <div class="space-y-3 p-4">
              <div class="relative max-w-[11rem]">
                <input
                  type="text"
                  inputmode="decimal"
                  class="retro-input pr-10 text-right tabular-nums"
                  :value="weightDisplay"
                  @input="handleWeightInput"
                  @blur="handleWeightBlur"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">kg</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="preset in SHIPPING_WEIGHT_PRESETS"
                  :key="preset"
                  type="button"
                  :class="[
                    'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                    weightKg === preset
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  ]"
                  @click="weightKg = preset"
                >
                  {{ preset }}kg
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-border/60 overflow-hidden">
            <div class="bg-muted/40 px-4 py-3">
              <span class="text-caption font-bold text-foreground">크기 입력</span>
            </div>
            <div class="space-y-3 p-4">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="sizeKey in SHIPPING_SIZE_ORDER"
                  :key="sizeKey"
                  type="button"
                  :class="[
                    'touch-target rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors',
                    sumCm == null && selectedSize === sizeKey
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  ]"
                  @click="selectSize(sizeKey)"
                >
                  {{ SHIPPING_SIZE_LABELS[sizeKey] }}
                </button>
              </div>
              <div class="space-y-2">
                <label class="block text-caption font-semibold text-foreground">또는 3변 합 입력</label>
                <div class="relative max-w-[11rem]">
                  <input
                    type="text"
                    inputmode="numeric"
                    class="retro-input pr-12 text-right tabular-nums"
                    :value="sumDisplay"
                    placeholder="예: 100"
                    @input="handleSumInput"
                    @blur="handleSumBlur"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">cm</span>
                </div>
                <p class="text-caption text-muted-foreground">
                  입력 시 자동으로 <span class="font-bold text-foreground">{{ resolvedSizeLabel }}</span> 구간을 적용합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="space-y-3">
      <div>
        <span class="section-eyebrow">Section A</span>
        <h2 class="section-title">일반 택배 6사 비교</h2>
        <p class="section-description">
          일반 택배는 부피와 중량에 따라 운임 차이가 커집니다. 같은 조건에서 가장 유리한 택배사를 먼저 확인하세요.
        </p>
      </div>

      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div class="flex items-center gap-2">
            <Truck class="h-4.5 w-4.5" />
            <span class="retro-title">일반 택배 예상 운임</span>
          </div>
          <span v-if="cheapestGeneral" class="inline-flex items-center gap-1 rounded-full bg-profit px-2.5 py-1 text-caption font-semibold text-white">
            <BadgeCheck class="h-3.5 w-3.5" />
            최저가 {{ cheapestGeneral.carrier.shortName }}
          </span>
        </div>
        <div class="overflow-x-auto px-4 pb-4 pt-4">
          <table class="min-w-[920px] w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">택배사</th>
                <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">기본운임</th>
                <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">무게추가 요금</th>
                <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">예상 총 운임</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">제한사항</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="result in generalResults"
                :key="result.carrier.key"
                class="border-b border-border/40"
                :class="cheapestGeneral?.carrier.key === result.carrier.key ? 'bg-profit/5' : ''"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold text-white"
                      :style="{ backgroundColor: result.carrier.color }"
                    >
                      {{ result.carrier.shortName }}
                    </span>
                    <div>
                      <p class="font-semibold text-foreground">{{ result.carrier.name }}</p>
                      <p class="text-tiny text-muted-foreground">
                        {{ result.carrier.estimateNote }} · {{ result.effectiveSizeLabel }} 구간
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {{ result.isAvailable ? formatWon(result.baseFare) : '-' }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-fee">
                  {{ result.isAvailable ? formatWon(result.weightSurcharge) : '-' }}
                </td>
                <td class="px-4 py-3 text-right font-bold tabular-nums" :class="cheapestGeneral?.carrier.key === result.carrier.key ? 'text-profit' : 'text-foreground'">
                  {{ result.isAvailable ? formatWon(result.totalFare) : '접수 불가' }}
                </td>
                <td class="px-4 py-3 text-caption text-muted-foreground">
                  <p>{{ result.restrictionText }}</p>
                  <p v-if="result.unavailableReason" class="mt-1 font-semibold text-fee">{{ result.unavailableReason }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <div>
        <span class="section-eyebrow">Section B</span>
        <h2 class="section-title">편의점 택배 2종 비교</h2>
        <p class="section-description">
          소형 발송은 편의점 택배가 간단하지만, 중량과 부피 제한을 먼저 확인해야 합니다.
        </p>
      </div>

      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div class="flex items-center gap-2">
            <Package2 class="h-4.5 w-4.5" />
            <span class="retro-title">편의점 택배 예상 운임</span>
          </div>
          <span v-if="cheapestConvenience" class="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-caption font-semibold text-primary-foreground">
            <BadgeCheck class="h-3.5 w-3.5" />
            최저가 {{ cheapestConvenience.carrier.shortName }}
          </span>
        </div>
        <div class="overflow-x-auto px-4 pb-4 pt-4">
          <table class="min-w-[920px] w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">택배사</th>
                <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">기본운임</th>
                <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">무게추가 요금</th>
                <th class="px-4 py-3 text-right text-caption font-semibold text-muted-foreground">예상 총 운임</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">제한사항</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="result in convenienceResults"
                :key="result.carrier.key"
                class="border-b border-border/40"
                :class="cheapestConvenience?.carrier.key === result.carrier.key ? 'bg-primary/5' : ''"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold text-white"
                      :style="{ backgroundColor: result.carrier.color }"
                    >
                      {{ result.carrier.shortName }}
                    </span>
                    <div>
                      <p class="font-semibold text-foreground">{{ result.carrier.name }}</p>
                      <p class="text-tiny text-muted-foreground">
                        {{ result.carrier.estimateNote }} · {{ result.effectiveSizeLabel }} 구간
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {{ result.isAvailable ? formatWon(result.baseFare) : '-' }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-fee">
                  {{ result.isAvailable ? formatWon(result.weightSurcharge) : '-' }}
                </td>
                <td class="px-4 py-3 text-right font-bold tabular-nums" :class="cheapestConvenience?.carrier.key === result.carrier.key ? 'text-primary' : 'text-foreground'">
                  {{ result.isAvailable ? formatWon(result.totalFare) : '접수 불가' }}
                </td>
                <td class="px-4 py-3 text-caption text-muted-foreground">
                  <p>{{ result.restrictionText }}</p>
                  <p v-if="result.unavailableReason" class="mt-1 font-semibold text-fee">{{ result.unavailableReason }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <div>
        <span class="section-eyebrow">Section C</span>
        <h2 class="section-title">도서산간 참고표</h2>
        <p class="section-description">
          도서산간 추가운임은 실제 발송비를 크게 바꿉니다. 아래 표는 택배사별 제주/도서산간 추가 여부를 빠르게 확인하기 위한 정보성 정리입니다.
        </p>
      </div>

      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <span class="retro-title">지역 추가운임 안내</span>
        </div>
        <div class="overflow-x-auto px-4 pb-4 pt-4">
          <table class="min-w-[920px] w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">택배사</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">제주 추가</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">도서산간 추가</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">기준 메모</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in REMOTE_AREA_GUIDE"
                :key="row.carrierKey"
                class="border-b border-border/40"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold text-white"
                      :style="{ backgroundColor: carrierMap.get(row.carrierKey)?.color || '#64748B' }"
                    >
                      {{ carrierMap.get(row.carrierKey)?.shortName || row.carrierKey }}
                    </span>
                    <span class="font-semibold text-foreground">
                      {{ carrierMap.get(row.carrierKey)?.name || row.carrierKey }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-caption font-semibold text-foreground">{{ row.jejuCharge }}</td>
                <td class="px-4 py-3 text-caption font-semibold text-foreground">{{ row.remoteCharge }}</td>
                <td class="px-4 py-3 text-caption text-muted-foreground">{{ row.criteriaNote }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div class="rounded-[1.4rem] border border-border/70 bg-muted/20 px-4 py-3.5 text-caption text-muted-foreground">
      동일권 기준 공개 운임을 우선 사용했고, 타권/제주/도서산간/계약 단가/냉장·냉동/방문 수거 할인 등은 반영하지 않았습니다.
      공개 운임표가 직접 노출되지 않는 일부 택배사는 보수적 추정 모델을 유지했습니다.
    </div>

    <AdSlot slot="shipping-compare" label="택배비 비교 페이지 광고" />

    <div class="text-center">
      <RouterLink to="/" class="retro-button">
        홈으로 돌아가 마켓 수수료도 함께 보기
      </RouterLink>
    </div>
  </div>
</template>
