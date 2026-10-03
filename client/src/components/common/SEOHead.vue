<script setup lang="ts">
import { useSEO, type TitleKind } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  titleKind?: TitleKind;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
  titleKind: () => props.titleKind,
});
</script>

<template>
</template>
