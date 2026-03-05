import { computed, ref } from "vue";
import { showAlert } from "./useAlert";
import { formatWon, formatWonShort } from "@/lib/utils";
import { buildAbsoluteUrl, copyToClipboard } from "@/lib/routeState";
import type { FeeBreakdown } from "@/utils/calculator";
import { MARKET_META, type MarketKey } from "@/data/marketFees";
import type { CategoryKey } from "@/data/marketFees";
import { CATEGORY_MAP } from "@/data/categories";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: Record<string, unknown>) => void;
      };
    };
  }
}

let kakaoSdkPromise: Promise<void> | null = null;

interface ShareContext {
  price: { value: number };
  category: { value: CategoryKey };
  bestMarket: { value: FeeBreakdown | null };
  monthlyQty: { value: number };
}

export function useShare(ctx: ShareContext) {
  const showShareModal = ref(false);
  const kakaoBusy = ref(false);

  const shareSummary = computed(() => {
    const cat = CATEGORY_MAP[ctx.category.value]?.label ?? "";
    const best = ctx.bestMarket.value;
    if (!best) return "";
    const marketName = MARKET_META[best.marketKey].name;
    return `판매가 ${formatWon(ctx.price.value)} ${cat} → ${marketName} 수수료 ${formatWon(best.totalFee)} (${(best.totalFeeRate * 100).toFixed(1)}%)`;
  });

  function openShare(): void {
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
      qty: ctx.monthlyQty.value !== 100 ? ctx.monthlyQty.value : null,
    });
  }

  function getShareText(): string {
    const best = ctx.bestMarket.value;
    if (!best) return "오픈마켓 수수료 비교 계산기";
    const marketName = MARKET_META[best.marketKey].name;
    const cat = CATEGORY_MAP[ctx.category.value]?.label ?? "";
    return `판매가 ${formatWon(ctx.price.value)} ${cat} → ${marketName}가 가장 유리 (2025 기준)`;
  }

  async function copyLink(): Promise<void> {
    const shareUrl = getShareUrl();
    const copied = await copyToClipboard(shareUrl);
    try {
      if (!copied) {
        throw new Error("Clipboard API unavailable");
      }
      showAlert("링크가 복사되었습니다");
    } catch {
      showAlert("링크 복사에 실패했습니다", { type: "error" });
    }
  }

  async function ensureKakaoSdk(): Promise<void> {
    if (window.Kakao) return;
    if (kakaoSdkPromise) return kakaoSdkPromise;

    const key = (import.meta.env.VITE_KAKAO_JS_KEY || "").trim();
    if (!key) throw new Error("KAKAO_JS_KEY not configured");

    kakaoSdkPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
      if (existing) {
        if (window.Kakao) { resolve(); return; }
        if (existing.dataset.loaded === "true") { reject(new Error("Kakao SDK not available")); return; }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Kakao SDK load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
      script.async = true;
      script.dataset.kakaoSdk = "true";
      script.onload = () => { script.dataset.loaded = "true"; resolve(); };
      script.onerror = () => reject(new Error("Kakao SDK load failed"));
      document.head.appendChild(script);
    }).then(() => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key);
      }
    }).finally(() => {
      if (!window.Kakao) kakaoSdkPromise = null;
    });

    return kakaoSdkPromise;
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
    } catch {
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
