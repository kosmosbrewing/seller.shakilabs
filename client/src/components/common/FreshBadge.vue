<script setup lang="ts">
import { computed } from "vue";
import { CheckCircle2 } from "lucide-vue-next";
import { useConstantsStore } from "@/stores/constants";

const props = defineProps<{
  message?: string;
}>();

const constantsStore = useConstantsStore();
const defaultMessage = computed(() => {
  const updated = constantsStore.feeDataUpdated;
  const verified = constantsStore.feeDataVerified;
  if (verified && verified !== updated) {
    return `${updated} 반영 · ${verified} 확인`;
  }
  return `${updated} 반영`;
});
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-bold leading-none text-primary"
  >
    <CheckCircle2 class="h-3.5 w-3.5" />
    {{ props.message ?? defaultMessage }}
  </span>
</template>
