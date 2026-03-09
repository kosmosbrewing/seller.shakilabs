<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from "vue";
import { CircleHelp } from "lucide-vue-next";
import { buttonVariants } from "@/components/ui/button";

defineProps<{
  tooltip?: string;
  condition?: string;
}>();

const isVisible = ref(false);
const pos = ref({ x: 0, y: 0 });
const showBelow = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

function setPosition(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const panelW = 224; // w-56 = 14rem = 224px
  const estimatedPanelH = 80;
  const spaceAbove = rect.top;
  showBelow.value = spaceAbove < estimatedPanelH + 16;
  pos.value = {
    x: Math.max(8, Math.min(rect.left + rect.width / 2, window.innerWidth - panelW - 8)),
    y: showBelow.value ? rect.bottom + 8 : rect.top - 8,
  };
}

function showFromTarget(target: HTMLElement) {
  if (timer) clearTimeout(timer);
  setPosition(target);
  isVisible.value = true;
}

function show(event: Event) {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  showFromTarget(target);
}

function hideNow() {
  if (timer) clearTimeout(timer);
  isVisible.value = false;
}

function hide() {
  timer = setTimeout(() => {
    isVisible.value = false;
  }, 120);
}

function keep() {
  if (timer) clearTimeout(timer);
}

function toggle(event: MouseEvent) {
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  if (isVisible.value) {
    hideNow();
    return;
  }
  showFromTarget(target);
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (buttonRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  hideNow();
}

function handleViewportChange() {
  if (!isVisible.value || !buttonRef.value) return;
  setPosition(buttonRef.value);
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
  document.removeEventListener("click", handleDocumentClick);
  window.removeEventListener("resize", handleViewportChange);
  window.removeEventListener("scroll", handleViewportChange, true);
});
</script>

<template>
  <span class="inline-flex shrink-0 align-middle">
    <button
      ref="buttonRef"
      type="button"
      :class="[buttonVariants({ variant: 'ghost', size: 'iconSm' }), 'rounded-full p-0 hover:bg-transparent']"
      aria-label="상세 설명 보기"
      :aria-expanded="isVisible"
      @mouseenter="show"
      @mouseleave="hide"
      @focus="show"
      @blur="hide"
      @click.stop="toggle"
      @keydown.esc.prevent="hideNow"
    >
      <CircleHelp class="h-3.5 w-3.5" />
    </button>

    <Teleport to="body">
      <Transition name="hint-fade">
        <div
          v-if="isVisible"
          ref="panelRef"
          class="fixed z-50 w-56 rounded-lg border border-border/70 bg-popover px-3 py-2 text-[11px] leading-[1.45] text-popover-foreground shadow-lg"
          :style="{ left: `${pos.x}px`, top: `${pos.y}px`, transform: showBelow ? 'translateY(0)' : 'translateY(-100%)' }"
          @mouseenter="keep"
          @mouseleave="hide"
          @click.stop
        >
          <p v-if="tooltip">{{ tooltip }}</p>
          <p v-if="condition" class="mt-0.5 text-amber-700 dark:text-amber-300">
            {{ condition }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.12s ease;
}
.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
}
</style>
