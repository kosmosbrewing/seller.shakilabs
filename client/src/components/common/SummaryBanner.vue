<script setup lang="ts">
defineProps<{
  message: string;
  highlight?: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-center',
      highlight
        ? 'bg-primary text-primary-foreground'
        : 'bg-primary/10 text-foreground border border-primary/20'
    ]"
  >
    <p class="text-body sm:text-heading font-bold">
      {{ message }}
    </p>
  </div>
</template>
