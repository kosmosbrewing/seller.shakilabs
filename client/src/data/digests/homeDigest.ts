// 홈(계산기) 파생 다이제스트 — 계산기는 "내 판매가 하나"의 답을 주지만, 여기는 가격 프리셋
// 1만~30만원 × 수량 프리셋 50~500건을 전부 돌려 가격이 바뀔 때만 보이는 것을 적는다:
// 배송비 수수료의 비중 붕괴, 무료배송 전환 비용, 로켓그로스가 13% 마켓보다 비싸지는 판매가 상한,
// 매출등급 선택기가 실제로 움직이는 조합의 수, 연간 격차 같은 것들이다.
// 원가·광고비는 넣지 않는다 — 어느 마켓이든 같은 금액이 빠져 순위에 영향이 없다.

import {
  COUPANG,
  ELEVENST,
  FULFILLMENT_SIZE_LABELS,
  MARKET_META,
  OWN_STORE_META,
  SMARTSTORE,
  SMARTSTORE_TIER_LABELS,
  VAT_MULTIPLIER,
  monthlyFeeFor,
  type CompareKey,
  type FulfillmentSize,
  type MarketKey,
} from "../marketFees";
import { CATEGORY_MAP } from "../categories";
import { DEFAULT_MONTHLY_QTY, DEFAULT_PRICE, DEFAULT_SHIPPING_FEE, PRICE_PRESETS, QTY_PRESETS } from "../pricePresets";
import { calcAllMarkets, calcMonthlySim, estimateTier, type CompareInput, type FeeBreakdown } from "@/utils/calculator";
import { type Finding, list, manwon, pct, pp, times, won } from "./format";

// "소형 (30cm·1kg 이하)" → "소형" — 산문 안에서는 규격 괄호가 문장을 끊는다
const sizeName = (size: FulfillmentSize) => FULFILLMENT_SIZE_LABELS[size].split(" ")[0];

// 계산기 초기 화면과 같은 조건 — 화면 결과와 산문 숫자가 1원도 어긋나지 않게 한다
const BASE: CompareInput = {
  price: DEFAULT_PRICE, shippingFee: DEFAULT_SHIPPING_FEE, category: "clothing",
  smartstoreTier: "micro", smartstoreSource: "naverShopping",
  coupangMode: "marketplace", fulfillmentSize: "small",
};
const CATEGORY = CATEGORY_MAP[BASE.category].label;
const FLAT_RATE = ELEVENST.categoryFee[BASE.category];
const name = (key: CompareKey) => (key in MARKET_META ? MARKET_META[key as MarketKey] : OWN_STORE_META[key as Exclude<CompareKey, MarketKey>]).name;
const fee = (rows: FeeBreakdown[], key: CompareKey) => rows.find((r) => r.marketKey === key)!;

function feesAt(price: number, overrides: Partial<CompareInput> = {}) {
  return calcAllMarkets({ ...BASE, price, ...overrides });
}

// 가격 5단계에서 배송비 수수료가 총수수료에서 차지하는 비중
function shippingShare(): Finding {
  const rows = PRICE_PRESETS.map((p) => {
    const ss = fee(feesAt(p.value), "smartstore");
    const shipItem = ss.items.find((i) => i.label === "배송비 수수료")!.amount;
    return { price: p.value, total: ss.totalFee, ship: shipItem, share: shipItem / ss.totalFee };
  });
  const lo = rows[0];
  const hi = rows[rows.length - 1];
  const gmLo = fee(feesAt(lo.price), "gmarket").totalFee;
  const gmHi = fee(feesAt(hi.price), "gmarket").totalFee;
  return {
    h2: "판매가가 30배 되면 배송비 수수료의 비중은 10%에서 0.4%로 무너진다",
    body:
      `배송비 ${won(BASE.shippingFee)}을 따로 받는 초기 조건에서 스마트스토어 영세 총수수료는 ${won(lo.price)} 상품 ${won(lo.total)}, ${won(hi.price)} 상품 ${won(hi.total)}입니다. ` +
      `이 안의 배송비 수수료는 판매가와 무관하게 ${won(lo.ship)}으로 고정이라, 총수수료 대비 비중이 ${pct(lo.share, 1)}에서 ${pct(hi.share, 1)}로 내려갑니다. ` +
      `13% 마켓과의 건당 격차는 ${won(lo.price)}에서 ${won(gmLo - lo.total)}, ${won(hi.price)}에서 ${won(gmHi - hi.total)}으로 ${times(gmHi - hi.total, gmLo - lo.total)} 벌어지는데, 가격이 ${times(hi.price, lo.price, 0)} 커진 것보다 조금 덜 벌어지는 이유가 바로 이 고정분입니다. ` +
      `저가 상품에서는 "배송비를 어떻게 받느냐"가, 고가 상품에서는 "어느 마켓이냐"가 수수료를 좌우합니다.`,
  };
}

// 배송비를 판매가에 녹였을 때(무료배송) 추가로 붙는 수수료
function freeShippingPenalty(): Finding {
  const paid = feesAt(BASE.price);
  const folded = feesAt(BASE.price + BASE.shippingFee, { shippingFee: 0 });
  const delta = (key: MarketKey) => fee(folded, key).totalFee - fee(paid, key).totalFee;
  const keys: MarketKey[] = ["smartstore", "coupang", "gmarket"];
  const smallest = keys.reduce((a, b) => (delta(b) < delta(a) ? b : a));
  const largest = keys.reduce((a, b) => (delta(b) > delta(a) ? b : a));
  return {
    h2: "무료배송으로 바꾸면 같은 3,000원에 3.3% 대신 카테고리 요율이 붙는다",
    body:
      `판매가 ${won(BASE.price)} + 배송비 ${won(BASE.shippingFee)}(유료)과, 배송비를 녹인 판매가 ${won(BASE.price + BASE.shippingFee)}(무료배송)은 구매자가 내는 돈이 같습니다. ` +
      `그런데 유료배송의 배송비에는 쿠팡·11번가·G마켓 ${pct(COUPANG.shippingFeeRate)}, 스마트스토어는 주문관리 요율만 붙는 반면, 무료배송으로 녹이면 그 ${won(BASE.shippingFee)}에도 상품 요율이 통째로 적용됩니다. ` +
      `초기 조건(${CATEGORY}·영세·네이버쇼핑)에서 그 차액은 ${name(smallest)} ${won(delta(smallest))}, ${name("coupang")} ${won(delta("coupang"))}, ${name(largest)} ${won(delta(largest))}입니다. ` +
      `요율이 높은 마켓일수록 무료배송 전환의 숨은 비용이 크고, 월 ${DEFAULT_MONTHLY_QTY}건이면 ${name(largest)}에서 연 ${won(delta(largest) * DEFAULT_MONTHLY_QTY * 12)}이 됩니다. 무료배송의 전환율 효과는 이 금액과 견줘야 합니다.`,
  };
}

// 로켓그로스가 13% 마켓보다 비싸지는 판매가 상한 — 물류 크기 6단계별
function rocketCeilings(): Finding {
  const gap = FLAT_RATE - COUPANG.categoryFee[BASE.category];
  const sizes = Object.keys(COUPANG.fulfillmentFee) as FulfillmentSize[];
  const ceilings = sizes.map((size) => {
    const ceiling = Math.round(COUPANG.fulfillmentFee[size] / gap);
    // 엔진 검증: 상한 판매가에서 로켓그로스 총수수료 == 13% 마켓 총수수료 (배송비 0 기준)
    const rows = feesAt(ceiling, { coupangMode: "rocketGrowth", fulfillmentSize: size, shippingFee: 0 });
    const diff = fee(rows, "coupang").totalFee - fee(rows, "gmarket").totalFee;
    return { size, ceiling, diff };
  });
  const small = ceilings.find((c) => c.size === "small")!;
  const xs = ceilings[0];
  const xxl = ceilings[ceilings.length - 1];
  return {
    h2: `로켓그로스 ${CATEGORY}이 13% 마켓보다 비싸지는 판매가 상한은 물류 크기마다 다르다`,
    body:
      `로켓그로스는 판매 수수료 ${pct(COUPANG.categoryFee[BASE.category])}에 건당 물류비가 정액으로 더해집니다. 11번가·G마켓 ${pct(FLAT_RATE)}와의 요율 차이 ${pp(gap)}가 물류비를 흡수하는 판매가가 손익 경계인데, ` +
      `물류비 6단계를 전부 계산하면 ${sizeName(xs.size)} ${won(xs.ceiling)}부터 ${sizeName(xxl.size)} ${won(xxl.ceiling)}까지 벌어집니다. ` +
      `계산기 초기값인 ${sizeName(small.size)} 기준 경계는 ${won(small.ceiling)}으로, 이 가격 아래에서는 로켓그로스 총수수료가 13% 마켓을 넘어서고 위에서는 13% 마켓보다 낮아집니다(경계 가격에서 두 값의 차이 ${won(Math.abs(small.diff))}, 배송비 0 기준). ` +
      `초기 판매가 ${won(BASE.price)}은 이 경계 아래라 초기 화면에서 로켓그로스를 켜면 쿠팡이 11번가·G마켓 뒤로 밀립니다. 물류비는 정액이므로 판매가가 낮을수록, 상자가 클수록 불리해지는 구조입니다.`,
  };
}

// 물류비를 %p로 환산 — 가격 5단계 × 크기 6단계
function fulfillmentAsRate(): Finding {
  const prices = PRICE_PRESETS.map((p) => p.value);
  const sizes = Object.keys(COUPANG.fulfillmentFee) as FulfillmentSize[];
  const heaviest = COUPANG.fulfillmentFee[sizes[0]] / prices[0];
  const lightest = COUPANG.fulfillmentFee[sizes[sizes.length - 1]] / prices[prices.length - 1];
  const smallAtBase = COUPANG.fulfillmentFee.small / BASE.price;
  return {
    h2: "물류비를 요율로 환산하면 상자 크기 6단계보다 판매가 5단계가 더 큰 변수다",
    body:
      `로켓그로스 물류비는 ${sizeName(sizes[0])} ${won(COUPANG.fulfillmentFee[sizes[0]])}에서 ${sizeName(sizes[sizes.length - 1])} ${won(COUPANG.fulfillmentFee[sizes[sizes.length - 1]])}까지 ${times(COUPANG.fulfillmentFee[sizes[sizes.length - 1]], COUPANG.fulfillmentFee[sizes[0]])} 차이지만, ` +
      `가격 프리셋은 ${won(prices[0])}에서 ${won(prices[prices.length - 1])}까지 ${times(prices[prices.length - 1], prices[0], 0)} 차이입니다. ` +
      `그래서 판매가 대비 물류비는 ${won(prices[0])} ${sizeName(sizes[0])}에서 ${pp(heaviest)}로 가장 무겁고(판매 수수료와 합치면 ${pct(COUPANG.categoryFee[BASE.category] + heaviest)}), ` +
      `${won(prices[prices.length - 1])} ${sizeName(sizes[sizes.length - 1])}에서 ${pp(lightest)}로 가장 가볍습니다. 초기 조건(${won(BASE.price)}·${sizeName("small")})은 ${pp(smallAtBase)}입니다. ` +
      `같은 소형 상자라도 1만원짜리와 30만원짜리의 물류비 부담은 ${times(COUPANG.fulfillmentFee.small / prices[0], COUPANG.fulfillmentFee.small / prices[prices.length - 1], 0)} 차이가 나므로, 로켓그로스 판단은 크기표보다 판매가부터 봐야 합니다.`,
  };
}

// 가격×수량 프리셋 20조합 중 영세를 벗어나는 조합
function tierPresetReach(): Finding {
  const combos = PRICE_PRESETS.flatMap((p) => QTY_PRESETS.map((q) => ({ price: p.value, qty: q.value, ...estimateTier(p.value, q.value) })));
  const beyond = combos.filter((c) => c.recommendedTier !== "micro");
  const top = beyond.reduce((a, b) => (b.estimatedRevenue > a.estimatedRevenue ? b : a), beyond[0]);
  // 연매출이 상한을 '초과'해야 벗어나므로 floor+1
  const minQtyAtBase = Math.floor(300_000_000 / 12 / BASE.price) + 1;
  return {
    h2: `가격·수량 프리셋 ${combos.length}조합 중 영세 등급을 벗어나는 조합은 ${beyond.length}개뿐이다`,
    body:
      `스마트스토어 매출등급은 연매출로 정해지고 영세 상한은 ${manwon(300_000_000)}입니다. 계산기의 가격 프리셋 ${PRICE_PRESETS.length}개와 월 판매량 프리셋 ${QTY_PRESETS.length}개를 전부 조합해 연매출을 추정하면, ` +
      `${combos.length}조합 중 ${beyond.length}개만 영세를 벗어납니다: ${list(beyond.map((c) => `${won(c.price)}×${c.qty}건(${SMARTSTORE_TIER_LABELS[c.recommendedTier]})`))}. ` +
      `가장 큰 조합인 ${won(top.price)}×월 ${top.qty}건도 연매출 ${manwon(top.estimatedRevenue)}으로 ${SMARTSTORE_TIER_LABELS[top.recommendedTier]}에 머뭅니다. ` +
      `초기 판매가 ${won(BASE.price)}이라면 월 ${minQtyAtBase.toLocaleString("ko-KR")}건 이상을 팔아야 영세를 벗어나므로, 대다수 판매자에게 등급 선택기는 영세에 고정된 채 유입 경로 선택기만 실제로 요율을 바꿉니다. 등급 걱정은 월 매출 ${manwon(300_000_000 / 12)} 선을 넘을 때 시작하면 됩니다.`,
  };
}

// 월 100건 시뮬레이션 — 연간 격차
function annualGap(): Finding {
  const rows = calcMonthlySim(feesAt(BASE.price), DEFAULT_MONTHLY_QTY);
  const byDiff = rows.slice().sort((a, b) => a.annualDiff - b.annualDiff);
  const best = byDiff[0];
  const worst = byDiff[byDiff.length - 1];
  const coupang = rows.find((r) => r.marketKey === "coupang")!;
  const revenue = BASE.price * DEFAULT_MONTHLY_QTY;
  const coupangMonthly = monthlyFeeFor("coupang", revenue);
  const monthlyNote = coupangMonthly > 0
    ? `월 ${DEFAULT_MONTHLY_QTY}건은 월매출 ${manwon(revenue)}으로 쿠팡 월정액 발동선을 넘기 때문에, 시뮬레이션 표 밖에서 쿠팡에는 연 ${won(coupangMonthly * 12)}이 더 붙습니다.`
    : `월 ${DEFAULT_MONTHLY_QTY}건은 월매출 ${manwon(revenue)}으로 어느 마켓의 월정액 발동선에도 닿지 않습니다.`;
  return {
    h2: `초기 조건 그대로 월 ${DEFAULT_MONTHLY_QTY}건을 팔면 마켓 선택의 값은 연 ${manwon(worst.annualDiff)}이다`,
    body:
      `판매가 ${won(BASE.price)}·${CATEGORY}·배송비 ${won(BASE.shippingFee)}·영세·네이버쇼핑 조건에서 월 ${DEFAULT_MONTHLY_QTY}건을 12개월 팔았을 때 연 수수료는 ${name(best.marketKey)} ${won(best.annualFee)}, ` +
      `${name("coupang")} ${won(coupang.annualFee)}, ${name(worst.marketKey)} ${won(worst.annualFee)}입니다. 최저 마켓 대비 연간 차이는 쿠팡 ${won(coupang.annualDiff)}, 13% 마켓 ${won(worst.annualDiff)}입니다. ` +
      `이 격차는 원가·광고비·포장비를 빼기 전의 값인데, 그 비용들은 어느 마켓에서 팔든 같은 금액이 빠지므로 격차 자체는 그대로 유지됩니다. ` +
      monthlyNote,
  };
}

// 유입 경로 전환의 연간 가치 vs 등급 상승의 연간 비용 (원 단위)
function sourceSwitchValue(): Finding {
  const shop = fee(feesAt(BASE.price), "smartstore").totalFee;
  const link = fee(feesAt(BASE.price, { smartstoreSource: "marketingLink" }), "smartstore").totalFee;
  const normal = fee(feesAt(BASE.price, { smartstoreTier: "normal" }), "smartstore").totalFee;
  const yearly = (perUnit: number) => perUnit * DEFAULT_MONTHLY_QTY * 12;
  return {
    h2: `마케팅링크로 한 건을 팔면 ${won(shop - link)}, 등급이 끝까지 올라가면 ${won(normal - shop)}`,
    body:
      `스마트스토어 판매 수수료는 유입 경로에 따라 ${pct(SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER, 3)}(네이버쇼핑)와 ${pct(SMARTSTORE.saleFee.marketingLink * VAT_MULTIPLIER, 3)}(마케팅링크, 둘 다 VAT 포함 환산)로 갈립니다. ` +
      `초기 조건 ${won(BASE.price)}에서 건당 수수료는 네이버쇼핑 유입 ${won(shop)}, 마케팅링크 유입 ${won(link)}으로 ${won(shop - link)} 차이입니다. ` +
      `같은 가격에서 등급이 영세에서 일반으로 끝까지 올라가면 ${won(normal)}이 되어 ${won(normal - shop)} 늘어납니다. ` +
      `월 ${DEFAULT_MONTHLY_QTY}건 기준 연간으로 환산하면 유입 경로 전환이 ${won(yearly(shop - link))}, 등급 5단계 상승이 ${won(yearly(normal - shop))}입니다. ` +
      `블로그·SNS 링크로 들어온 주문 한 건은 연매출 30억을 넘긴 판매자와 3억 이하 판매자의 요율 차이보다 더 큰 돈을 아낍니다.`,
  };
}

// 자사몰 PG 토글 — 최저 마켓과의 격차
function ownStoreGap(): Finding {
  const rows = calcAllMarkets(BASE, { includeOwnStore: true });
  const own = rows.filter((r) => r.marketKey.startsWith("own_")).sort((a, b) => a.totalFee - b.totalFee);
  const ss = fee(rows, "smartstore");
  const cheapest = own[0];
  const dearest = own[own.length - 1];
  return {
    h2: "자사몰 PG 5종은 초기 조건에서 전부 최저 마켓보다 싸다 — 단 유입을 스스로 만들 때만",
    body:
      `계산기의 자사몰 비교를 켜면 PG 5종이 마켓 4개와 같은 판매가 ${won(BASE.price)}으로 나란히 계산됩니다. 영세 기준 건당 결제 수수료는 ${name(cheapest.marketKey)} ${won(cheapest.totalFee)}부터 ${name(dearest.marketKey)} ${won(dearest.totalFee)}까지인데, ` +
      `가장 비싼 PG도 마켓 최저인 ${name("smartstore")} ${won(ss.totalFee)}보다 ${won(ss.totalFee - dearest.totalFee)} 낮습니다. 가장 싼 PG와의 격차는 ${won(ss.totalFee - cheapest.totalFee)}, 월 ${DEFAULT_MONTHLY_QTY}건이면 연 ${won((ss.totalFee - cheapest.totalFee) * DEFAULT_MONTHLY_QTY * 12)}입니다. ` +
      `이 격차의 정체는 네이버쇼핑 판매 수수료(${pct(SMARTSTORE.saleFee.naverShopping * VAT_MULTIPLIER, 3)})와 배송비 수수료가 자사몰에는 없다는 것입니다. 즉 아낀 돈은 마켓이 대신 해주던 노출과 유입의 값이라, 자사몰로 옮길 때는 같은 금액을 광고나 콘텐츠로 스스로 채워야 하는지 먼저 따져야 합니다.`,
  };
}

export const HOME_DIGEST: Finding[] = [
  shippingShare(),
  freeShippingPenalty(),
  rocketCeilings(),
  fulfillmentAsRate(),
  tierPresetReach(),
  annualGap(),
  sourceSwitchValue(),
  ownStoreGap(),
];
