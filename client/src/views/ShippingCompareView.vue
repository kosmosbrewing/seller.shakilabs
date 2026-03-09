<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { BadgeCheck, Package2, Truck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
import CompareHint from "@/components/common/CompareHint.vue";
import { Button, buttonVariants } from "@/components/ui/button";
import { DEFAULT_SITE_URL } from "@/lib/site";
import {
  REMOTE_AREA_POSTAL_CODE_SUMMARY,
  SHIPPING_DATA_UPDATED,
  SHIPPING_SIZE_LABELS,
  SHIPPING_SIZE_ORDER,
  SHIPPING_WEIGHT_PRESETS,
  SHIPPING_CARRIERS,
  estimateShippingRates,
  parseShippingSumCm,
  parseShippingWeight,
  resolveShippingSize,
  type ShippingEstimateResult,
  type ShippingSizeKey,
} from "@/data/shippingRates";
import { formatNumber, formatWon } from "@/lib/utils";

type ShippingCompareColumnKey = "baseFare" | "weightSurcharge" | "totalFare" | "limit";

interface ShippingCompareColumn {
  key: ShippingCompareColumnKey;
  label: string;
  nowrap?: boolean;
}

const seoTitle = "일반 택배 6사 · 편의점 택배 2사 택배비 비교";
const seoDescription =
  "CJ대한통운, 한진, 로젠, 우체국, 경동, 롯데, CU, GS25의 예상 택배비를 무게와 크기 기준으로 비교합니다.";
const pageUrl = `${DEFAULT_SITE_URL}/shipping-compare`;

const shippingCompareColumns: ShippingCompareColumn[] = [
  { key: "baseFare", label: "기본운임", nowrap: true },
  { key: "weightSurcharge", label: "무게추가", nowrap: true },
  { key: "totalFare", label: "예상 총 운임", nowrap: true },
  { key: "limit", label: "접수 제한", nowrap: true },
];

const weightKg = ref(3);
const selectedSize = ref<ShippingSizeKey>("medium");
const sumCm = ref<number | null>(100);
const showRemoteAreaReference = ref(false);

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
const cheapestGeneralLabel = computed(() => formatCheapestShippingLabel(cheapestGeneral.value));
const cheapestConvenienceLabel = computed(() => formatCheapestShippingLabel(cheapestConvenience.value));
const remoteAreaClusterCount = computed(() =>
  REMOTE_AREA_POSTAL_CODE_SUMMARY.reduce((sum, group) => sum + group.clusters.length, 0)
);
const remoteAreaPostalCodeCount = computed(() =>
  REMOTE_AREA_POSTAL_CODE_SUMMARY.reduce(
    (sum, group) =>
      sum + group.clusters.reduce(
        (groupSum, cluster) =>
          groupSum + cluster.postalRanges.reduce((rangeSum, postalRange) => rangeSum + getPostalCodeCount(postalRange), 0),
        0
      ),
    0
  )
);

const jsonLd = computed(() => [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoTitle,
    "description": seoDescription,
    "url": pageUrl,
    "inLanguage": "ko-KR",
    "dateModified": "2026-03-07",
    "isPartOf": {
      "@type": "WebSite",
      "name": "오픈마켓 수수료 계산기",
      "url": DEFAULT_SITE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "택배사 비교 목록",
    "url": pageUrl,
    "numberOfItems": SHIPPING_CARRIERS.length,
    "itemListElement": SHIPPING_CARRIERS.map((carrier, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": carrier.name,
        "description": `${carrier.estimateNote} · ${carrier.restrictionNote}`,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "제주·도서산간 우편번호 내부 정리표",
    "description": `제주 및 도서산간 ${remoteAreaClusterCount.value}개 지역, 총 ${remoteAreaPostalCodeCount.value}개 우편번호 참고 데이터`,
    "url": pageUrl,
    "inLanguage": "ko-KR",
    "dateModified": "2026-03-07",
    "creator": {
      "@type": "Organization",
      "name": "ShakiLabs",
    },
  },
]);

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

const WEIGHT_STEP_UNIT = 1;

function adjustWeight(delta: number): void {
  const next = Math.max(0.5, weightKg.value + delta);
  const validated = parseShippingWeight(next);
  if (validated != null) {
    weightKg.value = validated;
  }
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

function formatCheapestShippingLabel(result: ShippingEstimateResult | null): string | null {
  if (!result || !result.isAvailable) return null;
  return `${result.carrier.shortName} ${formatWon(result.totalFare)}`;
}

function formatCarrierLimit(result: ShippingEstimateResult): string {
  return `${formatNumber(result.carrier.maxWeightKg)}kg · ${result.carrier.maxSumCm}cm`;
}

function formatWeightSurcharge(result: ShippingEstimateResult): string {
  if (!result.isAvailable) return "-";
  if (result.weightSurcharge <= 0) return "없음";
  return `+${formatWon(result.weightSurcharge)}`;
}

function getReadableBadgeTextClass(): string {
  return "text-white";
}

function getShippingCellBg(
  columnKey: ShippingCompareColumnKey,
  result: ShippingEstimateResult,
  cheapestKey: ShippingEstimateResult["carrier"]["key"] | undefined
): string {
  if (columnKey === "totalFare" && result.isAvailable && result.carrier.key === cheapestKey) {
    return "compare-cell-highlight";
  }
  if (columnKey === "limit" && result.unavailableReason) {
    return "compare-cell-caution";
  }
  return "";
}

function getShippingRowTone(
  result: ShippingEstimateResult,
  cheapestKey: ShippingEstimateResult["carrier"]["key"] | undefined
): string {
  if (!result.isAvailable) return "bg-muted/25";
  if (result.carrier.key === cheapestKey) return "bg-profit/8 dark:bg-profit/12";
  return "";
}

function getShippingStickyCellTone(
  result: ShippingEstimateResult,
  cheapestKey: ShippingEstimateResult["carrier"]["key"] | undefined
): string {
  if (!result.isAvailable) return "bg-muted";
  if (result.carrier.key === cheapestKey) return "bg-card";
  return "bg-card";
}

function getShippingCellValue(columnKey: ShippingCompareColumnKey, result: ShippingEstimateResult): string {
  if (columnKey === "baseFare") {
    return result.isAvailable ? formatWon(result.baseFare) : "-";
  }
  if (columnKey === "weightSurcharge") {
    return formatWeightSurcharge(result);
  }
  if (columnKey === "totalFare") {
    return result.isAvailable ? formatWon(result.totalFare) : "접수 불가";
  }
  return formatCarrierLimit(result);
}

function getPostalCodeCount(range: string): number {
  if (!range.includes("-")) return 1;

  const [start, end] = range.split("-").map((value) => Number.parseInt(value, 10));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 1;
  return end - start + 1;
}

function formatPostalRanges(ranges: string[]): string {
  return ranges.join(", ");
}

</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="jsonLd" />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar flex-col items-start gap-2 rounded-t-2xl sm:flex-row sm:items-center sm:gap-3">
        <h1 class="retro-title">택배비 비교</h1>
        <FreshBadge :message="`${SHIPPING_DATA_UPDATED} 반영`" />
      </div>

      <div class="retro-panel-content space-y-1.5">
        <p class="text-body text-muted-foreground">
          상품 무게와 크기에 따라 일반 택배 6사와 편의점 택배 2개의 예상 운임을 비교합니다.
        </p>
        <p class="text-caption text-muted-foreground">
          동일권 공개 운임 기준 추정이며, 계약 단가·타권·제주/도서산간·냉장냉동 할증은 제외됩니다.
        </p>
      </div>
    </div>

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <h2 class="retro-title">운임 조건 입력</h2>
        </div>
        <div class="retro-panel-content">
          <div class="space-y-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-border/60 p-3">
                <div class="space-y-1.5">
                  <p class="inline-flex items-center gap-1.5 text-body font-bold text-foreground">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
                    <label for="shipping-weight-input">무게</label>
                  </p>
                </div>
                <div class="mt-3 max-w-[18rem] space-y-2">
                  <div class="flex items-stretch gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="chip"
                      class="w-11 shrink-0 px-0 tabular-nums active:text-foreground"
                      @click="adjustWeight(-WEIGHT_STEP_UNIT)"
                    >
                      -
                    </Button>
                    <div class="relative min-w-0 flex-1">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body text-muted-foreground">kg</span>
                      <input
                        id="shipping-weight-input"
                        type="text"
                        inputmode="decimal"
                        class="retro-input pl-10 tabular-nums text-right"
                        :value="weightDisplay"
                        @input="handleWeightInput"
                        @blur="handleWeightBlur"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="chip"
                      class="w-11 shrink-0 px-0 tabular-nums active:text-foreground"
                      @click="adjustWeight(WEIGHT_STEP_UNIT)"
                    >
                      +
                    </Button>
                  </div>
                  <div class="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                    <Button
                      v-for="preset in SHIPPING_WEIGHT_PRESETS"
                      :key="preset"
                      type="button"
                      :variant="weightKg === preset ? 'default' : 'outline'"
                      size="chip"
                      class="justify-center px-0"
                      :class="weightKg === preset ? 'text-white hover:text-white active:text-white' : 'active:text-foreground'"
                      @click="weightKg = preset"
                    >
                      {{ preset }}kg
                    </Button>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-border/60 p-3">
                <div class="space-y-1.5">
                  <p class="inline-flex items-center gap-1.5 text-body font-bold text-foreground">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">2</span>
                    <span>크기</span>
                  </p>
                </div>
                <div class="mt-3 max-w-[18rem] space-y-2">
                  <div class="grid grid-cols-4 gap-1.5">
                    <Button
                      v-for="sizeKey in SHIPPING_SIZE_ORDER"
                      :key="sizeKey"
                      type="button"
                      :variant="resolvedSize === sizeKey ? 'default' : 'outline'"
                      size="chip"
                      class="justify-center px-0"
                      :class="resolvedSize === sizeKey ? 'text-white hover:text-white active:text-white' : 'active:text-foreground'"
                      @click="selectSize(sizeKey)"
                    >
                      {{ SHIPPING_SIZE_LABELS[sizeKey] }}
                    </Button>
                  </div>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-body text-muted-foreground">cm</span>
                    <input
                      id="shipping-sum-input"
                      type="text"
                      inputmode="numeric"
                      class="retro-input pl-10 tabular-nums text-right"
                      :value="sumDisplay"
                      placeholder="3변 합"
                      @input="handleSumInput"
                      @blur="handleSumBlur"
                    />
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
    </section>

    <section id="shipping-general-results">
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div class="flex items-center gap-2">
            <Truck class="h-4.5 w-4.5" />
            <h2 class="retro-title">일반 택배 6사 비교</h2>
          </div>
        </div>
        <div class="retro-panel-content space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-body text-muted-foreground">부피와 중량 조건에 따라 가장 유리한 택배사를 비교합니다.</p>
            <span
              v-if="cheapestGeneralLabel"
              class="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-caption font-semibold text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20 dark:text-emerald-300"
            >
              <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              현재 최저 예상 운임 {{ cheapestGeneralLabel }}
            </span>
          </div>

          <p class="scroll-hint">표를 좌우로 밀면 다른 운임 항목을 계속 확인할 수 있습니다.</p>

          <div class="overflow-x-auto">
            <table class="w-full text-body">
              <thead>
                <tr class="border-b border-border/80 bg-card/95">
                  <th class="sticky left-0 z-20 whitespace-nowrap bg-card px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4">택배사</th>
                  <th
                    v-for="col in shippingCompareColumns"
                    :key="`general-${col.key}`"
                    class="whitespace-nowrap px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4"
                  >
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="result in generalResults"
                  :key="result.carrier.key"
                  class="border-b border-border/40 transition-colors hover:bg-accent/15"
                  :class="getShippingRowTone(result, cheapestGeneral?.carrier.key)"
                >
                  <td
                    class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4"
                    :class="getShippingStickyCellTone(result, cheapestGeneral?.carrier.key)"
                  >
                    <div class="flex items-center gap-2.5">
                      <span
                        class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                        :class="[getReadableBadgeTextClass(), result.isAvailable ? '' : 'grayscale opacity-55']"
                        :style="{ backgroundColor: result.carrier.color }"
                      >
                        {{ result.carrier.shortName }}
                      </span>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="text-body font-semibold" :class="result.isAvailable ? 'text-foreground' : 'text-muted-foreground'">
                            {{ result.carrier.name }}
                          </p>
                          <span
                            v-if="cheapestGeneral?.carrier.key === result.carrier.key"
                            class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[11px] font-semibold text-white"
                          >
                            <BadgeCheck class="h-3.5 w-3.5" />
                            최저
                          </span>
                          <span
                            v-else-if="!result.isAvailable"
                            class="inline-flex items-center rounded-full border border-orange-300/70 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:border-orange-400/35 dark:bg-orange-950/20 dark:text-orange-200"
                          >
                            접수 불가
                          </span>
                        </div>
                        <p class="text-tiny text-muted-foreground whitespace-normal">
                          <span class="hidden sm:inline">{{ result.carrier.estimateNote }} · </span>{{ result.effectiveSizeLabel }} 구간
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    v-for="col in shippingCompareColumns"
                    :key="`${result.carrier.key}-${col.key}`"
                    class="px-3 py-3 align-top sm:px-4"
                  >
                    <div class="compare-cell" :class="getShippingCellBg(col.key, result, cheapestGeneral?.carrier.key)">
                      <span
                        class="compare-cell-value"
                        :class="[
                          result.isAvailable ? '' : 'text-muted-foreground',
                          col.nowrap ? 'whitespace-nowrap' : '',
                          col.key === 'totalFare' && cheapestGeneral?.carrier.key === result.carrier.key ? 'text-profit' : '',
                          col.key === 'weightSurcharge' && result.weightSurcharge > 0 ? 'text-fee' : '',
                        ]"
                      >
                        {{ getShippingCellValue(col.key, result) }}
                      </span>
                      <CompareHint
                        v-if="col.key === 'limit'"
                        :tooltip="result.restrictionText"
                        :condition="result.unavailableReason"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div class="flex items-center gap-2">
            <Package2 class="h-4.5 w-4.5" />
            <h2 class="retro-title">편의점 택배 2종 비교</h2>
          </div>
        </div>
        <div class="retro-panel-content space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-body text-muted-foreground">소형 발송에 유리하지만 중량·부피 제한을 먼저 확인하세요.</p>
            <span
              v-if="cheapestConvenienceLabel"
              class="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-caption font-semibold text-foreground dark:border-emerald-400/35 dark:bg-emerald-950/20 dark:text-emerald-300"
            >
              <BadgeCheck class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              현재 최저 예상 운임 {{ cheapestConvenienceLabel }}
            </span>
          </div>

          <p class="scroll-hint">표를 좌우로 밀면 다른 운임 항목을 계속 확인할 수 있습니다.</p>

          <div class="overflow-x-auto">
            <table class="w-full text-body">
              <thead>
                <tr class="border-b border-border/80 bg-card/95">
                  <th class="sticky left-0 z-20 whitespace-nowrap bg-card px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4">택배사</th>
                  <th
                    v-for="col in shippingCompareColumns"
                    :key="`convenience-${col.key}`"
                    class="whitespace-nowrap px-3 py-3 text-left text-caption font-semibold text-muted-foreground sm:px-4"
                  >
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="result in convenienceResults"
                  :key="result.carrier.key"
                  class="border-b border-border/40 transition-colors hover:bg-accent/15"
                  :class="getShippingRowTone(result, cheapestConvenience?.carrier.key)"
                >
                  <td
                    class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4"
                    :class="getShippingStickyCellTone(result, cheapestConvenience?.carrier.key)"
                  >
                    <div class="flex items-center gap-2.5">
                      <span
                        class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-1.5 text-tiny font-bold"
                        :class="[getReadableBadgeTextClass(), result.isAvailable ? '' : 'grayscale opacity-55']"
                        :style="{ backgroundColor: result.carrier.color }"
                      >
                        {{ result.carrier.shortName }}
                      </span>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="text-body font-semibold" :class="result.isAvailable ? 'text-foreground' : 'text-muted-foreground'">
                            {{ result.carrier.name }}
                          </p>
                          <span
                            v-if="cheapestConvenience?.carrier.key === result.carrier.key"
                            class="inline-flex items-center gap-1 rounded-full bg-profit px-2 py-0.5 text-[11px] font-semibold text-white"
                          >
                            <BadgeCheck class="h-3.5 w-3.5" />
                            최저
                          </span>
                          <span
                            v-else-if="!result.isAvailable"
                            class="inline-flex items-center rounded-full border border-orange-300/70 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:border-orange-400/35 dark:bg-orange-950/20 dark:text-orange-200"
                          >
                            접수 불가
                          </span>
                        </div>
                        <p class="text-tiny text-muted-foreground whitespace-normal">
                          <span class="hidden sm:inline">{{ result.carrier.estimateNote }} · </span>{{ result.effectiveSizeLabel }} 구간
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    v-for="col in shippingCompareColumns"
                    :key="`${result.carrier.key}-${col.key}`"
                    class="px-3 py-3 align-top sm:px-4"
                  >
                    <div class="compare-cell" :class="getShippingCellBg(col.key, result, cheapestConvenience?.carrier.key)">
                      <span
                        class="compare-cell-value"
                        :class="[
                          result.isAvailable ? '' : 'text-muted-foreground',
                          col.nowrap ? 'whitespace-nowrap' : '',
                          col.key === 'totalFare' && cheapestConvenience?.carrier.key === result.carrier.key ? 'text-profit' : '',
                          col.key === 'weightSurcharge' && result.weightSurcharge > 0 ? 'text-fee' : '',
                        ]"
                      >
                        {{ getShippingCellValue(col.key, result) }}
                      </span>
                      <CompareHint
                        v-if="col.key === 'limit'"
                        :tooltip="result.restrictionText"
                        :condition="result.unavailableReason"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section>
      <details class="retro-panel overflow-hidden" :open="showRemoteAreaReference || undefined">
        <summary class="retro-titlebar rounded-t-2xl list-none cursor-pointer" @click.prevent="showRemoteAreaReference = !showRemoteAreaReference">
          <h2 class="retro-title">제주·도서산간 우편번호 정리표</h2>
          <span class="retro-kbd">{{ showRemoteAreaReference ? "접기" : "열기" }}</span>
        </summary>

        <div v-if="showRemoteAreaReference">
          <div class="space-y-3 px-4 pb-4 pt-4 md:hidden">
            <details
              v-for="group in REMOTE_AREA_POSTAL_CODE_SUMMARY"
              :key="group.group"
              class="overflow-hidden rounded-2xl border border-border/70 bg-background"
            >
              <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3">
                <p class="text-body font-bold text-foreground">{{ group.group }}</p>
                <span class="rounded-full border border-border/70 bg-muted/15 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {{ group.clusters.length }}개 지역
                </span>
              </summary>
              <div class="space-y-2 border-t border-border/60 px-3.5 py-3">
                <div
                  v-for="cluster in group.clusters"
                  :key="`${group.group}-${cluster.zone}`"
                  class="rounded-xl border border-border/60 bg-white px-3 py-2.5"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-caption font-bold text-foreground">{{ cluster.zone }}</p>
                      <p v-if="cluster.areas" class="mt-0.5 text-[11px] text-muted-foreground">{{ cluster.areas }}</p>
                    </div>
                    <CompareHint v-if="cluster.note" :tooltip="cluster.note" />
                  </div>
                  <p class="mt-2 text-caption tabular-nums tracking-[-0.01em] text-muted-foreground">{{ formatPostalRanges(cluster.postalRanges) }}</p>
                </div>
              </div>
            </details>
          </div>

          <div class="hidden overflow-x-auto px-4 pb-4 pt-4 md:block">
            <table class="w-full text-body leading-6">
              <thead>
                <tr class="border-b border-border/80 bg-card/95">
                  <th class="px-3 py-1.5 text-left text-caption font-semibold text-muted-foreground sm:px-4">지역</th>
                  <th class="px-3 py-1.5 text-left text-caption font-semibold text-muted-foreground sm:px-4">우편번호</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="group in REMOTE_AREA_POSTAL_CODE_SUMMARY" :key="group.group">
                  <tr class="border-b border-border/60 bg-muted/20">
                    <td colspan="2" class="px-3 py-1.5 sm:px-4">
                      <span class="text-caption font-bold text-foreground">{{ group.group }}</span>
                      <span class="ml-1.5 text-tiny text-muted-foreground">{{ group.clusters.length }}개 지역</span>
                    </td>
                  </tr>
                  <tr
                    v-for="cluster in group.clusters"
                    :key="`${group.group}-${cluster.zone}`"
                    class="border-b border-border/40 transition-colors hover:bg-accent/15"
                  >
                    <td class="whitespace-nowrap px-3 py-1.5 pl-6 sm:px-4 sm:pl-8">
                      <span class="flex h-6 items-center gap-1.5">
                        <span class="text-body font-semibold text-foreground">{{ cluster.zone }}</span>
                        <span v-if="cluster.areas" class="text-caption text-muted-foreground">{{ cluster.areas }}</span>
                      </span>
                    </td>
                    <td class="px-3 py-1.5 sm:px-4">
                      <span class="flex h-6 items-center gap-1">
                        <span class="compare-cell-value tracking-[-0.01em]">{{ formatPostalRanges(cluster.postalRanges) }}</span>
                        <CompareHint v-if="cluster.note" :tooltip="cluster.note" />
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>

    <AdSlot slot="shipping-compare" label="택배비 비교 페이지 광고" />

    <section class="retro-panel overflow-hidden">
      <div class="retro-panel-content text-center space-y-2">
        <p class="text-caption text-muted-foreground">내 상품의 수수료를 직접 계산해보세요.</p>
        <RouterLink :class="buttonVariants({ variant: 'default' })" to="/">
          수수료 계산기 사용하기
        </RouterLink>
      </div>
    </section>
  </div>
</template>
