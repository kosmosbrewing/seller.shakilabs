// /payment-compare 파생 다이제스트 — 비교표는 "영세 요율"과 등급표를 보여주지만, 여기는
// PG 5종 × 매출등급 5단계 = 25칸을 VAT 기준을 맞춰 전부 환산해야 보이는 것을 적는다:
// VAT 환산 뒤 소수점까지 같아지는 쌍, 등급 상승의 기울기 차이, 고정비를 요율로 바꾼 값,
// 상한 폴백으로 계산되는 칸의 정체, 스마트스토어와의 격차가 등급과 무관한 이유.

import {
  OWN_STORE_META,
  OWN_STORE_ORDER,
  OWN_STORE_RATES,
  SMARTSTORE,
  SMARTSTORE_TIER_LABELS,
  VAT_MULTIPLIER,
  isOwnStoreVatExclusive,
  resolveOwnStoreEffectiveRate,
  type OwnStoreKey,
  type SmartStoreTier,
} from "../marketFees";
import { PAYMENT_GATEWAYS } from "../paymentGateways";
import { DEFAULT_PRICE } from "../pricePresets";
import { calcOwnStore } from "@/utils/calculator";
import { type Finding, list, manwon, pct, pp, times, won } from "./format";

const TIERS: SmartStoreTier[] = ["micro", "small1", "small2", "small3", "normal"];
const tierLabel = (t: SmartStoreTier) => SMARTSTORE_TIER_LABELS[t].split(" ")[0];
// 비교표의 PG 이름("네이버페이 결제형")으로 부른다 — 계산기 채널명("자사몰 · …")과 같은 대상
const name = (key: OwnStoreKey) => OWN_STORE_META[key].name.replace("자사몰 · ", "");
const eff = (key: OwnStoreKey, tier: SmartStoreTier) => resolveOwnStoreEffectiveRate(key, tier);

// VAT 환산 뒤 같아지는 쌍
function vatTies(): Finding {
  const ties = TIERS.filter((t) => Math.abs(eff("own_kakaopay", t) - eff("own_naverpay", t)) < 1e-9);
  const firstSplit = TIERS.find((t) => !ties.includes(t))!;
  return {
    h2: "VAT를 맞추면 카카오페이와 네이버페이 결제형은 두 등급에서 소수점 셋째 자리까지 같다",
    body:
      `비교표의 카카오페이 요율은 VAT 별도, 네이버페이 결제형은 VAT 포함이라 그대로 읽으면 카카오페이가 늘 싸 보입니다. ` +
      `카카오페이에 VAT ${pct(VAT_MULTIPLIER - 1, 0)}를 얹어 같은 기준으로 만들면 ${list(ties.map((t) => `${tierLabel(t)} ${pct(eff("own_kakaopay", t), 3)}`))}로 두 등급에서 네이버페이 결제형과 완전히 같은 값이 됩니다. ` +
      `갈라지는 것은 ${tierLabel(firstSplit)}부터입니다 — 카카오페이 ${pct(eff("own_kakaopay", firstSplit), 3)} 대 네이버페이 결제형 ${pct(eff("own_naverpay", firstSplit), 3)}, 차이 ${pp(eff("own_kakaopay", firstSplit) - eff("own_naverpay", firstSplit), 3)}. ` +
      `일반 등급에서는 ${pct(eff("own_kakaopay", "normal"), 3)} 대 ${pct(eff("own_naverpay", "normal"), 3)}로 ${pp(eff("own_kakaopay", "normal") - eff("own_naverpay", "normal"), 3)}까지 벌어집니다. ` +
      `연매출 5억 이하 판매자에게 둘의 차이는 요율이 아니라 결제 수단 구성과 연동 방식이고, 그 위부터는 요율이 갈리기 시작합니다.`,
  };
}

// 등급 상승 기울기
function tierSlope(): Finding {
  const slopes = OWN_STORE_ORDER.map((key) => ({
    key, lo: eff(key, "micro"), hi: eff(key, "normal"), mult: eff(key, "normal") / eff(key, "micro"),
  })).sort((a, b) => b.mult - a.mult);
  const steep = slopes[0];
  const flat = slopes.filter((s) => s.mult === 1);
  const mid = slopes.find((s) => s.key === "own_naverorder")!;
  return {
    h2: `영세에서 일반으로 올라갈 때 ${name(steep.key)}는 ${times(steep.hi, steep.lo)}, ${name(mid.key)}은 ${times(mid.hi, mid.lo)}`,
    body:
      `등급표를 세로로 읽으면 PG마다 기울기가 다릅니다. VAT 포함 환산 기준으로 영세→일반 요율은 ${list(slopes.filter((s) => s.mult > 1).map((s) => `${name(s.key)} ${pct(s.lo, 3)}→${pct(s.hi, 3)}(${times(s.hi, s.lo)})`))}이고, ` +
      `${list(flat.map((s) => name(s.key)))}는 공개 요율이 일반 ${pct(flat[0].hi, 3)} 하나라 기울기가 없습니다. ` +
      `가장 가파른 ${name(steep.key)}는 영세에서 가장 싼 축이지만 일반에서는 ${pct(steep.hi, 3)}로 ${name("own_naverpay")} ${pct(eff("own_naverpay", "normal"), 3)}와 ${pp(steep.hi - eff("own_naverpay", "normal"), 3)} 벌어집니다. ` +
      `즉 "영세 때 싼 PG"와 "성장한 뒤 싼 PG"는 다를 수 있어, 매출이 5억을 넘길 계획이라면 영세 열이 아니라 일반 열의 순위를 봐야 합니다.`,
  };
}

// 등급별 최고·최저 격차 — 등급이 오르면 PG 간 차이가 좁아진다
function spreadByTier(): Finding {
  const rows = TIERS.map((t) => {
    const fees = OWN_STORE_ORDER.map((k) => ({ k, fee: calcOwnStore(DEFAULT_PRICE, k, t).totalFee })).sort((a, b) => a.fee - b.fee);
    return { t, min: fees[0], max: fees[fees.length - 1] };
  });
  const micro = rows[0];
  const normal = rows[rows.length - 1];
  return {
    h2: `판매가 ${won(DEFAULT_PRICE)} 기준 PG 간 격차는 영세 ${times(micro.max.fee, micro.min.fee)}에서 일반 ${times(normal.max.fee, normal.min.fee)}로 줄어든다`,
    body:
      `같은 ${won(DEFAULT_PRICE)}짜리 한 건의 결제 수수료를 25칸 전부 계산하면, 영세에서는 ${name(micro.min.k)} ${won(micro.min.fee)}과 ${name(micro.max.k)} ${won(micro.max.fee)}이 ${won(micro.max.fee - micro.min.fee)} 차이로 ${times(micro.max.fee, micro.min.fee)}입니다. ` +
      `일반 등급에서는 ${name(normal.min.k)} ${won(normal.min.fee)}과 ${name(normal.max.k)} ${won(normal.max.fee)}으로 격차가 ${won(normal.max.fee - normal.min.fee)}, ${times(normal.max.fee, normal.min.fee)}에 그칩니다. ` +
      `등급이 오를수록 우대 요율이 사라지며 5사가 3% 안팎으로 모이기 때문입니다. ` +
      `영세 구간에서 PG를 고르는 일은 건당 ${won(micro.max.fee - micro.min.fee)}을 좌우하지만, 일반 구간에서는 ${won(normal.max.fee - normal.min.fee)}짜리 결정이라 요율보다 결제 수단 범위와 정산 조건이 결정 변수가 됩니다.`,
  };
}

// PAYCO 중간 등급 폴백의 정체
function paycoFallback(): Finding {
  const published = Object.entries(OWN_STORE_RATES.own_payco).map(([t]) => t as SmartStoreTier);
  const fallbackTiers = TIERS.filter((t) => !published.includes(t));
  return {
    h2: `페이코 ${list(fallbackTiers.map(tierLabel))} 칸은 실제 요율이 아니라 공개 상한이다`,
    body:
      `페이코는 공개 범위가 영세 ${pct(OWN_STORE_RATES.own_payco.micro!)}~일반 ${pct(OWN_STORE_RATES.own_payco.normal!)}(VAT 별도) 둘뿐이고 중간 등급표를 공개하지 않습니다. ` +
      `이 계산기는 공개되지 않은 ${list(fallbackTiers.map(tierLabel))} 세 등급에 상한 ${pct(OWN_STORE_RATES.own_payco.normal!)}를 보수적으로 대입하므로, 그 칸의 VAT 포함 ${pct(eff("own_payco", "small1"), 3)}는 "이보다 비쌀 수 없다"는 최댓값입니다. ` +
      `같은 등급에서 토스페이먼츠도 ${pct(eff("own_tosspay", "small1"), 3)}로 값이 같아 보이지만, 토스는 공개 일반 요율이 그 값이고 페이코는 폴백이라 성격이 다릅니다. ` +
      `실제 중소 등급 페이코 요율은 영세 ${pct(eff("own_payco", "micro"), 3)}와 상한 ${pct(eff("own_payco", "normal"), 3)} 사이 어딘가일 가능성이 높고, 정확한 값은 문의로만 확인됩니다. 이 페이지는 확인되지 않은 숫자를 확인된 것처럼 적지 않습니다.`,
  };
}

// 토스 고정비를 요율로 환산
function tossFixedCost(): Finding {
  const toss = PAYMENT_GATEWAYS.find((g) => g.key === "tosspayments")!;
  const fixed = toss.fixedFees!;
  const revenues = [10_000_000, 100_000_000, 300_000_000];
  const firstYear = (r: number) => (fixed.setup + fixed.annual) / r;
  const later = (r: number) => fixed.annual / r;
  return {
    h2: `토스페이먼츠 고정비 첫해 ${won(fixed.setup + fixed.annual)}은 연매출 ${manwon(revenues[0])}에서 ${pp(firstYear(revenues[0]), 1)}, ${manwon(revenues[2])}에서 ${pp(firstYear(revenues[2]), 2)}`,
    body:
      `5종 중 토스페이먼츠만 설정비 ${won(fixed.setup)}(1회)과 연 이용료 ${won(fixed.annual)}이 붙습니다. 이를 요율로 환산하면 연매출에 따라 무게가 달라집니다: ` +
      `첫해는 ${list(revenues.map((r) => `${manwon(r)} 매출에 ${pp(firstYear(r), 2)}`))}, 이듬해부터는 ${list(revenues.map((r) => `${pp(later(r), 2)}`))}입니다. ` +
      `공개 일반 요율 ${pct(eff("own_tosspay", "normal"), 3)}(VAT 포함)에 이 고정분을 얹으면 연매출 ${manwon(revenues[0])} 판매자의 첫해 실효율은 ${pct(eff("own_tosspay", "normal") + firstYear(revenues[0]), 2)}가 됩니다. ` +
      `요율 25칸 어디에서도 토스페이먼츠가 최저인 칸은 없으므로, 이 PG의 선택 근거는 요율이 아니라 카드·계좌이체·가상계좌를 한 계약으로 묶는 단독 PG 인프라입니다. 영세 구간 소액 판매자에게는 고정비가 요율보다 큰 항목일 수 있습니다.`,
  };
}

// 자사몰 결제형 vs 스마트스토어 — 등급과 무관한 격차
function ownVsSmartstore(): Finding {
  const gaps = TIERS.map((t) => {
    const ss = SMARTSTORE.orderFee[t] + SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER;
    return { t, gap: ss - eff("own_naverpay", t) };
  });
  const maxGap = Math.max(...gaps.map((g) => g.gap));
  const minGap = Math.min(...gaps.map((g) => g.gap));
  const saleFee = SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER;
  return {
    h2: `자사몰 네이버페이 결제형과 스마트스토어의 격차는 어느 등급에서도 ${pp(minGap, 2)}~${pp(maxGap, 2)}`,
    body:
      `스마트스토어 주문관리 수수료와 네이버페이 주문형 요율은 다섯 등급 모두 같은 숫자(영세 ${pct(SMARTSTORE.orderFee.micro, 3)}~일반 ${pct(SMARTSTORE.orderFee.normal, 3)})입니다. ` +
      `그래서 스마트스토어 대 자사몰 결제형의 차이는 등급마다 ${list(gaps.map((g) => `${tierLabel(g.t)} ${pp(g.gap, 3)}`))}로 거의 일정합니다. ` +
      `이 격차의 대부분은 네이버쇼핑 판매 수수료 ${pct(saleFee, 3)}(VAT 포함 환산)이고, 나머지는 주문관리 요율과 결제형 요율의 등급별 차이입니다. ` +
      `즉 자사몰로 옮겨 아끼는 약 ${pp(minGap, 1)}는 등급이 올라도 줄지 않는 대신, 그 값은 네이버쇼핑이 대신 만들어주던 검색 노출을 스스로 대체하는 비용과 맞바꾸는 것입니다. 마케팅링크 유입(판매 수수료 ${pct(SMARTSTORE.saleFee.marketingLink * VAT_MULTIPLIER, 3)})으로 팔 수 있는 판매자라면 격차는 ${pp(minGap - (saleFee - SMARTSTORE.saleFee.marketingLink * VAT_MULTIPLIER), 2)} 안팎으로 좁아집니다.`,
  };
}

// VAT 별도 표기 PG의 실부담 순위 변화
function vatReorder(): Finding {
  const raw = OWN_STORE_ORDER.map((k) => ({ k, raw: OWN_STORE_RATES[k].micro ?? OWN_STORE_RATES[k].normal!, eff: eff(k, "micro"), excl: isOwnStoreVatExclusive(k) }));
  const byRaw = raw.slice().sort((a, b) => a.raw - b.raw).map((r) => r.k);
  const byEff = raw.slice().sort((a, b) => a.eff - b.eff).map((r) => r.k);
  const excl = raw.filter((r) => r.excl);
  const payco = raw.find((r) => r.k === "own_payco")!;
  const order = raw.find((r) => r.k === "own_naverorder")!;
  return {
    h2: "표의 숫자 순서와 실부담 순서가 다른 자리가 하나 있다",
    body:
      `PG 5종 중 ${list(excl.map((r) => name(r.k)))} 셋은 VAT 별도, 나머지 둘은 VAT 포함으로 공개돼 있어 표의 숫자를 그대로 줄 세우면 안 됩니다. ` +
      `영세 요율을 공개값 그대로 정렬하면 ${byRaw.map(name).join(" < ")} 순이지만, VAT 별도 셋에 ${pct(VAT_MULTIPLIER - 1, 0)}를 얹어 실부담으로 바꾸면 ${byEff.map(name).join(" ≤ ")} 순으로 바뀝니다. ` +
      `자리가 바뀌는 쌍은 ${name(payco.k)}와 ${name(order.k)}입니다 — 공개값은 ${pct(payco.raw)} 대 ${pct(order.raw, 3)}로 페이코가 낮지만, 실부담은 ${pct(payco.eff, 3)} 대 ${pct(order.eff, 3)}로 ${pp(payco.eff - order.eff, 3)} 차이로 뒤집힙니다. ` +
      `이 계산기의 비교표는 VAT 기준을 각 칸에 병기하고 계산은 실부담으로 통일하므로, 표를 읽을 때도 별도/포함 표기를 먼저 확인해야 합니다.`,
  };
}

// 등급별 최저 PG 요약
function cheapestByTier(): Finding {
  const rows = TIERS.map((t) => {
    const sorted = OWN_STORE_ORDER.map((k) => ({ k, r: eff(k, t) })).sort((a, b) => a.r - b.r);
    const min = sorted[0].r;
    return { t, winners: sorted.filter((s) => Math.abs(s.r - min) < 1e-9).map((s) => s.k), rate: min };
  });
  const soleFrom = rows.find((r) => r.winners.length === 1)!;
  return {
    h2: `최저 요율 PG는 ${tierLabel(soleFrom.t)}부터 ${name(soleFrom.winners[0])} 단독이 된다`,
    body:
      `25칸에서 등급별 최저 실부담을 뽑으면 ${list(rows.map((r) => `${tierLabel(r.t)} ${pct(r.rate, 3)}(${r.winners.map(name).join("=")})`))}입니다. ` +
      `영세·중소1은 두 PG가 공동 최저이고 ${tierLabel(soleFrom.t)}부터 ${name(soleFrom.winners[0])}이 단독 최저로 남아 일반까지 유지됩니다. ` +
      `최저 요율이 영세 ${pct(rows[0].rate, 3)}에서 일반 ${pct(rows[rows.length - 1].rate, 3)}로 ${times(rows[rows.length - 1].rate, rows[0].rate)} 오르는 동안, 최저 PG의 이름은 한 번만 바뀝니다. ` +
      `단독 사용이 불가능한 PG(결제형은 별도 PG 병행 필수)라는 조건은 이 표에 없으므로, 최저 요율만 보고 결제 구성을 결정하면 병행 PG 비용이 빠집니다.`,
  };
}

export const PAYMENT_DIGEST: Finding[] = [
  vatTies(),
  tierSlope(),
  spreadByTier(),
  paycoFallback(),
  tossFixedCost(),
  ownVsSmartstore(),
  vatReorder(),
  cheapestByTier(),
];
