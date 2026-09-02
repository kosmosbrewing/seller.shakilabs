// /shipping-compare 파생 다이제스트 — 비교표는 "내 무게·크기 한 칸"의 운임을 주지만, 여기는
// 무게 프리셋 6 × 크기 4 = 24칸을 8개 택배사 전부에 대해 돌려서만 보이는 것을 적는다:
// 최저 택배사가 바뀌는 무게, 가벼운데 부피가 큰 상자의 역전, 같은 편의점택배 두 곳의 격차 확장,
// 무게 탄력성의 차이, 추정 모델(CJ)이 실측 운임표와 만나는 지점.

import {
  SHIPPING_CARRIERS,
  SHIPPING_SIZE_LABELS,
  SHIPPING_SIZE_ORDER,
  SHIPPING_WEIGHT_PRESETS,
  SIZE_SUM_THRESHOLDS,
  estimateShippingRates,
  type ShippingCarrierKey,
  type ShippingEstimateResult,
  type ShippingSizeKey,
} from "../shippingRates";
import { calcAllMarkets } from "@/utils/calculator";
import { DEFAULT_PRICE } from "../pricePresets";
import { type Finding, eun, kg, list, times, won } from "./format";

const carrier = (key: ShippingCarrierKey) => SHIPPING_CARRIERS.find((c) => c.key === key)!;
// CJ는 공개 운임표가 없어 예약 화면 기준 추정 모델이다 — 이름 뒤에 반드시 붙인다
const name = (key: ShippingCarrierKey) => (key === "cj" ? `${carrier(key).name}(추정)` : carrier(key).name);
const sizeLabel = (s: ShippingSizeKey) => `${SHIPPING_SIZE_LABELS[s]}(3변 합 ${SIZE_SUM_THRESHOLDS[s]}cm)`;

interface Cell { weight: number; size: ShippingSizeKey; rows: ShippingEstimateResult[] }

function cell(weight: number, size: ShippingSizeKey): Cell {
  const rows = estimateShippingRates({ weightKg: weight, size, sumCm: SIZE_SUM_THRESHOLDS[size] }).filter((r) => r.isAvailable);
  return { weight, size, rows };
}
const fareOf = (c: Cell, key: ShippingCarrierKey) => c.rows.find((r) => r.carrier.key === key)?.totalFare;
const GRID: Cell[] = SHIPPING_WEIGHT_PRESETS.flatMap((w) => SHIPPING_SIZE_ORDER.map((s) => cell(w, s)));

// 24칸 최저 택배사 집계
function cheapestCount(): Finding {
  const tally = new Map<ShippingCarrierKey, Cell[]>();
  for (const c of GRID) {
    const min = c.rows[0].totalFare;
    for (const r of c.rows.filter((x) => x.totalFare === min)) tally.set(r.carrier.key, [...(tally.get(r.carrier.key) ?? []), c]);
  }
  const ranked = [...tally.entries()].map(([k, cells]) => [k, cells.length] as const).sort((a, b) => b[1] - a[1]);
  const never = SHIPPING_CARRIERS.filter((c) => !tally.has(c.key)).map((c) => name(c.key));
  // 1위가 아닌 최저 택배사들이 어느 칸에서 이겼는지 — "무게 W kg 크기 S" 목록
  const where = (k: ShippingCarrierKey) => {
    const cells = tally.get(k)!;
    const weights = [...new Set(cells.map((c) => c.weight))].map(kg).join("·");
    const sizes = [...new Set(cells.map((c) => SHIPPING_SIZE_LABELS[c.size]))].join("·");
    return `${weights} ${sizes}`;
  };
  const others = ranked.slice(1);
  return {
    h2: `무게 ${SHIPPING_WEIGHT_PRESETS.length}단계 × 크기 ${SHIPPING_SIZE_ORDER.length}단계 ${GRID.length}칸에서 최저 운임을 낸 택배사는 ${ranked.length}곳뿐이다`,
    body:
      `비교표의 무게 프리셋(${SHIPPING_WEIGHT_PRESETS.map(kg).join("·")})과 크기 4단계를 전부 조합해 8개 택배사의 공개 운임을 계산하면, 칸마다 최저인 곳(공동 포함)은 ${list(ranked.map(([k, n]) => `${name(k)} ${n}칸`))}입니다. ` +
      `나머지 ${never.length}곳(${list(never)})은 ${GRID.length}칸 어디에서도 최저가 아닙니다. ` +
      `${name(ranked[0][0])}가 아닌 곳이 최저인 칸은 ${others.map(([k]) => `${name(k)}는 ${where(k)}`).join(", ")}에 한정되고, 그 밖의 칸은 전부 ${name(ranked[0][0])}입니다. ` +
      `물량 계약 단가는 이 표에 없으므로, 월 수백 건 이상을 보내는 판매자라면 이 순위는 계약 협상의 출발선일 뿐입니다.`,
  };
}

// 우체국 → 경동 역전 무게
function epostToKdexp(): Finding {
  const smallCells = GRID.filter((c) => c.size === "small");
  const flip = smallCells.find((c) => (fareOf(c, "kdexp") ?? Infinity) < (fareOf(c, "epost") ?? Infinity))!;
  const before = smallCells[smallCells.indexOf(flip) - 1];
  return {
    h2: `${sizeLabel("small")} 상자의 최저 택배사는 ${kg(before.weight)}과 ${kg(flip.weight)} 사이에서 바뀐다`,
    body:
      `같은 소형 상자를 무게만 올려가며 보면 ${kg(before.weight)}까지는 ${name("epost")} ${won(fareOf(before, "epost")!)}이 ${name("kdexp")} ${won(fareOf(before, "kdexp")!)}보다 ${won(fareOf(before, "kdexp")! - fareOf(before, "epost")!)} 싸지만, ` +
      `${kg(flip.weight)}에서는 ${eun(name("epost"))} ${won(fareOf(flip, "epost")!)}으로 오르는 반면 ${eun(name("kdexp"))} ${won(fareOf(flip, "kdexp")!)} 그대로라 순위가 뒤집힙니다. ` +
      `우체국 창구소포는 3kg를 넘으면 다음 구간으로 넘어가고, 경동 표준운임은 6kg까지 한 구간이기 때문입니다. ` +
      `${kg(SHIPPING_WEIGHT_PRESETS[SHIPPING_WEIGHT_PRESETS.length - 1])} 소형에서는 격차가 ${won(fareOf(smallCells[smallCells.length - 1], "epost")! - fareOf(smallCells[smallCells.length - 1], "kdexp")!)}까지 벌어집니다. 3kg 언저리 상품을 파는 판매자는 포장 무게 몇백 g이 택배사 선택을 바꿉니다.`,
  };
}

// 가벼운데 부피가 큰 상자 — 우체국의 역전
function lightButBulky(): Finding {
  const light = GRID.find((c) => c.weight === 1 && c.size === "xlarge")!;
  const smallLight = GRID.find((c) => c.weight === 1 && c.size === "small")!;
  const sorted = light.rows;
  const epostRank = sorted.findIndex((r) => r.carrier.key === "epost") + 1;
  return {
    h2: `${kg(1)}짜리 상자가 ${sizeLabel("xlarge")}이면 ${name("epost")} 운임은 ${times(fareOf(light, "epost")!, fareOf(smallLight, "epost")!)}가 된다`,
    body:
      `무게는 같은 ${kg(1)}인데 3변 합만 ${SIZE_SUM_THRESHOLDS.small}cm에서 ${SIZE_SUM_THRESHOLDS.xlarge}cm로 커지면 ${eun(name("epost"))} ${won(fareOf(smallLight, "epost")!)}에서 ${won(fareOf(light, "epost")!)}으로 뛰어 ${sorted.length}곳 중 ${epostRank}위로 밀립니다. ` +
      `우체국 창구소포는 3변 합 120cm를 넘으면 무게와 무관하게 30kg 구간 요금을 적용하기 때문입니다. ` +
      `같은 조건에서 최저는 ${name(sorted[0].carrier.key)} ${won(sorted[0].totalFare)}, 최고는 ${name(sorted[sorted.length - 1].carrier.key)} ${won(sorted[sorted.length - 1].totalFare)}으로 격차가 ${won(sorted[sorted.length - 1].totalFare - sorted[0].totalFare)}입니다. ` +
      `가벼운 소형에서 최저였던 곳이 부피가 커지자 상위권에서 사라지는 것으로, 의류·침구·완충재가 많은 상품은 무게표가 아니라 크기표부터 봐야 합니다.`,
  };
}

// 무게 20kg 특대 — 격차의 최대치
function heavySpread(): Finding {
  const heaviest = SHIPPING_WEIGHT_PRESETS[SHIPPING_WEIGHT_PRESETS.length - 1];
  const c = GRID.find((x) => x.weight === heaviest && x.size === "xlarge")!;
  const lo = c.rows[0];
  const hi = c.rows[c.rows.length - 1];
  const coLow = c.rows.filter((r) => r.totalFare === lo.totalFare).map((r) => name(r.carrier.key));
  const spreads = GRID.map((x) => x.rows[x.rows.length - 1].totalFare - x.rows[0].totalFare);
  const minSpread = Math.min(...spreads);
  // 같은 사이트의 마켓 축과 견준다 — 초기 판매가에서 4개 마켓 건당 수수료의 최대 격차
  const marketFees = calcAllMarkets({
    price: DEFAULT_PRICE, shippingFee: 0, category: "clothing", smartstoreTier: "micro",
    smartstoreSource: "naverShopping", coupangMode: "marketplace", fulfillmentSize: "small",
  }).map((r) => r.totalFee);
  const marketSpread = Math.max(...marketFees) - Math.min(...marketFees);
  return {
    h2: `${kg(heaviest)} ${SHIPPING_SIZE_LABELS[c.size]} 상자는 택배사에 따라 ${won(lo.totalFare)}에서 ${won(hi.totalFare)}까지 ${times(hi.totalFare, lo.totalFare)} 벌어진다`,
    body:
      `표의 가장 무겁고 큰 칸인 ${kg(heaviest)}·${sizeLabel(c.size)}에서 접수 가능한 ${c.rows.length}곳의 운임은 최저 ${coLow.join("·")} ${won(lo.totalFare)}, 최고 ${name(hi.carrier.key)} ${won(hi.totalFare)}으로 격차가 ${won(hi.totalFare - lo.totalFare)}입니다. ` +
      `${GRID.length}칸 전체에서 격차가 가장 작은 칸도 ${won(minSpread)}이라, 어느 칸이든 택배사 선택이 좌우하는 금액이 이 사이트의 마켓 비교 초기 조건(판매가 ${won(DEFAULT_PRICE)}, 의류)에서 4개 마켓 건당 수수료의 최대 격차 ${won(marketSpread)}보다 큽니다. ` +
      `직접 배송하는 판매자에게 택배비는 마켓과 무관한 공통 비용이라 마켓 순위를 바꾸지는 않지만, 절대 금액으로는 마켓을 갈아타는 것보다 택배 계약을 바꾸는 쪽이 건당 더 많은 돈을 움직입니다. ` +
      `택배사를 정하기 전에 내 상품이 이 표의 어느 칸에 있는지부터 확인하면, 어느 축(마켓·PG·택배)의 비교가 내 마진을 가장 크게 움직이는지 알 수 있습니다.`,
  };
}

// CU vs GS25 격차 확장
function convenienceGap(): Finding {
  const rows = SHIPPING_WEIGHT_PRESETS.map((w) => {
    const c = GRID.find((x) => x.weight === w && x.size === "medium")!;
    return { w, cu: fareOf(c, "cu"), gs: fareOf(c, "gs25") };
  }).filter((r) => r.cu != null && r.gs != null) as { w: number; cu: number; gs: number }[];
  const first = rows[0];
  const last = rows[rows.length - 1];
  return {
    h2: `같은 편의점택배인데 ${name("gs25")}는 ${name("cu")}보다 ${kg(first.w)}에서 ${won(first.gs - first.cu)}, ${kg(last.w)}에서 ${won(last.gs - last.cu)} 비싸다`,
    body:
      `편의점택배 두 곳은 구간 구조가 거의 같지만 요금표는 다릅니다. ${sizeLabel("medium")} 기준으로 무게를 올려가며 비교하면 격차는 ${list(rows.map((r) => `${kg(r.w)} ${won(r.gs - r.cu)}`))}으로 한 번도 좁아지지 않고 벌어집니다. ` +
      `${kg(last.w)}에서는 ${name("gs25")} ${won(last.gs)} 대 ${name("cu")} ${won(last.cu)}으로 ${times(last.gs, last.cu)}입니다. ` +
      `가벼운 반품·교환 건을 편의점에서 보내는 판매자에게 두 곳의 차이는 몇백 원이지만, 무거운 상품을 편의점에 맡기면 택배사 하나를 바꾸는 것만큼 차이가 납니다. ` +
      `둘 다 도서 지역은 별도 추가 운임이 붙으므로 제주·도서산간 발송분은 이 격차와 무관하게 아래 우편번호 정리표를 먼저 확인해야 합니다.`,
  };
}

// CU 초경량이 우체국을 이기는 무게 상한
function ultralightEdge(): Finding {
  const probe = [0.3, 0.35, 0.4, 0.5].map((w) => ({ w, c: cell(w, "small") }));
  const wins = probe.filter((p) => (fareOf(p.c, "cu") ?? Infinity) < (fareOf(p.c, "epost") ?? Infinity));
  const edge = wins[wins.length - 1];
  const next = probe[probe.indexOf(edge) + 1];
  return {
    h2: `${name("cu")}가 ${name("epost")}보다 싼 무게는 ${kg(edge.w)}까지, 그 차이는 ${won(fareOf(edge.c, "epost")! - fareOf(edge.c, "cu")!)}`,
    body:
      `편의점택배는 보통 일반 택배보다 비싸다고 알려져 있지만, 무게 표의 맨 아래에서는 예외가 있습니다. ${sizeLabel("small")} 기준 ${kg(edge.w)} 이하 초경량 구간에서 ${name("cu")} ${won(fareOf(edge.c, "cu")!)}은 ${name("epost")} ${won(fareOf(edge.c, "epost")!)}보다 ${won(fareOf(edge.c, "epost")! - fareOf(edge.c, "cu")!)} 낮습니다. ` +
      `${kg(next.w)}으로 올라가면 ${name("cu")}가 ${won(fareOf(next.c, "cu")!)}으로 우체국을 넘어서고, ${kg(0.5)}에서는 ${won(fareOf(probe[3].c, "cu")!)}으로 ${won(fareOf(probe[3].c, "cu")! - fareOf(probe[3].c, "epost")!)} 비싸집니다. ` +
      `우체국은 3kg까지 한 요금인 반면 CU는 50g 단위로 구간이 쪼개져 있어, 무게가 조금만 늘어도 순위가 바뀝니다. ` +
      `액세서리·스티커·소형 부품처럼 봉투 한 장에 들어가는 상품만이 이 예외의 대상이고, 그마저 100원 차이라 접수 편의가 결정 변수입니다.`,
  };
}

// 무게 탄력성 — 가벼울 때 싼 곳이 무거울 때도 싼가
function weightElasticity(): Finding {
  const keys: ShippingCarrierKey[] = ["epost", "kdexp", "hanjin", "logen", "lotte"];
  const rows = keys.map((k) => {
    const c = carrier(k);
    const bands = c.rateBands!;
    return { k, lo: bands[0], hi: bands[bands.length - 1], mult: bands[bands.length - 1].fare / bands[0].fare };
  }).sort((a, b) => b.mult - a.mult);
  const steep = rows[0];
  const flat = rows[rows.length - 1];
  return {
    h2: `${eun(name(steep.k))} 최저 구간에서 최고 구간까지 ${times(steep.hi.fare, steep.lo.fare)}, ${name(flat.k)}는 ${times(flat.hi.fare, flat.lo.fare)}`,
    body:
      `공개 운임표를 가진 택배사 5곳의 첫 구간과 마지막 구간 운임을 비교하면 무게에 대한 기울기가 크게 다릅니다: ${list(rows.map((r) => `${name(r.k)} ${won(r.lo.fare)}(${kg(r.lo.maxWeightKg)} 이하)→${won(r.hi.fare)}(${kg(r.hi.maxWeightKg)} 이하), ${times(r.hi.fare, r.lo.fare)}`))}. ` +
      `가벼운 구간에서 가장 싼 ${eun(name(steep.k))} 무거운 구간에서는 가장 가파르게 오르고, 가벼운 구간에서 가장 비싼 축인 ${name(flat.k)}는 무게가 늘어도 운임이 거의 늘지 않습니다. ` +
      `그래서 "어디가 싼가"는 무게를 먼저 정해야 답이 나옵니다. 판매 상품의 무게 분포가 넓은 판매자라면 한 택배사로 통일할 때 가벼운 건과 무거운 건 중 어느 쪽에서 손해를 보는지 이 기울기로 판단할 수 있습니다.`,
  };
}

// CJ 추정 모델이 실측 운임표와 만나는 지점
function cjModelCrossing(): Finding {
  const cj = carrier("cj");
  const smallCells = GRID.filter((c) => c.size === "small");
  const over = smallCells.find((c) => (fareOf(c, "cj") ?? -1) > (fareOf(c, "hanjin") ?? Infinity))!;
  const under = smallCells[smallCells.indexOf(over) - 1];
  const first = smallCells[0];
  return {
    h2: `${name("cj")} 소형 모델은 kg당 ${won(cj.extraWeightFeePerKg!)} 가산이라 ${kg(under.weight)}과 ${kg(over.weight)} 사이에서 ${name("hanjin")} 정액을 넘어선다`,
    body:
      `${carrier("cj").name}은 공개 운임표가 없어 이 비교표는 예약 화면 기준으로 기본료 ${won(cj.sizeProfiles!.small.baseFare)}(${kg(cj.sizeProfiles!.small.includedWeightKg)} 포함)에 초과 kg당 ${won(cj.extraWeightFeePerKg!)}을 더하는 추정 모델을 씁니다. ` +
      `이 모델로 ${sizeLabel("small")} 무게 프리셋을 훑으면 ${kg(first.weight)} ${won(fareOf(first, "cj")!)}에서 시작해 ${kg(under.weight)}에는 ${won(fareOf(under, "cj")!)}으로 ${name("hanjin")} ${won(fareOf(under, "hanjin")!)}보다 아직 ${won(fareOf(under, "hanjin")! - fareOf(under, "cj")!)} 싸지만, ${kg(over.weight)}에서는 ${won(fareOf(over, "cj")!)}으로 한진 ${won(fareOf(over, "hanjin")!)}을 ${won(fareOf(over, "cj")! - fareOf(over, "hanjin")!)} 넘어섭니다. ` +
      `즉 추정치를 그대로 믿더라도 ${kg(under.weight)}까지만 CJ가 한진보다 유리하다는 결론이 나오는데, 이 결론은 추정 모델의 기울기(${won(cj.extraWeightFeePerKg!)}/kg)에 기대고 있어 실제 계약 운임이 다르면 함께 움직입니다. ` +
      `이 페이지에서 CJ 값이 결론의 근거로 쓰이는 문장은 이 한 곳뿐이며, 나머지 발견은 전부 공개 운임표를 가진 7개사 값으로만 계산했습니다.`,
  };
}

export const SHIPPING_DIGEST: Finding[] = [
  cheapestCount(),
  epostToKdexp(),
  lightButBulky(),
  heavySpread(),
  convenienceGap(),
  ultralightEdge(),
  weightElasticity(),
  cjModelCrossing(),
];
