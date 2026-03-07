<script setup lang="ts">
import { ChevronRight, Trophy, TrendingUp } from "lucide-vue-next";

interface SummaryFact {
  label: string;
  value: string;
}

defineProps<{
  title: string;
  leaderValue: string;
  leaderLabel?: string;
  deltaValue: string;
  deltaLabel: string;
  context?: string;
  facts?: SummaryFact[];
  highlight?: boolean;
  showShare?: boolean;
  showDetail?: boolean;
  detailLabel?: string;
}>();

defineEmits<{
  share: [];
  detail: [];
}>();
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden rounded-3xl border px-4 py-4 shadow-sm sm:px-5 sm:py-5',
      highlight
        ? 'border-primary/30 bg-[linear-gradient(135deg,rgba(249,115,22,0.96),rgba(251,146,60,0.88))] text-primary-foreground'
        : 'border-primary/20 bg-primary/10 text-foreground'
    ]"
  >
    <div
      v-if="highlight"
      class="pointer-events-none absolute inset-0 opacity-100"
      aria-hidden="true"
    >
      <div class="absolute right-[-2.5rem] top-[-3.5rem] h-32 w-32 rounded-full bg-white/16 blur-2xl" />
      <div class="absolute bottom-[-3rem] left-[-2rem] h-24 w-24 rounded-full bg-black/10 blur-2xl" />
    </div>

    <div class="relative grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)] lg:items-stretch">
      <div class="space-y-3.5">
        <div class="flex flex-wrap items-center gap-2.5">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase"
            :class="highlight ? 'bg-white/18 text-white' : 'bg-primary/12 text-primary'"
          >
            <Trophy class="h-3.5 w-3.5" />
            현재 조건 기준
          </span>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
            :class="highlight ? 'bg-black/15 text-white/92' : 'bg-background text-muted-foreground'"
          >
            바로 비교
          </span>
        </div>

        <div class="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_minmax(11rem,14rem)]">
          <div
            class="rounded-[1.4rem] p-4 sm:p-4.5"
            :class="highlight ? 'bg-white text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_30px_rgba(140,60,10,0.12)]' : 'bg-background text-foreground'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {{ leaderLabel ?? "가장 유리한 마켓" }}
                </p>
                <p class="mt-2 text-[30px] font-bold leading-none sm:text-[36px]">
                  {{ leaderValue }}
                </p>
              </div>
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Trophy class="h-5 w-5" />
              </span>
            </div>

            <div class="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
              <span>1위 추천</span>
              <ChevronRight class="h-3.5 w-3.5" />
              <span>현재 입력 조건 최적</span>
            </div>

            <p class="mt-2.5 max-w-[34rem] text-caption sm:text-body text-muted-foreground">
              {{ title }}
            </p>
          </div>

          <div
            class="rounded-[1.4rem] p-4 sm:p-4.5"
            :class="highlight ? 'bg-slate-950/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'bg-primary text-primary-foreground'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] opacity-75">
                  2위 대비
                </p>
                <p class="mt-2 text-[30px] font-bold leading-none tabular-nums sm:text-[34px]">
                  {{ deltaValue }}
                </p>
              </div>
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <TrendingUp class="h-5 w-5" />
              </span>
            </div>

            <p class="mt-3 text-caption font-semibold opacity-95">
              {{ deltaLabel }}
            </p>
            <p class="mt-1 text-[12px] leading-relaxed opacity-70">
              지금 바로 상세 비교표로 내려가면 수수료 구성까지 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <p
          v-if="context"
          class="rounded-2xl px-3.5 py-3 text-caption sm:text-body"
          :class="highlight ? 'bg-black/12 text-primary-foreground/95' : 'bg-background text-muted-foreground'"
        >
          {{ context }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <button
            v-if="showDetail"
            type="button"
            class="touch-target rounded-lg px-3.5 py-2 text-caption font-semibold transition-colors"
            :class="highlight ? 'bg-white text-slate-950 hover:bg-white/92' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
            @click="$emit('detail')"
          >
            {{ detailLabel ?? "상세 비교 보기" }}
          </button>
          <button
            v-if="showShare"
            type="button"
            class="touch-target rounded-lg border px-3 py-2 text-caption font-semibold transition-colors"
            :class="highlight ? 'border-white/35 text-white hover:bg-white/10' : 'border-primary/30 text-primary hover:bg-primary/10'"
            @click="$emit('share')"
          >
            결과 공유하기
          </button>
        </div>
      </div>

      <div
        v-if="facts?.length"
        class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2"
      >
        <div
          v-for="fact in facts"
          :key="fact.label"
          class="rounded-[1.35rem] px-3.5 py-3.5"
          :class="highlight ? 'border border-white/12 bg-white/14 text-white backdrop-blur-[2px]' : 'bg-background text-foreground'"
        >
          <p
            class="text-[11px] font-bold uppercase tracking-[0.14em]"
            :class="highlight ? 'text-white/72' : 'text-muted-foreground'"
          >
            {{ fact.label }}
          </p>
          <p class="mt-1.5 text-body font-bold leading-snug sm:text-[17px]">
            {{ fact.value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
