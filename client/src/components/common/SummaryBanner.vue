<script setup lang="ts">
defineProps<{
  headline?: string;
  message: string;
  subMessage?: string;
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
      'rounded-2xl px-4 py-4 sm:px-5 sm:py-5',
      highlight
        ? 'bg-primary text-primary-foreground'
        : 'bg-primary/10 text-foreground border border-primary/20'
    ]"
  >
    <div class="flex flex-col gap-3 sm:gap-3.5">
      <div class="space-y-1 text-center sm:text-left">
        <p
          v-if="headline"
          class="text-caption font-semibold"
          :class="highlight ? 'text-primary-foreground/85' : 'text-primary'"
        >
          {{ headline }}
        </p>
        <p class="text-body sm:text-heading font-bold">
          {{ message }}
        </p>
        <p
          v-if="subMessage"
          class="text-caption sm:text-body"
          :class="highlight ? 'text-primary-foreground/90' : 'text-muted-foreground'"
        >
          {{ subMessage }}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
        <button
          v-if="showShare"
          type="button"
          class="touch-target rounded-lg px-3 py-2 text-caption font-semibold transition-opacity"
          :class="highlight ? 'bg-white/20 text-white hover:bg-white/25' : 'bg-primary text-primary-foreground hover:bg-primary/90'"
          @click="$emit('share')"
        >
          결과 공유하기
        </button>
        <button
          v-if="showDetail"
          type="button"
          class="touch-target rounded-lg border px-3 py-2 text-caption font-semibold transition-colors"
          :class="highlight ? 'border-white/35 text-white hover:bg-white/10' : 'border-primary/30 text-primary hover:bg-primary/10'"
          @click="$emit('detail')"
        >
          {{ detailLabel ?? "상세 비교 보기" }}
        </button>
      </div>
    </div>
  </div>
</template>
