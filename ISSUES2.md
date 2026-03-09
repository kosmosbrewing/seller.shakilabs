# 모바일 배치 품질 점검 (ISSUES2)

> **점검 대상**: 수수료 계산기(HomeView) + 오픈마켓 비교(OpenMarketCompareView) + 결제 수수료 비교(PaymentCompareView) 및 하위 컴포넌트
> **점검 기준**: 모바일 뷰포트 (320px ~ 428px) 반응형 배치 오류
> **점검일**: 2026-03-09

---

## 상태 요약

### 수수료 계산기 (HomeView)

| 심각도 | 건수 |
|--------|------|
| Critical (레이아웃 깨짐) | 2건 |
| High (UX 저하) | 2건 |
| Medium (사소한 UX) | 3건 |
| **소계** | **7건** |

### 오픈마켓 비교 (OpenMarketCompareView)

| 심각도 | 건수 |
|--------|------|
| Critical (레이아웃 깨짐) | 1건 |
| High (UX 저하) | 2건 |
| Medium (사소한 UX) | 1건 |
| **소계** | **4건** |

### 결제 수수료 비교 (PaymentCompareView)

| 심각도 | 건수 |
|--------|------|
| Critical (레이아웃 깨짐) | 1건 |
| High (UX 저하) | 1건 |
| Medium (사소한 UX) | 2건 |
| **소계** | **4건** |

> M-8, M-9, M-10은 공유 컴포넌트(CompareHint, sticky 패턴) 이슈로 PaymentCompareView에도 동일 적용됨. 아래는 **추가·심화** 이슈만 기록.

### 택배비 비교 (ShippingCompareView)

| 심각도 | 건수 |
|--------|------|
| Critical (레이아웃 깨짐) | 1건 |
| High (UX 저하) | 1건 |
| Medium (사소한 UX) | 2건 |
| **소계** | **4건** |

> M-9, M-10(CompareHint 공유 이슈)은 택배비 비교 화면에도 동일 적용됨. 아래는 **추가·심화** 이슈만 기록.

### 전체 합계: **19건** (HomeView 7 + OpenMarket 4 + Payment 4 + Shipping 4)

---

# A. 수수료 계산기 (HomeView)

## Critical — 레이아웃 깨짐

### [M-1] MonthlySim 타이틀바 — 프리셋 버튼 가로 오버플로

- **파일**: `client/src/components/compare/MonthlySim.vue:69-80`
- **현상**: 타이틀바 내부 `<div class="flex gap-1">`에 4개 프리셋 버튼(50건, 100건, 300건, 500건)이 `flex-wrap` 없이 배치됨. 모바일에서 `flex-col`로 전환되지만, 두 번째 줄(`label + input + 4 buttons`)이 한 행에 강제 배치되어 ~375px 이하에서 가로 오버플로 발생.
- **영향**: 타이틀바 내용이 패널 밖으로 넘치거나 가로 스크롤 발생
- **수정 방향**: 프리셋 버튼 컨테이너에 `flex-wrap` 추가, 또는 모바일에서 입력부와 프리셋부를 별도 행으로 분리

```vue
<!-- 현재 -->
<div class="flex items-center gap-2">
  <label ...>월 판매</label>
  <div class="relative w-24">...</div>
  <div class="flex gap-1">  <!-- flex-wrap 없음 -->
    <Button v-for="preset in QTY_PRESETS" ...>

<!-- 개선안 -->
<div class="flex flex-wrap items-center gap-2">
  <label ...>월 판매</label>
  <div class="relative w-24">...</div>
  <div class="flex flex-wrap gap-1">
    <Button v-for="preset in QTY_PRESETS" ...>
```

---

### [M-2] CompareInput 타이틀바 — 제목 + FreshBadge 오버플로

- **파일**: `client/src/components/compare/CompareInput.vue:111-114`
- **현상**: 타이틀바에 `h2`("내 상품 수수료 한눈에 비교하기", ~170px)와 `FreshBadge`(~190px)가 `flex justify-between`으로 배치됨. 320px 뷰포트에서 양쪽 패딩(px-4 × 2 = 32px) + 컨테이너 패딩(1rem × 2 = 32px) 제외 시 가용 폭 ~254px로, 두 요소 합산(~360px+)이 초과하여 오버플로 또는 줄바꿈 없이 잘림 발생.
- **영향**: 타이틀 텍스트 또는 FreshBadge가 잘리거나 패널 밖으로 넘침
- **수정 방향**: 타이틀바에 `flex-wrap` 추가하거나, 모바일에서 `flex-col`로 전환. 또는 제목에 `min-w-0 truncate` 적용.

```vue
<!-- 현재 -->
<div class="retro-titlebar rounded-t-2xl">
  <h2 class="retro-title">내 상품 수수료 한눈에 비교하기</h2>
  <FreshBadge />
</div>

<!-- 개선안: flex-wrap + 모바일 세로 배치 -->
<div class="retro-titlebar flex-wrap rounded-t-2xl">
  <h2 class="retro-title min-w-0">내 상품 수수료 한눈에 비교하기</h2>
  <FreshBadge />
</div>
```

---

## High — UX 저하

### [M-3] HomeView 비교 결과 테이블 — 모바일 스크롤 힌트 없음

- **파일**: `client/src/views/HomeView.vue:177-236`
- **현상**: 5컬럼 테이블(순위, 마켓, 총 수수료, 수수료율, 건당 순이익)이 `overflow-x-auto`로 감싸져 있으나, 모바일 사용자에게 좌우 스크롤 가능하다는 힌트가 없음. `FeeCompareTable.vue:55`에는 `scroll-hint` 클래스가 적용되어 있지만, HomeView 직접 테이블에는 미적용.
- **영향**: 모바일 사용자가 수수료율/순이익 컬럼 존재를 인지하지 못할 수 있음
- **수정 방향**: `overflow-x-auto` 위에 `<p class="scroll-hint">표를 좌우로 밀어 확인하세요.</p>` 추가

---

### [M-4] MonthlySim 테이블 — 6컬럼 모바일 스크롤 힌트 없음

- **파일**: `client/src/components/compare/MonthlySim.vue:84-153`
- **현상**: 6컬럼 테이블(순위, 마켓, 월 수수료, 월 순이익, 연 수수료, 1위 대비)로 최소 ~600px 필요. `overflow-x-auto`는 있으나 스크롤 힌트 없음. 금액 표시에 `hidden sm:inline` / `sm:hidden` 반응형 분기(formatWonShort)는 적용되어 있으나, 테이블 자체의 스크롤 필요성을 사용자에게 알려주지 않음.
- **영향**: 월 순이익 이후 컬럼을 놓칠 가능성 높음
- **수정 방향**: `<p class="scroll-hint">표를 좌우로 밀어 확인하세요.</p>` 추가

---

## Medium — 사소한 UX 개선

### [M-5] ShareModal — 모바일 세로 위치 편향

- **파일**: `client/src/components/share/ShareModal.vue:58`
- **현상**: `translate-y-[10vh]` 클래스가 모바일에만 적용되어(`sm:translate-y-0`) 모달이 화면 중앙에서 아래로 10vh 밀림. 가로 모드나 소형 뷰포트(높이 <600px)에서 모달 하단이 화면 밖으로 잘릴 수 있음.
- **영향**: 가로 모드에서 공유 버튼 접근 불가 가능성
- **수정 방향**: `translate-y-[10vh]`를 `translate-y-[5vh]`로 줄이거나, `max-h-[85vh] overflow-y-auto` 추가

---

### [M-6] CompareInput ± 스테퍼 버튼 — 터치 타겟 폭 부족

- **파일**: `client/src/components/compare/CompareInput.vue:128-136, 215-223`
- **현상**: 판매가/배송비의 ±버튼이 `w-10`(40px)으로 설정. 높이는 `chip` 사이즈의 `min-h-11`(44px)으로 충족하나, 폭이 Apple HIG/WCAG 권장 최소 터치 타겟(44×44px)에 4px 미달.
- **영향**: 모바일에서 ± 버튼 오탭 가능성 약간 증가
- **수정 방향**: `w-10` → `w-11`(44px)로 변경

---

### [M-7] CompareInput 카테고리 그리드 — 320px에서 버튼 폭 협소

- **파일**: `client/src/components/compare/CompareInput.vue:186-202`
- **현상**: `grid grid-cols-3 gap-1.5`로 5개 카테고리 버튼 배치. 320px 뷰포트에서 가용 폭 계산: 320 - 32(컨테이너 패딩) - 24(카드 패딩) - 2(보더) - 12(gap×2) = 250px ÷ 3 = ~83px/버튼. 이모지 + "전자기기" 같은 긴 라벨은 `text-[11px]`에서도 꽉 찰 수 있음.
- **영향**: 320px 디바이스에서 "전자기기" 등 긴 라벨이 2줄로 꺾이며 버튼 높이 불균형 발생 가능
- **수정 방향**: 카테고리가 5개로 3열 그리드 시 마지막 행에 2개만 배치됨. 모바일에서 `grid-cols-2` 또는 `flex flex-wrap` 전환 고려. 또는 라벨 단축("전자기기" → "전자")

---

## 참고: 정상 동작 확인 항목 (HomeView)

| 항목 | 상태 | 비고 |
|------|------|------|
| STEP 1/2/3 카드 | OK | `grid-cols-1 sm:grid-cols-3`으로 모바일 1열 정상 |
| "다른 비용도 비교하기" 카드 | OK | `grid-cols-1 sm:grid-cols-2`로 모바일 1열 정상 |
| 고급 마켓 조건 설정 | OK | `flex-wrap gap-1.5`로 버튼 줄바꿈 정상 |
| 배송비 프리셋 버튼 | OK | `flex flex-wrap gap-1.5`로 3개 버튼 정상 배치 |
| FAQ 아코디언 | OK | 단일 컬럼, 모바일 문제 없음 |
| 헤더 티커바 | OK | `overflow-hidden`으로 모바일 정상 |
| 비교 결과 요약 문구 | OK | `text-caption`으로 자연 줄바꿈 |
| MarketCard 순이익 표시 | OK | `hidden sm:inline` / `sm:hidden`으로 모바일 단축 표시 |

---

# B. 오픈마켓 비교 (OpenMarketCompareView)

## Critical — 레이아웃 깨짐

### [M-8] Sticky 첫 열 — 하이라이트 행 배경 투명으로 콘텐츠 투비침

- **파일**: `client/src/views/OpenMarketCompareView.vue:162-164`
- **현상**: 비교 테이블의 첫 열(오픈마켓 이름)이 `sticky left-0`으로 고정됨. 일반 행은 `bg-card`(불투명)로 문제없으나, 최저 수수료 하이라이트 행은 `bg-profit/5`(5% 투명도)가 적용됨. 모바일에서 좌우 스크롤 시 뒤의 데이터 셀 텍스트가 sticky 열 아래로 비침.
- **영향**: 최저 수수료 행의 마켓명이 다른 컬럼 텍스트와 겹쳐 보여 가독성 심각 저하
- **수정 방향**: 하이라이트 행 sticky 셀에 불투명 배경 적용

```vue
<!-- 현재 -->
<td
  class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4"
  :class="market.key === lowestFeeMarket ? 'bg-profit/5' : 'bg-card'"
>

<!-- 개선안: 하이라이트에도 불투명 배경 사용 -->
<td
  class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4"
  :class="market.key === lowestFeeMarket ? 'bg-card' : 'bg-card'"
  :style="market.key === lowestFeeMarket ? { background: 'linear-gradient(hsl(var(--profit) / 0.05), hsl(var(--profit) / 0.05)), hsl(var(--card))' } : {}"
>
```

또는 간단하게:
```vue
:class="'bg-card'"
```
으로 통일 후, 하이라이트는 좌측 border 색상으로 표현.

---

## High — UX 저하

### [M-9] CompareHint 힌트 버튼 — 터치 타겟 16×16px (최소 44px 미달)

- **파일**: `client/src/components/common/CompareHint.vue:94`
- **현상**: 힌트 아이콘 버튼에 `buttonVariants({ variant: 'ghost', size: 'iconSm' })`를 적용하지만, 뒤이어 `'h-4 w-4 rounded-full p-0'`으로 덮어써 최종 크기가 16×16px. 모바일에서 정보 아이콘을 탭하기 매우 어려움. Apple HIG/WCAG 권장 최소(44×44px)의 1/3 수준.
- **영향**: 모바일 사용자가 힌트 정보에 접근하기 어려움 (오탭·미탭 빈번)
- **수정 방향**: 시각적 아이콘은 16px 유지하되, 터치 타겟은 `min-w-11 min-h-11`(44px)로 확보

```vue
<!-- 현재 -->
:class="[buttonVariants({ variant: 'ghost', size: 'iconSm' }), 'h-4 w-4 rounded-full p-0 hover:bg-transparent']"

<!-- 개선안: 터치 영역 확보, 아이콘만 작게 -->
:class="[buttonVariants({ variant: 'ghost', size: 'iconSm' }), 'rounded-full p-0 hover:bg-transparent']"
<!-- iconSm = h-8 w-8 유지로 최소 32px 확보. 더 키우려면 size: 'icon' (40px) 사용 -->
```

---

### [M-10] CompareHint 툴팁 — 첫 행에서 상단 잘림 가능

- **파일**: `client/src/components/common/CompareHint.vue:113`
- **현상**: 툴팁이 `transform: 'translateY(-100%)'`로 버튼 위쪽에 표시됨. 테이블 첫 행(스마트스토어)의 힌트를 탭하면, 버튼이 화면 상단 근처에 위치하여 툴팁이 뷰포트 위로 잘릴 수 있음. Y좌표 하한 경계(`Math.max`) 처리가 X좌표에만 적용되어 있고, Y좌표에는 없음.
- **영향**: 첫 행 힌트 내용이 화면 밖으로 잘려 읽을 수 없음
- **수정 방향**: Y좌표에도 하한 검사를 추가하여, 공간 부족 시 아래쪽으로 표시

```ts
// 현재 setPosition (X만 경계 검사)
pos.value = {
  x: Math.max(8, Math.min(rect.left + rect.width / 2, window.innerWidth - panelW - 8)),
  y: rect.top - 8,
};

// 개선안: Y 방향 경계 검사 추가
const estimatedPanelH = 80; // 대략 높이
const spaceAbove = rect.top;
const showBelow = spaceAbove < estimatedPanelH + 16;
pos.value = {
  x: Math.max(8, Math.min(rect.left + rect.width / 2, window.innerWidth - panelW - 8)),
  y: showBelow ? rect.bottom + 8 : rect.top - 8,
};
// transform도 showBelow일 때 translateY(0)으로 전환 필요
```

---

## Medium — 사소한 UX 개선

### [M-11] 비교 테이블 sticky 첫 열 — 320px에서 가용 폭 과점유

- **파일**: `client/src/views/OpenMarketCompareView.vue:162-186`
- **현상**: Sticky 첫 열에 브랜드 배지(min-w-8=32px) + gap(10px) + 마켓명(예: "스마트스토어" ~76px) + "최저" 배지(~55px) + 좌우 패딩(12px×2) = 약 197px. 320px 뷰포트의 ~62%를 차지하여, 나머지 데이터 컬럼 가시 영역이 ~123px로 좁음. 사용자가 스크롤해야 하는 콘텐츠가 대부분.
- **영향**: 데이터 컬럼이 거의 보이지 않아 스크롤 필요성 인지 어려움
- **수정 방향**: 모바일에서 sticky 열의 마켓명을 shortName만 표시하거나, sticky를 해제하고 일반 스크롤로 전환 고려

```vue
<!-- 현재: 항상 풀 마켓명 -->
<span class="text-body font-semibold">{{ market.name }}</span>

<!-- 개선안: 모바일에서 shortName 사용 -->
<span class="text-body font-semibold">
  <span class="hidden sm:inline">{{ market.name }}</span>
  <span class="sm:hidden">{{ market.shortName }}</span>
</span>
```

---

## 참고: 정상 동작 확인 항목 (OpenMarketCompareView)

| 항목 | 상태 | 비고 |
|------|------|------|
| 타이틀바 | OK | `flex-col sm:flex-row`로 모바일 세로 배치 정상 |
| FreshBadge 배치 | OK | `w-full sm:w-auto`로 모바일 줄바꿈 정상 |
| 스크롤 힌트 | OK | `scroll-hint` 클래스 적용됨 (HomeView와 달리 정상) |
| 설명 + 최저 배지 | OK | `flex-wrap`으로 모바일 줄바꿈 정상 |
| 경고 박스 | OK | `text-[11px] sm:text-caption` 반응형 폰트 적용 |
| 하단 CTA 버튼 | OK | `text-center`로 중앙 정렬, 자연 줄바꿈 |
| 테이블 `overflow-x-auto` | OK | 가로 스크롤 동작 정상 |
| 데이터 셀 `compare-cell-value` | OK | `word-break: keep-all; text-wrap: balance` 적용 |

---

# C. 결제 수수료 비교 (PaymentCompareView)

> **공유 이슈 참조**: M-8(sticky bg 투비침), M-9(CompareHint 터치타겟), M-10(CompareHint 툴팁 Y잘림)은 동일 패턴으로 PaymentCompareView에도 그대로 적용됩니다.

## Critical — 레이아웃 깨짐

### [M-12] Sticky 첫 열 — 하이라이트 행 bg 투비침 + thead bg 반투명

- **파일**: `client/src/views/PaymentCompareView.vue:183-185, 166`
- **현상**:
  1. M-8과 동일 패턴 — 최저 수수료 행의 sticky 셀이 `bg-profit/5`(5% 투명도)로, 좌우 스크롤 시 뒤 컬럼 텍스트 투비침.
  2. **추가**: `thead`의 sticky `th`도 `bg-card/95`(95% 불투명)로 설정되어, 스크롤 시 헤더 아래로 미세한 텍스트 고스팅 발생. (OpenMarketCompareView:145에도 동일하지만 M-8에서 미기록)
- **영향**: 가로 스크롤 시 sticky 열과 겹친 텍스트로 가독성 저하. 특히 최저 수수료 행에서 심각.
- **수정 방향**: 하이라이트 행 sticky 셀과 thead sticky th 모두 불투명 배경 적용

```vue
<!-- thead th: bg-card/95 → bg-card -->
<th class="sticky left-0 z-20 ... bg-card px-3 py-3 ...">결제 서비스</th>

<!-- tbody td: profit 행도 불투명 배경 -->
<td
  class="sticky left-0 z-10 ..."
  :class="'bg-card'"
>
```

---

## High — UX 저하

### [M-13] Sticky 첫 열 — 긴 서비스명 + 6컬럼으로 가시 데이터 영역 극소

- **파일**: `client/src/views/PaymentCompareView.vue:183-207`
- **현상**: M-11(OpenMarketCompareView)의 심화 버전. PaymentCompareView는:
  - **서비스명이 더 길다**: "토스페이먼츠 (PG)" (~130px at 14px), "네이버페이 주문형/결제형" (~112px)
  - **데이터 컬럼이 6개** (가입비, 연회비, 수수료, 정산 기준, 비고) vs OpenMarketCompareView의 4개
  - Sticky 열 폭 추산: 배지(32px) + gap(10px) + "토스페이먼츠 (PG)"(~130px) + padding(12px×2) = **~196px**
  - 320px 뷰포트 가시 영역: 320 - 196 = **~124px** (전체의 38%)에 6개 컬럼이 압축
- **영향**: 첫 데이터 컬럼("가입비")의 일부만 보이고, 나머지 5개 컬럼은 모두 스크롤 필요. 사용자가 실질 비교 데이터에 도달하기까지 과도한 스크롤 필요.
- **수정 방향**: 모바일에서 shortName 사용 (M-11 개선안과 동일 패턴)

```vue
<!-- 현재 -->
<span class="text-body font-semibold">{{ gateway.name }}</span>

<!-- 개선안: 모바일에서 shortName 사용 -->
<span class="text-body font-semibold">
  <span class="hidden sm:inline">{{ gateway.name }}</span>
  <span class="sm:hidden">{{ gateway.shortName }}</span>
</span>
```

shortName 예시: "토스PG", "N주문", "N결제", "카카오", "PAYCO" — 최대 ~48px로 sticky 열 폭 ~104px, 가시 영역 ~216px(67%)로 대폭 개선.

---

## Medium — 사소한 UX 개선

### [M-14] 최저 수수료 배지 내 CompareHint — 터치 타겟 접근 불가 수준

- **파일**: `client/src/views/PaymentCompareView.vue:150-156`
- **현상**: "영세 기준 최저 수수료 카카오 0.89%" 배지 안에 CompareHint가 배치됨. 컨테이너가 `inline-flex h-4 w-4`(16×16px)로 제한되어 힌트 버튼(자체 16×16px)과 정확히 같은 크기. 터치 여백이 전혀 없어 모바일에서 탭이 거의 불가능.
- **영향**: 카카오페이 최저 수수료의 부연 설명("간편결제 단독 수수료 기준")을 모바일 사용자가 볼 수 없음
- **수정 방향**: 컨테이너 크기를 키우거나, 배지 전체를 탭 대상으로 변경

```vue
<!-- 현재: 16×16 안에 16×16 버튼 -->
<span class="inline-flex h-4 w-4 shrink-0 items-center justify-center">
  <CompareHint ... />
</span>

<!-- 개선안 1: 컨테이너 확장 -->
<span class="inline-flex h-6 w-6 shrink-0 items-center justify-center">
  <CompareHint ... />
</span>

<!-- 개선안 2: 배지 전체를 탭 가능하게 -->
<button type="button" class="inline-flex items-center gap-1 ...">
  ...최저 수수료 텍스트...
  <CircleHelp class="h-3.5 w-3.5" />
</button>
```

---

### [M-15] 데이터 셀 — `whitespace-nowrap` 강제로 테이블 과도하게 넓어짐

- **파일**: `client/src/views/PaymentCompareView.vue:216`
- **현상**: 모든 데이터 셀의 값에 `whitespace-nowrap`이 적용됨. "영세 2%대 초중반~"(~120px), "평균 5일 이내"(~90px) 등이 줄바꿈되지 않아 테이블 최소 폭이 불필요하게 넓어짐. OpenMarketCompareView(line 194)에서는 `col.nowrap` 조건부로 적용하지만, PaymentCompareView는 무조건 적용.
- **영향**: 모바일에서 필요 이상의 가로 스크롤 발생 (특히 "정산 기준", "비고" 컬럼)
- **수정 방향**: OpenMarketCompareView와 동일하게 `col.nowrap` 조건부 적용

```vue
<!-- 현재: 무조건 nowrap -->
<span class="compare-cell-value whitespace-nowrap">{{ gateway[col.key].core }}</span>

<!-- 개선안: 조건부 nowrap (compareColumns 정의와 일치) -->
<span class="compare-cell-value" :class="col.nowrap ? 'whitespace-nowrap' : ''">
  {{ gateway[col.key].core }}
</span>
```

현재 `compareColumns` 정의에서 `nowrap: true`는 "가입비", "연회비", "수수료(카드)"에만 설정. "정산 기준"과 "비고"는 `nowrap` 미설정이므로 조건부 적용 시 자연 줄바꿈되어 테이블 폭이 줄어듦.

---

## 참고: 정상 동작 확인 항목 (PaymentCompareView)

| 항목 | 상태 | 비고 |
|------|------|------|
| 타이틀바 | OK | `flex-col sm:flex-row`로 모바일 세로 배치 정상 |
| FreshBadge 배치 | OK | `w-full sm:w-auto`로 모바일 줄바꿈 정상 |
| 스크롤 힌트 | OK | `scroll-hint` 클래스 적용됨 |
| 설명 + 최저 배지 | OK | `flex-wrap`으로 모바일 줄바꿈 정상 |
| 경고 박스 | OK | `text-[11px] sm:text-caption` 반응형 폰트 적용 |
| 하단 CTA 버튼 | OK | `text-center`로 중앙 정렬, 자연 줄바꿈 |
| 테이블 `overflow-x-auto` | OK | 가로 스크롤 동작 정상 |
| 셀 내 CompareHint 정렬 | OK | `inline-flex items-center gap-0.5 align-middle`로 정렬 정상 |

---

# D. 택배비 비교 (ShippingCompareView)

> **공유 이슈 참조**: M-9(CompareHint 터치타겟), M-10(CompareHint 툴팁 Y잘림)은 "접수 제한" 컬럼의 CompareHint에 동일 적용됩니다.

## Critical — 레이아웃 깨짐

### [M-16] Sticky 첫 열 — estimateNote 서브텍스트가 `whitespace-nowrap` 상속으로 뷰포트 초과

- **파일**: `client/src/views/ShippingCompareView.vue:441-476, 553-588`
- **현상**: 일반 택배·편의점 택배 두 테이블 모두, sticky 첫 열 `<td>`에 `whitespace-nowrap`이 적용됨(line 442, 554). 이 속성은 CSS 상속으로 자식 `<p>` 서브텍스트에도 전파됨. 서브텍스트(line 472-473)에 `estimateNote`가 포함되는데, 예시 값:
  - `"공개 운임표 비노출로 예약 화면 기준 추정 모델 적용"` (~280px at 11px)
  - `"CUpost 국내택배 운임표 동일권 기준"` (~200px at 11px)
  - 여기에 `" · 중형 구간"` 등이 추가됨
  - `whitespace-nowrap` 때문에 줄바꿈이 안 되어 sticky 열 최소 폭이 **~300px+**로 확장됨
  - 320px 뷰포트에서 sticky 열이 뷰포트 전체보다 넓어, 데이터 컬럼이 완전히 가려짐
- **영향**: 모바일에서 기본운임/무게추가/예상 총 운임 컬럼이 전혀 보이지 않거나, 빈 공간만 보임. 비교 테이블의 핵심 데이터 접근 불가.
- **수정 방향**: 서브텍스트에 `whitespace-normal` 명시적 적용으로 상속 차단, 또는 모바일에서 서브텍스트 숨기기

```vue
<!-- 현재: td의 whitespace-nowrap이 서브텍스트까지 상속 -->
<td class="sticky left-0 z-10 whitespace-nowrap px-3 py-3 sm:px-4" ...>
  <div class="flex items-center gap-2.5">
    ...
    <p class="text-tiny text-muted-foreground">
      {{ result.carrier.estimateNote }} · {{ result.effectiveSizeLabel }} 구간
    </p>
  </div>
</td>

<!-- 개선안 1: 서브텍스트에 whitespace-normal 명시 -->
<p class="text-tiny text-muted-foreground whitespace-normal">
  {{ result.carrier.estimateNote }} · {{ result.effectiveSizeLabel }} 구간
</p>

<!-- 개선안 2: 모바일에서 서브텍스트 숨기기 -->
<p class="hidden text-tiny text-muted-foreground sm:block">
  {{ result.carrier.estimateNote }} · {{ result.effectiveSizeLabel }} 구간
</p>

<!-- 개선안 3: 모바일에서는 짧은 텍스트만 -->
<p class="text-tiny text-muted-foreground whitespace-normal">
  <span class="sm:hidden">{{ result.effectiveSizeLabel }} 구간</span>
  <span class="hidden sm:inline">{{ result.carrier.estimateNote }} · {{ result.effectiveSizeLabel }} 구간</span>
</p>
```

---

## High — UX 저하

### [M-17] Sticky 첫 열 — 3종 반투명 배경으로 스크롤 시 투비침 (최대 25% 투명)

- **파일**: `client/src/views/ShippingCompareView.vue:231-238, 443, 555`
- **현상**: `getShippingStickyCellTone()` 함수가 3가지 상태별 배경색을 반환:
  - **접수 불가 행**: `bg-muted/25` — 25% 투명도 (4개 뷰 중 최악)
  - **최저 운임 행**: `bg-profit/8` / `dark:bg-profit/12` — 8~12% 투명도
  - **일반 행**: `bg-card` — 불투명 (정상)
  - `thead` th도 `bg-card/95` — 5% 투명
  - M-8(5% 투명), M-12(5%+5%)보다 투명도가 훨씬 높아 투비침이 명확하게 눈에 보임
- **영향**: 접수 불가(회색) 행과 최저 운임(녹색) 행 모두에서 스크롤 시 데이터 텍스트가 겹쳐 보임. 특히 `bg-muted/25`는 뒤의 텍스트가 선명하게 비침.
- **수정 방향**: 모든 상태에서 불투명 배경 사용

```ts
// 현재
function getShippingStickyCellTone(...): string {
  if (!result.isAvailable) return "bg-muted/25";         // 25% 투명
  if (result.carrier.key === cheapestKey) return "bg-profit/8 ..."; // 8% 투명
  return "bg-card";                                       // 불투명
}

// 개선안: 모두 불투명 배경 + 하이라이트는 border로 표현
function getShippingStickyCellTone(...): string {
  if (!result.isAvailable) return "bg-muted";             // 불투명
  if (result.carrier.key === cheapestKey) return "bg-card"; // 불투명 (행 전체에 좌측 border 등으로 표현)
  return "bg-card";
}
```

---

## Medium — 사소한 UX 개선

### [M-18] 무게 ± 스테퍼 버튼 — 터치 타겟 폭 부족 (M-6 재적용)

- **파일**: `client/src/views/ShippingCompareView.vue:308, 329`
- **현상**: M-6과 동일 패턴. 무게 입력의 ±버튼이 `w-10`(40px)으로 설정. Apple HIG/WCAG 권장 44×44px에 4px 미달.
- **영향**: 모바일에서 오탭 가능성 약간 증가
- **수정 방향**: `w-10` → `w-11`(44px)로 변경

---

### [M-19] 무게 프리셋 — grid-cols-5로 320px에서 버튼 폭 협소

- **파일**: `client/src/views/ShippingCompareView.vue:335`
- **현상**: `grid grid-cols-5 gap-1.5`로 5개 프리셋(1kg, 3kg, 5kg, 10kg, 20kg) 배치. 320px 뷰포트 기준:
  - 가용 폭: 320 - 32(컨테이너) - 24(카드 패딩) - 2(보더) = 262px
  - gap: 4 × 6px = 24px
  - 버튼당 폭: (262 - 24) / 5 = **~47.6px**
  - `chip` 사이즈의 min-h-11(44px)으로 높이는 충족하나, 폭이 44px 턱걸이 수준
  - "20kg" 텍스트(13px, ~34px)는 수납되나, 버튼 간 여백이 6px뿐이라 연속 탭 시 오탭 가능
- **영향**: 320px 디바이스에서 프리셋 버튼 간 오탭 가능성 약간 있음
- **수정 방향**: 모바일에서 `grid-cols-3`으로 전환하거나, 프리셋을 `flex flex-wrap`으로 변경

```vue
<!-- 현재 -->
<div class="grid grid-cols-5 gap-1.5">

<!-- 개선안: 모바일에서 3열 → sm에서 5열 -->
<div class="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
```

---

## 참고: 정상 동작 확인 항목 (ShippingCompareView)

| 항목 | 상태 | 비고 |
|------|------|------|
| 타이틀바 | OK | `flex-col sm:flex-row`로 모바일 세로 배치 정상 |
| FreshBadge 배치 | OK | 타이틀바 내 `flex-col` 하위에 적절히 배치 |
| 입력 카드 그리드 | OK | `sm:grid-cols-2`로 모바일 1열 정상 |
| 크기 프리셋 (grid-cols-4) | OK | 4개 버튼 × 소형/중형/대형/특대, 충분한 폭 |
| cm 입력 필드 | OK | `max-w-[18rem]` 제한으로 적절 |
| 스크롤 힌트 (일반/편의점) | OK | 두 테이블 모두 `scroll-hint` 적용됨 |
| 설명 + 최저 배지 | OK | `flex-wrap`으로 줄바꿈 정상 |
| 도서산간 참고표 모바일 | OK | `md:hidden`으로 카드형 UI 제공, 터치 대응 양호 |
| 하단 CTA 버튼 | OK | `text-center`로 중앙 정렬 |
| 데이터 셀 nowrap 조건부 | OK | `col.nowrap` 조건부 적용으로 적절 (PaymentCompareView의 M-15와 대비) |

---

# 해결 완료 (2026-03-09)

모든 19건의 이슈가 수정 완료되었습니다. `vue-tsc --noEmit` 타입 체크 통과 확인.

| 이슈 | 파일 | 상태 |
|------|------|------|
| M-1 | MonthlySim.vue | DONE — `flex-wrap` 추가 |
| M-2 | CompareInput.vue | DONE — 타이틀바 `flex-col sm:flex-row` |
| M-3 | HomeView.vue | DONE — `scroll-hint` 추가 |
| M-4 | MonthlySim.vue | DONE — `scroll-hint` 추가 |
| M-5 | ShareModal.vue | DONE — `translate-y-[5vh]` + `max-h-[85vh] overflow-y-auto` |
| M-6 | CompareInput.vue | DONE — `w-10` → `w-11` |
| M-7 | CompareInput.vue | DONE — `grid-cols-2 sm:grid-cols-3` |
| M-8 | OpenMarketCompareView.vue | DONE — sticky bg 불투명화 |
| M-9 | CompareHint.vue | DONE — `h-4 w-4` 제거, iconSm 유지 |
| M-10 | CompareHint.vue | DONE — Y축 경계 검사 + `showBelow` |
| M-11 | OpenMarketCompareView.vue | DONE — 모바일 `shortName` 표시 |
| M-12 | PaymentCompareView.vue | DONE — sticky bg 불투명화 |
| M-13 | PaymentCompareView.vue | DONE — 모바일 `shortName` 표시 |
| M-14 | PaymentCompareView.vue | DONE — CompareHint 컨테이너 `h-6 w-6` |
| M-15 | PaymentCompareView.vue | DONE — 조건부 `col.nowrap` 적용 |
| M-16 | ShippingCompareView.vue | DONE — `whitespace-normal` + 모바일 `estimateNote` 숨김 |
| M-17 | ShippingCompareView.vue | DONE — sticky bg 불투명화 |
| M-18 | ShippingCompareView.vue | DONE — `w-10` → `w-11` |
| M-19 | ShippingCompareView.vue | DONE — `grid-cols-3 sm:grid-cols-5` |
