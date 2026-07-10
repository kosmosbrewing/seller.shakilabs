<script setup lang="ts">
import { ArrowRight, CreditCard, PackageCheck } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { ActionCard } from "@/components/ui/action-card";

const emit = defineEmits<{
  select: [target: "payment" | "shipping"];
}>();
</script>

<template>
  <section>
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">다른 비용도 비교하기</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <p class="text-[11px] text-muted-foreground sm:text-body">
          마켓 수수료 외에 결제 수수료와 택배비도 수익에 영향을 줍니다.
        </p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionCard
            :as="RouterLink"
            to="/payment-compare"
            class="gap-0"
            @click="emit('select', 'payment')"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-body font-bold text-foreground">결제 수수료 비교</p>
                <p class="mt-1.5 text-caption text-muted-foreground">
                  토스페이먼츠, 네이버페이 등 PG사별 카드 수수료 비교
                </p>
              </div>
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <CreditCard class="h-5 w-5" />
              </span>
            </div>
            <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              비교하러 가기 <ArrowRight class="h-3.5 w-3.5" />
            </p>
          </ActionCard>

          <ActionCard
            :as="RouterLink"
            to="/shipping-compare"
            class="gap-0"
            @click="emit('select', 'shipping')"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-body font-bold text-foreground">택배비 비교</p>
                <p class="mt-1.5 text-caption text-muted-foreground">
                  일반 택배 6사 · 편의점 택배 2사 운임 계산
                </p>
              </div>
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <PackageCheck class="h-5 w-5" />
              </span>
            </div>
            <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
              계산하러 가기 <ArrowRight class="h-3.5 w-3.5" />
            </p>
          </ActionCard>
        </div>
      </div>
    </div>
  </section>
</template>
