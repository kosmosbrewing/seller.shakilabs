<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";

const props = defineProps<{
  message?: string;
}>();

const defaultMessage = "2025.06 수수료 개편 반영";
</script>

<template>
  <span class="inline-flex items-center gap-2 rounded border border-primary/35 bg-primary/10 px-2.5 py-1 text-caption font-bold text-primary">
    <CheckCircle2 class="h-3.5 w-3.5" />
    {{ props.message ?? defaultMessage }}
  </span>
</template>
