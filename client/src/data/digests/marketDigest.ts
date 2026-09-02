// /market-compare 파생 다이제스트 — 비교표가 "마켓별 요율"을 보여준다면, 여기는 요율표를
// 전 구간(5 카테고리 × 5 등급 × 2 유입 × 월매출 1만~1,000만원) 돌려서만 보이는 것을 적는다.
// 순위가 바뀌는 경계, 등급과 유입 경로의 상대 크기, 월정액이 순위를 뒤집는 창, 11번가가
// G마켓을 이기는 조건의 부재 같은 것들이다. 요율 한 줄을 인용하는 문장은 발견이 아니다.
//
// 원가·광고비는 넣지 않는다. 어느 마켓에서 팔든 같은 금액이 빠져 순위에 영향이 없다.

import {
  COUPANG,
  ELEVENST,
  GMARKET,
  MARKET_META,
  MONTHLY_FEES,
  SMARTSTORE,
  VAT_MULTIPLIER,
  monthlyFeeFor,
  type CategoryKey,
  type MarketKey,
} from "../marketFees";
import { CATEGORIES } from "../categories";
import { SETTLEMENT_CYCLES } from "../settlementCycles";
import { calcAllMarkets } from "@/utils/calculator";
import { type Finding, eun, list, manwon, pct, pp, won } from "./format";

const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);
const categoryLabel = (key: CategoryKey) => CATEGORIES.find((c) => c.key === key)!.label;
const name = (key: MarketKey) => MARKET_META[key].name;

// 순위 판정용 기준가 — 원 단위 절사가 순위를 흔들지 않을 만큼 큰 값
const RANK_PRICE = 100_000;

function rankAt(category: CategoryKey): MarketKey[] {
  return calcAllMarkets({
    price: RANK_PRICE, shippingFee: 0, category,
    smartstoreTier: "micro", smartstoreSource: "naverShopping",
    coupangMode: "marketplace", fulfillmentSize: "small",
  })
    .slice()
    .sort((a, b) => a.totalFee - b.totalFee)
    .map((r) => r.marketKey as MarketKey);
}

// 카테고리별 4마켓 순위 — 1·2위가 카테고리를 바꿔도 고정인지
function rankInvariance(): Finding {
  const ranks = CATEGORY_KEYS.map((key) => ({ key, order: rankAt(key) }));
  const firsts = new Set(ranks.map((r) => r.order[0]));
  const seconds = new Set(ranks.map((r) => r.order[1]));
  const elec = ranks.find((r) => r.key === "electronics")!;
  const gapThird = Math.abs(ELEVENST.categoryFee.electronics - GMARKET.categoryFee.electronics);
  return {
    h2: "카테고리를 다섯 번 바꿔도 1·2위는 움직이지 않는다",
    body:
      `이 비교표의 5개 카테고리 전부에 대해 영세 등급·네이버쇼핑 유입 조건으로 4개 마켓 수수료를 계산해 순위를 매기면, ` +
      `1위는 다섯 번 모두 ${list([...firsts].map(name))}, 2위는 다섯 번 모두 ${list([...seconds].map(name))}입니다. ` +
      `순위가 갈리는 자리는 3·4위 하나뿐이고, 그것도 ${categoryLabel("electronics")}에서만 일어납니다 — ` +
      `${name(elec.order[2])} ${pct(GMARKET.categoryFee.electronics)}가 ${name(elec.order[3])} ${pct(ELEVENST.categoryFee.electronics)}보다 ${pp(gapThird)} 낮아 3위에 오르고, ` +
      `나머지 네 카테고리는 두 마켓이 ${pct(ELEVENST.categoryFee.clothing)}로 같아 공동 3위입니다. ` +
      `"우리 상품은 카테고리가 특수해서 순위가 다를 것"이라는 기대는 이 데이터 안에서는 성립하지 않습니다.`,
  };
}

// 스마트스토어 최악 조합 vs 타 마켓 최저 카테고리
function worstVsBest(): Finding {
  const worst = SMARTSTORE.orderFee.normal + SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER;
  const best = Math.min(...Object.values(COUPANG.categoryFee));
  const bestCat = CATEGORY_KEYS.find((k) => COUPANG.categoryFee[k] === best)!;
  return {
    h2: "등급·유입 최악 조합도 다른 마켓의 최저 카테고리보다 낮다",
    body:
      `스마트스토어 요율은 등급 5단계와 유입 경로 2가지의 조합 10개로 결정되는데, 그중 가장 높은 조합은 일반 등급(연매출 30억 초과)이 네이버쇼핑으로 유입될 때의 ` +
      `${pct(SMARTSTORE.orderFee.normal, 3)} + ${pct(SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER, 3)} = ${pct(worst, 3)}입니다. ` +
      `다른 세 마켓의 카테고리 요율 중 가장 낮은 값은 쿠팡 ${categoryLabel(bestCat)} ${pct(best)}이고, 두 값의 차이는 ${pp(best - worst, 3)}입니다. ` +
      `즉 스마트스토어의 가장 불리한 조건이 쿠팡의 가장 유리한 조건보다 여전히 낮습니다. ` +
      `요율만 놓고 보면 매출등급이 어디까지 올라가든, 어떤 카테고리를 팔든 스마트스토어가 최저인 구조라서, 마켓 선택의 실제 변수는 요율이 아니라 노출량과 배송·정산 조건입니다.`,
  };
}

// 마켓 안 카테고리 편차 vs 같은 카테고리의 마켓 간 편차
function spreadComparison(): Finding {
  const within = (
    [["coupang", COUPANG], ["elevenst", ELEVENST], ["gmarket", GMARKET]] as const
  ).map(([key, m]) => {
    const rates = Object.values(m.categoryFee);
    return { key, spread: Math.max(...rates) - Math.min(...rates) };
  });
  const across = CATEGORY_KEYS.map((cat) => {
    const rates = [COUPANG.categoryFee[cat], ELEVENST.categoryFee[cat], GMARKET.categoryFee[cat]];
    return { cat, spread: Math.max(...rates) - Math.min(...rates) };
  }).sort((a, b) => b.spread - a.spread);
  const maxWithin = within.reduce((a, b) => (b.spread > a.spread ? b : a));
  const minWithin = within.reduce((a, b) => (b.spread < a.spread ? b : a));
  const [acrossMax, , , , acrossMin] = across;
  return {
    h2: `${categoryLabel(acrossMax.cat)}은 마켓을 고르는 문제, ${categoryLabel(acrossMin.cat)}는 카테고리를 고르는 문제`,
    body:
      `카테고리 단일 요율을 쓰는 세 마켓 안에서 카테고리 간 편차는 ${name(minWithin.key)} ${pp(minWithin.spread)}에서 ${name(maxWithin.key)} ${pp(maxWithin.spread)} 사이입니다. ` +
      `반대로 같은 카테고리를 세 마켓에 올렸을 때의 마켓 간 편차는 ${categoryLabel(acrossMin.cat)} ${pp(acrossMin.spread)}가 가장 작고 ${categoryLabel(acrossMax.cat)} ${pp(acrossMax.spread)}가 가장 큽니다. ` +
      `${categoryLabel(acrossMax.cat)}은 쿠팡 ${pct(COUPANG.categoryFee[acrossMax.cat])}와 11번가·G마켓 ${pct(ELEVENST.categoryFee[acrossMax.cat])}의 격차가 어느 마켓 안의 카테고리 편차보다 커서, 이 카테고리만은 "어느 마켓에 올리느냐"가 요율을 결정합니다. ` +
      `반면 ${eun(categoryLabel(acrossMin.cat))} 세 마켓이 ${pct(COUPANG.categoryFee[acrossMin.cat])}~${pct(ELEVENST.categoryFee[acrossMin.cat])} 안에 모여 있어 마켓보다 등록 카테고리 판정이 더 큰 변수입니다.`,
  };
}

// 유입 경로 하나 vs 등급 5단계 전체
function sourceVsTier(): Finding {
  const sourceGap = (SMARTSTORE.saleFee.naverShopping - SMARTSTORE.saleFee.marketingLink) * VAT_MULTIPLIER;
  const tierGap = SMARTSTORE.orderFee.normal - SMARTSTORE.orderFee.micro;
  const normalLink = SMARTSTORE.orderFee.normal + SMARTSTORE.saleFee.marketingLink * VAT_MULTIPLIER;
  const microShop = SMARTSTORE.orderFee.micro + SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER;
  return {
    h2: "유입 경로 하나가 매출등급 다섯 단계를 통째로 이긴다",
    body:
      `스마트스토어 판매 수수료는 네이버쇼핑 유입 ${pct(SMARTSTORE.saleFee.naverShopping)}와 마케팅링크 유입 ${pct(SMARTSTORE.saleFee.marketingLink)}(둘 다 VAT 별도)로 갈리는데, VAT를 얹어 환산하면 그 차이가 ${pp(sourceGap, 3)}입니다. ` +
      `한편 주문관리 수수료가 영세 ${pct(SMARTSTORE.orderFee.micro, 3)}에서 일반 ${pct(SMARTSTORE.orderFee.normal, 3)}까지 다섯 등급을 전부 올라가며 늘어나는 폭은 ${pp(tierGap, 3)}입니다. ` +
      `유입 경로 한 번의 차이가 등급 사다리 전체보다 큽니다. 그래서 일반 등급이 마케팅링크로 판매하면 ${pct(normalLink, 3)}, 영세 등급이 네이버쇼핑으로 판매하면 ${pct(microShop, 3)}로, ` +
      `연매출 30억 초과 판매자가 연매출 3억 이하 판매자보다 ${pp(microShop - normalLink, 3)} 낮은 요율을 내는 역전이 생깁니다. 등급은 매출이 정하지만 유입 경로는 판매자가 정할 수 있는 변수입니다.`,
  };
}

// 월정액이 켜지면서 G마켓이 쿠팡을 앞서는 월매출 창 — 카테고리별로 훑는다
interface Window { cat: CategoryKey; open: number; close: number }

function monthlyCost(market: MarketKey, unitFee: number, revenue: number): number {
  return unitFee * (revenue / SCAN_PRICE) + monthlyFeeFor(market, revenue);
}

const SCAN_PRICE = 10_000; // 1만원 단위 매출 해상도
const SCAN_MAX_REVENUE = 10_000_000;

function feeWindow(cat: CategoryKey, a: MarketKey, b: MarketKey): Window | null {
  const fees = calcAllMarkets({
    price: SCAN_PRICE, shippingFee: 0, category: cat,
    smartstoreTier: "micro", smartstoreSource: "naverShopping",
    coupangMode: "marketplace", fulfillmentSize: "small",
  });
  const unit = (k: MarketKey) => fees.find((f) => f.marketKey === k)!.totalFee;
  let open: number | null = null;
  for (let revenue = SCAN_PRICE; revenue <= SCAN_MAX_REVENUE; revenue += SCAN_PRICE) {
    const bCheaper = monthlyCost(b, unit(b), revenue) < monthlyCost(a, unit(a), revenue);
    if (open == null && bCheaper) open = revenue;
    else if (open != null && !bCheaper) return { cat, open, close: revenue };
  }
  return open == null ? null : { cat, open, close: SCAN_MAX_REVENUE };
}

function monthlyFeeWindows(): Finding {
  const windows = CATEGORY_KEYS.map((cat) => feeWindow(cat, "coupang", "gmarket")).filter((w): w is Window => w != null);
  const byWidth = windows.slice().sort((a, b) => a.close - a.open - (b.close - b.open));
  const narrowest = byWidth[0];
  const widest = byWidth[byWidth.length - 1];
  const coupangFee = MONTHLY_FEES.coupang!;
  const desc = windows.map((w) => `${categoryLabel(w.cat)} ${manwon(w.open)}~${manwon(w.close)}`);
  return {
    h2: "13% G마켓이 10.5% 쿠팡보다 싼 월매출 구간이 카테고리마다 다르게 열린다",
    body:
      `쿠팡 월정액 ${won(coupangFee.amount)}은 ${coupangFee.threshold} 시 붙습니다. 건당 수수료에 월정액을 합산해 월매출 1만원 단위로 훑으면, ` +
      `요율이 더 높은 G마켓/옥션이 쿠팡보다 월 비용이 적어지는 구간이 5개 카테고리 모두에 생깁니다(매달 같은 수량을 파는 정상 상태 가정): ${desc.join(", ")}. ` +
      `열리는 지점은 다섯 카테고리가 같은데, 닫히는 지점은 월정액 ${won(coupangFee.amount)}을 두 마켓의 요율 차이로 나눈 매출이라 카테고리마다 다릅니다. ` +
      `${eun(categoryLabel(narrowest.cat))} 요율 차이가 ${pp(GMARKET.categoryFee[narrowest.cat] - COUPANG.categoryFee[narrowest.cat])}로 커서 창이 ${manwon(narrowest.close - narrowest.open)} 폭에 그치고, ` +
      `${eun(categoryLabel(widest.cat))} 차이가 ${pp(GMARKET.categoryFee[widest.cat] - COUPANG.categoryFee[widest.cat])}에 불과해 ${manwon(widest.close - widest.open)} 폭으로 벌어집니다. ` +
      `창 안에서는 요율표의 순위와 실제 월 비용의 순위가 반대입니다.`,
  };
}

// 11번가가 G마켓보다 싼 조건이 있는가 — 전 카테고리·전 매출 구간 스캔
function elevenstNeverCheaper(): Finding {
  let cheaperCells = 0;
  let tieCells = 0;
  let total = 0;
  for (const cat of CATEGORY_KEYS) {
    const fees = calcAllMarkets({
      price: SCAN_PRICE, shippingFee: 0, category: cat,
      smartstoreTier: "micro", smartstoreSource: "naverShopping",
      coupangMode: "marketplace", fulfillmentSize: "small",
    });
    const unit = (k: MarketKey) => fees.find((f) => f.marketKey === k)!.totalFee;
    for (let revenue = SCAN_PRICE; revenue <= SCAN_MAX_REVENUE; revenue += SCAN_PRICE) {
      const e = monthlyCost("elevenst", unit("elevenst"), revenue);
      const g = monthlyCost("gmarket", unit("gmarket"), revenue);
      total += 1;
      if (e < g) cheaperCells += 1;
      else if (e === g) tieCells += 1;
    }
  }
  const e = MONTHLY_FEES.elevenst!;
  const g = MONTHLY_FEES.gmarket!;
  const elecGapAt500 = 5_000_000 * (ELEVENST.categoryFee.electronics - GMARKET.categoryFee.electronics) + (e.amount - g.amount);
  return {
    h2: `11번가가 G마켓/옥션보다 비용이 적은 칸은 ${total.toLocaleString("ko-KR")}칸 중 ${cheaperCells}칸, 전부 월매출 ${manwon(g.thresholdRevenue)} 한 줄에 있다`,
    body:
      `두 마켓은 비교표에서 네 카테고리 요율이 ${pct(ELEVENST.categoryFee.clothing)}로 같아 흔히 한 묶음으로 취급됩니다. ` +
      `5개 카테고리 × 월매출 1만~${manwon(SCAN_MAX_REVENUE)} 구간 ${total.toLocaleString("ko-KR")}칸을 전부 계산하면 11번가 월 비용이 G마켓/옥션보다 낮은 칸은 ${cheaperCells}칸, 같은 칸은 ${tieCells.toLocaleString("ko-KR")}칸, 나머지 ${(total - cheaperCells - tieCells).toLocaleString("ko-KR")}칸은 전부 G마켓/옥션이 낮습니다. ` +
      `${cheaperCells}칸은 모두 월매출 정확히 ${manwon(g.thresholdRevenue)}에 있습니다 — G마켓 월정액은 "${g.threshold}"이라 그 매출에서 이미 켜지고, 11번가는 "${e.threshold}"라 아직 꺼져 있기 때문입니다. 이상과 초과 한 글자 차이가 만드는 한 줄짜리 예외입니다. ` +
      `그 한 줄을 빼면 갈리는 원인은 둘입니다. ${categoryLabel("electronics")} 요율이 11번가 ${pct(ELEVENST.categoryFee.electronics)} 대 G마켓 ${pct(GMARKET.categoryFee.electronics)}로 ${pp(ELEVENST.categoryFee.electronics - GMARKET.categoryFee.electronics)} 벌어져 있고, ` +
      `월정액은 발동선이 둘 다 500만원 언저리인데 금액이 11번가 ${won(e.amount)} 대 G마켓 ${won(g.amount)}입니다. 두 요인이 겹치는 ${categoryLabel("electronics")} 월매출 500만원에서는 격차가 월 ${won(elecGapAt500)}에 이릅니다. ` +
      `이 데이터 안에서 11번가를 고를 비용상의 이유는 없으며, 선택 근거는 노출·프로모션 같은 요율표 밖의 것이어야 합니다.`,
  };
}

// 월정액을 %p로 환산 — 발동 직후 얼마나 무겁고 얼마나 빨리 가벼워지나
function monthlyFeeAsRate(): Finding {
  const c = MONTHLY_FEES.coupang!;
  const e = MONTHLY_FEES.elevenst!;
  const g = MONTHLY_FEES.gmarket!;
  const step = (fee: typeof c) => fee.thresholdRevenue + (fee.inclusive ? 0 : SCAN_PRICE);
  const at = (fee: typeof c, revenue: number) => fee.amount / revenue;
  const cOpen = step(c);
  return {
    h2: "월정액을 요율로 바꿔 읽으면 발동 직후가 가장 비싸고 매출이 두 배 될 때마다 절반이 된다",
    body:
      `정액 ${won(c.amount)}은 매출이 클수록 요율로는 가벼워집니다. 쿠팡 월정액이 켜지는 첫 매출 ${manwon(cOpen)}에서는 ${pp(at(c, cOpen))}에 해당해 ` +
      `${categoryLabel("clothing")} ${pct(COUPANG.categoryFee.clothing)}에 얹으면 실효 ${pct(COUPANG.categoryFee.clothing + at(c, cOpen))}가 되고, 매출이 ${manwon(cOpen * 2)}이면 ${pp(at(c, cOpen * 2))}, ${manwon(cOpen * 4)}이면 ${pp(at(c, cOpen * 4))}로 줄어듭니다. ` +
      `11번가와 G마켓/옥션은 발동선이 500만원이어서 처음부터 가볍습니다 — 11번가 ${won(e.amount)}은 ${manwon(step(e))}에서 ${pp(at(e, step(e)))}, G마켓 ${won(g.amount)}은 ${manwon(step(g))}에서 ${pp(at(g, step(g)))}입니다. ` +
      `같은 55,000원이라도 쿠팡은 100만원에서, G마켓은 500만원에서 켜지기 때문에 발동 순간의 체감 부담은 쿠팡이 ${(at(c, cOpen) / at(g, step(g))).toFixed(1)}배 무겁습니다. 월정액을 볼 때는 금액이 아니라 "내 매출에서 몇 %p인가"로 환산해야 마켓 간 비교가 됩니다.`,
  };
}

// 정산 — 같은 매출을 언제 얼마나 손에 쥐는가
function settlementTiming(): Finding {
  const coupang = SETTLEMENT_CYCLES.coupang;
  const weekly = coupang.variants[0];
  const base = 1_000_000;
  // 지급 비율은 정산주기 데이터의 문구("… 70% 지급")에서 읽는다 — 여기 숫자를 따로 적지 않는다
  const firstRatio = Number(weekly.timing.match(/(\d+)%/)![1]) / 100;
  const first = base * firstRatio;
  return {
    h2: "같은 100만원 매출도 마켓에 따라 첫 정산에 들어오는 돈이 다르다",
    body:
      `정산주기 열은 날짜만 보여주지만 지급 비율까지 합쳐 읽으면 그림이 달라집니다. 구매확정된 매출 ${manwon(base)}을 기준으로, ` +
      `${SETTLEMENT_CYCLES.smartstore.marketName}(${SETTLEMENT_CYCLES.smartstore.summary})·${SETTLEMENT_CYCLES.gmarket.marketName}(${SETTLEMENT_CYCLES.gmarket.summary})·${SETTLEMENT_CYCLES.elevenst.marketName}(${SETTLEMENT_CYCLES.elevenst.summary})는 첫 정산에 전액이 들어옵니다. ` +
      `${coupang.marketName} ${weekly.label}은 "${weekly.timing}, ${weekly.condition}"이므로 매출 ${manwon(base)}의 첫 정산액은 ${won(first)}이고 ${won(base - first)}은 다음 달로 넘어갑니다. ` +
      `즉 쿠팡만 같은 매출이 두 번으로 나뉘어 들어오며, 첫 지급까지의 시차도 다른 세 마켓(1~2영업일)보다 15영업일로 가장 깁니다. ` +
      `수수료가 마진을 줄이는 것과 별개로, 이 시차는 재고를 현금으로 다시 사야 하는 판매자에게 운전자금 부담으로 작용합니다. 기산점(${coupang.confirmBasis})까지 포함하면 판매일로부터의 실제 회수 기간은 더 길어집니다.`,
  };
}

export const MARKET_COMPARE_DIGEST: Finding[] = [
  rankInvariance(),
  worstVsBest(),
  spreadComparison(),
  sourceVsTier(),
  monthlyFeeWindows(),
  elevenstNeverCheaper(),
  monthlyFeeAsRate(),
  settlementTiming(),
];
