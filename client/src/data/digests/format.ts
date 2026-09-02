// 파생 다이제스트 공용 포매터.
//
// 다이제스트 산문의 숫자는 전부 엔진 실행값이라, 문장 안에서 숫자를 손으로 적는 일이 없어야 한다.
// 여기 함수만 거치게 하면 "표는 1,484원인데 산문은 1,480원" 같은 드리프트가 생길 수 없다.

export interface Finding {
  h2: string;
  body: string;
}

export function won(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

/** 0.04953 → "4.95%" */
export function pct(rate: number, digits = 2): string {
  return `${Number((rate * 100).toFixed(digits)).toString()}%`;
}

/** 비율 차이는 %가 아니라 %p — "13%와 10.5%의 차이 2.5%"로 읽히면 오독이다. */
export function pp(diff: number, digits = 2): string {
  return `${Number((diff * 100).toFixed(digits)).toString()}%p`;
}

/** 1,020,000 → "102만원", 300,000,000 → "3억원", 180,000,000 → "1억 8,000만원" (만원 단위 반올림) */
export function manwon(value: number): string {
  const man = Math.round(value / 10_000);
  if (man < 10_000) return `${man.toLocaleString("ko-KR")}만원`;
  const eok = Math.floor(man / 10_000);
  const rest = man % 10_000;
  return rest === 0 ? `${eok}억원` : `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
}

/**
 * 이름이 데이터에서 오므로 조사를 고정하면 "우체국택배은"이 된다.
 * 마지막 글자의 종성 유무로 은/는을 고른다(한글 아닌 끝자리는 "는").
 */
export function eun(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  const particle = isHangul && (last - 0xac00) % 28 !== 0 ? "은" : "는";
  return `${word}${particle}`;
}

export function times(a: number, b: number, digits = 1): string {
  return `${(a / b).toFixed(digits)}배`;
}

export function kg(value: number): string {
  return `${Number(value.toFixed(2)).toString()}kg`;
}

/** 한국어 나열 — "A·B·C" */
export function list(items: string[]): string {
  return items.join("·");
}
