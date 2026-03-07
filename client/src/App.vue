<script setup lang="ts">
import AppLayout from "@/components/layout/AppLayout.vue";
import AlertHost from "@/components/ui/alert/AlertHost.vue";
</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page-fade">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <AlertHost />
  </AppLayout>
</template>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
