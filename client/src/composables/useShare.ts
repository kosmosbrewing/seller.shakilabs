import { computed, ref } from "vue";
import { showAlert } from "./useAlert";
import { formatWon } from "@/lib/utils";
import { buildAbsoluteUrl, copyToClipboard } from "@/lib/routeState";
import { trackEvent } from "@/lib/analytics";
import { ensureKakaoSdk } from "@/lib/kakaoSdk";
import type { FeeBreakdown } from "@/utils/calculator";
import { ALL_CHANNEL_META } from "@/data/marketFees";
import type { CategoryKey } from "@/data/marketFees";
import { CATEGORY_MAP } from "@/data/categories";

interface ShareContext {
  price: { value: number };
  category: { value: CategoryKey };
  bestMarket: { value: FeeBreakdown | null };
  includeOwnStore?: { value: boolean };
  monthlyQty: { value: number };
}

export function useShare(ctx: ShareContext) {
  const showShareModal = ref(false);
  const kakaoBusy = ref(false);

  function trackShareEvent(eventName: string, params?: Record<string, unknown>): void {
    trackEvent(eventName, {
      page: "home",
      price: ctx.price.value,
      category: ctx.category.value,
      monthly_qty: ctx.monthlyQty.value,
      best_market: ctx.bestMarket.value?.marketKey ?? "unknown",
      ...params,
    });
  }

  const shareSummary = computed(() => {
    const cat = CATEGORY_MAP[ctx.category.value]?.label ?? "";
    const best = ctx.bestMarket.value;
    if (!best) return "";
    const marketName = ALL_CHANNEL_META[best.marketKey].name;
    return `판매가 ${formatWon(ctx.price.value)} ${cat} → ${marketName} 수수료 ${formatWon(best.totalFee)} (${(best.totalFeeRate * 100).toFixed(1)}%)`;
  });

  function openShare(): void {
    trackShareEvent("ux_share_modal_open");
    showShareModal.value = true;
  }

  function closeShare(): void {
    showShareModal.value = false;
  }

  function getShareUrl(): string {
    const path = window.location.pathname || "/";
    return buildAbsoluteUrl(path, {
      price: ctx.price.value,
      cat: ctx.category.value !== "clothing" ? ctx.category.value : null,
      own: ctx.includeOwnStore?.value ? 1 : null,
      qty: ctx.monthlyQty.value !== 100 ? ctx.monthlyQty.value : null,
    });
  }

  function getShareText(): string {
    const best = ctx.bestMarket.value;
    if (!best) return "오픈마켓 수수료 비교 계산기";
    const marketName = ALL_CHANNEL_META[best.marketKey].name;
    const cat = CATEGORY_MAP[ctx.category.value]?.label ?? "";
    return `판매가 ${formatWon(ctx.price.value)} ${cat} → ${marketName}가 가장 유리 (반영 데이터 기준)`;
  }

  async function copyLink(): Promise<void> {
    const shareUrl = getShareUrl();
    const copied = await copyToClipboard(shareUrl);
    try {
      if (!copied) {
        throw new Error("Clipboard API unavailable");
      }
      trackShareEvent("ux_share_link_copy_success");
      showAlert("링크가 복사되었습니다");
    } catch {
      trackShareEvent("ux_share_link_copy_fail");
      showAlert("링크 복사에 실패했습니다", { type: "error" });
    }
  }

  async function shareKakao(): Promise<void> {
    if (kakaoBusy.value) return;
    kakaoBusy.value = true;

    try {
      await ensureKakaoSdk();
      if (!window.Kakao?.Share) throw new Error("Kakao Share not available");

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: getShareText(),
          description: "오픈마켓 수수료 비교 — 스마트스토어, 쿠팡, 11번가, G마켓",
          imageUrl: `${window.location.origin}/favicon.png`,
          link: { mobileWebUrl: getShareUrl(), webUrl: getShareUrl() },
        },
        buttons: [
          {
            title: "수수료 비교하기",
            link: { mobileWebUrl: getShareUrl(), webUrl: getShareUrl() },
          },
        ],
      });
      trackShareEvent("ux_share_kakao_success");
    } catch {
      trackShareEvent("ux_share_kakao_fail");
      showAlert("카카오톡 공유에 실패했습니다", { type: "error" });
    } finally {
      kakaoBusy.value = false;
    }
  }

  return {
    showShareModal,
    kakaoBusy,
    shareSummary,
    openShare,
    closeShare,
    shareKakao,
    copyLink,
  };
}
