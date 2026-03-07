<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { BadgeCheck, Package2, Truck } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import AdSlot from "@/components/common/AdSlot.vue";
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
  type ShippingSizeKey,
} from "@/data/shippingRates";
import { formatNumber, formatWon } from "@/lib/utils";

const seoTitle = "8개 택배사 예상 운임 택배비 비교 계산기";
const seoDescription =
  "CJ대한통운, 한진, 로젠, 우체국, 경동, 롯데, CU, GS25의 예상 택배비를 무게와 크기 기준으로 비교합니다.";
const pageUrl = `${DEFAULT_SITE_URL}/shipping-compare`;

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
const remoteAreaGroupCount = computed(() => REMOTE_AREA_POSTAL_CODE_SUMMARY.length);
const remoteAreaClusterCount = computed(() =>
  REMOTE_AREA_POSTAL_CODE_SUMMARY.reduce((sum, group) => sum + group.clusters.length, 0)
);
const remoteAreaRangeCount = computed(() =>
  REMOTE_AREA_POSTAL_CODE_SUMMARY.reduce(
    (sum, group) => sum + group.clusters.reduce((clusterSum, cluster) => clusterSum + cluster.postalRanges.length, 0),
    0
  )
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
    "description": `제주 및 도서산간 우편번호 묶음 ${remoteAreaClusterCount.value}건, 총 ${remoteAreaPostalCodeCount.value}개 우편번호 참고 데이터`,
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

function getPostalCodeCount(range: string): number {
  if (!range.includes("-")) return 1;

  const [start, end] = range.split("-").map((value) => Number.parseInt(value, 10));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 1;
  return end - start + 1;
}

function getPostalRangeKind(range: string): string {
  return range.includes("-") ? "연속 구간" : "단일 번호";
}

function getPostalRangesCount(ranges: string[]): number {
  return ranges.reduce((sum, range) => sum + getPostalCodeCount(range), 0);
}

function getPostalRangeKinds(ranges: string[]): string {
  if (ranges.length === 1) return getPostalRangeKind(ranges[0]);
  return "복합 구간";
}

function formatPostalRanges(ranges: string[]): string {
  return ranges.join(", ");
}
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="jsonLd" />

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

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div>
            <div class="flex items-center gap-2">
              <Truck class="h-4.5 w-4.5" />
              <span class="retro-title">일반 택배 6사 비교</span>
            </div>
            <p class="mt-1 text-tiny text-muted-foreground">부피와 중량 조건에 따라 가장 유리한 택배사를 비교합니다.</p>
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

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div>
            <div class="flex items-center gap-2">
              <Package2 class="h-4.5 w-4.5" />
              <span class="retro-title">편의점 택배 2종 비교</span>
            </div>
            <p class="mt-1 text-tiny text-muted-foreground">소형 발송에 유리하지만 중량·부피 제한을 먼저 확인하세요.</p>
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

    <section>
      <div class="retro-panel overflow-hidden">
        <div class="retro-titlebar rounded-t-2xl">
          <div class="flex flex-col gap-1">
            <span class="retro-title">제주·도서산간 우편번호 정리표</span>
            <p class="text-tiny text-muted-foreground">세부 구간을 섬권역 단위로 묶어 다시 정리한 내부 참고표입니다.</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 border-b border-border/60 px-4 py-3 text-tiny text-muted-foreground">
          <span class="rounded-full border border-border/70 bg-background px-2.5 py-1">{{ remoteAreaGroupCount }}개 권역</span>
          <span class="rounded-full border border-border/70 bg-background px-2.5 py-1">{{ remoteAreaClusterCount }}개 섬권역 묶음</span>
          <span class="rounded-full border border-border/70 bg-background px-2.5 py-1">{{ remoteAreaRangeCount }}개 원시 구간</span>
          <span class="rounded-full border border-border/70 bg-background px-2.5 py-1">총 {{ remoteAreaPostalCodeCount.toLocaleString('ko-KR') }}개 우편번호</span>
        </div>

        <div class="space-y-3 px-4 pb-4 pt-4 md:hidden">
          <article
            v-for="group in REMOTE_AREA_POSTAL_CODE_SUMMARY"
            :key="group.group"
            class="rounded-2xl border border-border/70 bg-background px-3.5 py-3"
          >
            <p class="text-body font-bold text-foreground">{{ group.group }}</p>
            <div class="mt-3 space-y-2">
              <div
                v-for="cluster in group.clusters"
                :key="`${group.group}-${cluster.zone}`"
                class="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-caption font-bold text-foreground">{{ cluster.zone }}</p>
                    <p class="mt-0.5 text-[11px] text-muted-foreground">{{ cluster.areas }}</p>
                  </div>
                  <div class="flex flex-wrap justify-end gap-1">
                    <span class="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {{ getPostalRangeKinds(cluster.postalRanges) }}
                    </span>
                    <span class="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {{ getPostalRangesCount(cluster.postalRanges) }}개
                    </span>
                  </div>
                </div>
                <p class="mt-1 text-[12px] font-semibold tracking-[-0.01em] text-foreground">{{ formatPostalRanges(cluster.postalRanges) }}</p>
                <p v-if="cluster.note" class="mt-1 text-[11px] text-muted-foreground">{{ cluster.note }}</p>
              </div>
            </div>
          </article>
        </div>

        <div class="hidden overflow-x-auto px-4 pb-4 pt-4 md:block">
          <table class="min-w-[880px] w-full text-body">
            <thead>
              <tr class="border-b border-border/80 bg-card/95">
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">권역</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">섬권역 묶음</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">포함 지역</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">우편번호 묶음</th>
                <th class="px-4 py-3 text-left text-caption font-semibold text-muted-foreground">묶음 정보</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in REMOTE_AREA_POSTAL_CODE_SUMMARY" :key="group.group">
                <tr class="border-b border-border/40 bg-muted/10">
                  <td colspan="5" class="px-4 py-2.5 text-body font-bold text-foreground">
                    {{ group.group }}
                  </td>
                </tr>
                <tr
                  v-for="cluster in group.clusters"
                  :key="`${group.group}-${cluster.zone}`"
                  class="border-b border-border/40"
                >
                  <td class="px-4 py-3 text-caption text-muted-foreground">{{ group.group }}</td>
                  <td class="px-4 py-3 text-body font-semibold text-foreground">{{ cluster.zone }}</td>
                  <td class="px-4 py-3 text-caption text-muted-foreground">{{ cluster.areas }}</td>
                  <td class="px-4 py-3 text-body font-semibold tracking-[-0.01em] text-foreground">{{ formatPostalRanges(cluster.postalRanges) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1.5">
                      <span class="rounded-full border border-border/70 bg-muted/20 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                        {{ getPostalRangeKinds(cluster.postalRanges) }}
                      </span>
                      <span class="rounded-full border border-border/70 bg-muted/20 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                        {{ getPostalRangesCount(cluster.postalRanges) }}개
                      </span>
                      <span
                        v-if="cluster.note"
                        class="rounded-full border border-orange-300/70 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-foreground dark:border-orange-400/35 dark:bg-orange-950/20"
                      >
                        {{ cluster.note }}
                      </span>
                    </div>
                  </td>
                </tr>
              </template>
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
