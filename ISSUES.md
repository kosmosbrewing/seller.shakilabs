# 03.seller 품질 점검 결과 (ISSUES)

> **점검 기준**: `docs/MVP_QUALITY_MANUAL.md` (22개 항목)
> **점검 대상**: 오픈마켓 수수료 비교 계산기 (Frontend-only SPA)
> **최초 점검일**: 2026-03-05
> **최종 갱신일**: 2026-03-09 (14차 점검, 4개 비교 화면 데이터/힌트 정확성 점검 완료)

---

## 프로젝트 특성
- 타입: 프론트엔드 전용 정적 사이트 (백엔드/DB 없음)
- 배포: Vercel (정적 배포)
- 백엔드 관련 항목(B1~B9): N/A

---

## 상태 요약

### 진행 스냅샷 (2026-03-09 최종)
- 해결 완료: 82건 (+12건: 22-C1 데이터 검증, 25-C1 월정액 추출, 19-A3/20-D1/21-B4 폰트 통일, 18-B2 버튼 radius, 18-F2 스크롤힌트, 18-G2 다크모드 뱃지, 19-C4 CTA 정리, 20-D2 열 병합)
- 미해결: 5건 (설계 판단으로 현행 유지: 19-A4 비고 이질성, 19-C5 계산기 분리, 19-D3 서브타이틀, 21-B3 편의점 테이블)
- 운영 검증 별도: ISSUE-11 (`11-7`, `11-8`)
- 데이터 확인 메모: ISSUE-16 `16-4`는 보강 완료, 2차 출처 확인 이력만 문서에 유지
- 데이터 정확성: 2026.03 웹 검증 완료 — 2025.10 이후 변동 없음 확인 (FreshBadge에 "2026.03 확인" 표시)

### 프론트엔드 (F1~F7)
| # | 항목 | 상태 | 근거 |
|---|------|------|------|
| F1 | API 래퍼+캐싱 | N/A | API 호출 없음 |
| F2 | Pinia 인증 스토어 | N/A | 인증 기능 없음 |
| F3 | Router 가드 | ✅ 충족 | 타이틀 설정 + 페이지뷰 추적 + 10개 리다이렉트 |
| F4 | GA4 Analytics | ✅ 충족 | `trackPageView`, `trackEvent` 동작 |
| F5 | Alert 시스템 | ✅ 충족 | `useAlert`, AlertHost 사용 |
| F6 | Vite 최적화 | ✅ 충족 | 청크 분리 + 테스트 설정 통합 |
| F7 | 초기화/에러 처리 | ✅ 충족 | 글로벌 에러 핸들러 + runtime error 추적 |

### 공유 코드 (S1~S3)
| # | 항목 | 상태 | 근거 |
|---|------|------|------|
| S1 | Drizzle 스키마 | N/A | DB 없음 |
| S2 | 상수 모듈화 | ⚠️ 부분 | `data/` 분리 완료, `shared/constants` 패턴은 미적용 |
| S3 | Zod 검증 | ✅ 충족 | `validators.ts`로 입력/쿼리/계산 경로 검증 |

### 배포 (D1~D3)
| # | 항목 | 상태 | 근거 |
|---|------|------|------|
| D1 | GitHub Actions | ✅ 충족 | `.github/workflows/ci.yml` |
| D2 | Docker 빌드 | N/A | Vercel 정적 배포 전략상 필수 아님 |
| D3 | 헬스체크 | N/A | 정적 사이트 |

---

## 열린 이슈

### [ISSUE-11] 디자인 품질/직관성 개선 — 중간 (부분 해결)

**현재 반영 완료**
- 홈 상단 정보 위계 재배치 (입력 전 가치/사용 흐름 제시)
- 요약 배너 강화 (근거 문구 + CTA)
- 입력/결과 동선 개선 (섹션 이동 CTA)
- 모바일 터치 타겟(44px 이상) 및 표 스크롤 힌트 보강
- GA4 UX 이벤트 계측 반영
  - `ux_first_input_completed`
  - `ux_results_viewed`
  - `ux_summary_cta_click`
  - `ux_section_navigate`
  - `ux_open_simulation`
  - `ux_open_fee_table`
  - `ux_share_modal_open`
  - `ux_share_link_copy_success/fail`
  - `ux_share_kakao_success/fail`

**잔여 작업 (운영 단계)**
- [ ] 11-7 GA4 실측 리포트 작성
  - 기준 기간: 배포 후 7일
  - 문서:
    - `docs/UX_GA4_OPERATION_GUIDE.md`
    - `docs/UX_MEASUREMENT_REPORT_TEMPLATE.md`
  - 자동 판정:
    - `scripts/ux/evaluate-kpi.mjs`
    - 입력 예시: `docs/UX_KPI_INPUT_EXAMPLE.json`
  - 실행 런북: `docs/UX_7DAY_RUNBOOK_2026-03-06.md`
- [ ] 11-8 사용자 테스트(5명) 수행 및 결과 정리
  - 스크립트: `docs/UX_USABILITY_TEST_SCRIPT.md`
  - 결과 템플릿: `docs/UX_USABILITY_RESULTS_TEMPLATE.md`

**권장 실행 순서**
1. 11-7: 배포 후 7일 실측 수집 → KPI 자동 판정 스크립트 실행
2. 11-8: 사용자 테스트 5명 수행 → 결과 템플릿 작성
3. ISSUE-11 종료 판단: 성공 지표 4개 충족 여부를 기준으로 상태 갱신

**성공 지표**
- 첫 입력 완료율 +20%
- 결과 도달 시간(중앙값) -30%
- 요약 CTA 클릭률 +15%
- 모바일 bounce proxy -15%

---

### [ISSUE-13] sitemap.xml 갱신 — ✅ 완료 (2026-03-07)

기존 14개 URL 제거, `/market-compare`, `/payment-compare`, `/shipping-compare` 추가. 6개 URL로 정리.

- [x] 13-1 기존 14개 URL 제거, `/market-compare` URL 추가
- [x] 13-2 `/payment-compare`, `/shipping-compare` URL 추가

---

### [ISSUE-14] Vercel 301 리다이렉트 설정 — ✅ 완료 (2026-03-07)

`vercel.json`에 `redirects` 배열 추가. 10개 기존 URL이 서버 단에서 301 Permanent Redirect로 `/market-compare`에 연결됨. Vercel은 `redirects`를 `rewrites`보다 먼저 평가하므로 SPA rewrite와 충돌 없음.

- [x] 14-1 `vercel.json`에 `redirects` 배열 추가 (10개 규칙)

### [ISSUE-15] 섹션 헤더/뱃지 중복 제거 — ✅ 완료 (2026-03-07)

section-heading-block(eyebrow + title + description)을 전면 제거하고, 카드 헤더(retro-titlebar / retro-details-summary)로 통합.

**HomeView — 6건 (section-heading-block 제거 → 카드 헤더로 통합)**
- [x] 15-1 "핵심 결론" section-heading 제거 (SummaryBanner 자체 충분)
- [x] 15-2 "마켓별 결과 비교" section-heading 제거 (MarketCardGrid 자체 충분)
- [x] 15-3 "월간 시뮬레이션" section-heading 제거 → details summary에 제목 통합
- [x] 15-4 "상세 비교표" section-heading 제거 → details summary에 제목 통합
- [x] 15-5 "셀러 비용 3축" section-heading 제거 → retro-panel + retro-titlebar로 감쌈
- [x] 15-6 "자주 묻는 질문" section-heading 제거 → `CompareFAQ.vue`에 retro-titlebar 복원

**ShippingCompareView — 3건 (section-heading-block 제거, retro-titlebar에 통합)**
- [x] 15-7 "일반 택배 6사 비교" section-heading 제거 → retro-titlebar에 제목+설명 통합
- [x] 15-8 "편의점 택배 2종 비교" section-heading 제거 → retro-titlebar에 제목+설명 통합
- [x] 15-9 "제주·도서산간 우편번호 기준표" section-heading 제거 → retro-titlebar에 제목+설명 통합

### [ISSUE-16] 데이터 정확성 재검증 — ✅ 완료 (2026-03-07)

정적 데이터와 소개 문구를 전수 확인한 결과, 공식 출처와 충돌하거나 기준일이 맞지 않는 항목이 확인됨.

**확인된 문제**
- `client/src/data/paymentGateways.ts`
  - 토스페이먼츠 PG 항목이 `cardFee: "3.2% ~ 3.3%"`로 표기되어 있음.
  - 토스페이먼츠 공식 `PG 수수료` 페이지(2026-03-07 확인)는 일반 신용·체크카드 3.4%, 간편결제 3.4%, 가입비 220,000원, 연관리비 110,000원으로 안내함.
  - 가입비/연관리비/정산주기 문구는 대체로 맞지만 카드 수수료 범위는 현재 표기가 공식 기본 요금과 불일치하거나 계약형 특례가 섞인 값일 가능성이 큼.
- `client/src/data/marketFees.ts`, `client/src/data/openMarketCompare.ts`
  - `G마켓/옥션`을 하나의 마켓과 하나의 수수료 표로 합쳐서 노출하고 있음.
  - ESM PLUS 공식 수수료 페이지는 G마켓과 옥션이 별도 페이지로 운영되며, 일부 세부 카테고리 수수료가 실제로 다름.
  - 예시: `기타건강관리용품`은 옥션 10%, G마켓 13%. `성인용품`은 옥션 11%, G마켓 12%.
  - 현재의 `전자기기 9%, 나머지 13%` 단일 구조는 계산 단순화용 가정으로는 가능하지만, "G마켓/옥션 공식 수수료"처럼 읽히면 오해 소지가 큼.
- `client/src/views/AboutView.vue`
  - 소개 문구가 `현재 반영 데이터는 2025년 6월 기준`이라고 안내하지만, 실제 데이터 상수는 `FEE_DATA_UPDATED = 2025.10`, `PAYMENT_DATA_UPDATED = 2026.03`, `SHIPPING_DATA_UPDATED = 2026.03`로 서로 다름.
  - 현재 문구는 사이트 전반의 데이터 기준월을 잘못 설명하고 있음.
- `client/src/data/shippingRates.ts`
  - `전남 신안 섬지역 3` 우편번호가 `28826`으로 저장되어 있음.
  - 현재 출처로 사용 중인 캠페이너스 도움말 원문에도 동일하게 `28826`이 적혀 있으나, 앞뒤 구간이 모두 `588xx` 대역이라 원문 오탈자 가능성이 높음.
  - 출처 1건만으로는 확정이 어려우므로 2차 출처 확인 전까지는 확정 데이터로 취급하면 위험함.

**작업 완료**
- [x] 16-1 토스페이먼츠 카드 수수료 `3.2%~3.3%` → `기본 3.4% (계약별 상이)`로 공식 기준 반영
- [x] 16-2 G마켓/옥션 비고를 "대표값 기준 합산 표기, 세부 카테고리는 별도 확인"으로 명시 + 계산 로직 주석 보강
- [x] 16-3 `AboutView` 기준월 문구를 데이터 상수(`FEE_DATA_UPDATED`, `PAYMENT_DATA_UPDATED`, `SHIPPING_DATA_UPDATED`) import로 동적 표시
- [x] 16-4 `28826` 우편번호에 "58826 오탈자 가능" 노트 추가 + TODO 주석 (2차 출처 확인 시 확정)

**검증 출처 (2026-03-07 확인)**
- 토스페이먼츠 PG 수수료: https://www.tosspayments.com/about/fee
- 옥션 서비스 이용료: https://item.esmplus.com/auction-service-fee.html
- G마켓 판매서비스 이용료: https://item.esmplus.com/gmarket-service-fee.html
- 제주도 및 도서산간 지역 기준표: https://help.campaignus.me/ko/articles/%EC%A0%9C%EC%A3%BC%EB%8F%84-%EB%B0%8F-%EB%8F%84%EC%84%9C%EC%82%B0%EA%B0%84-%EC%A7%80%EC%97%AD-%EA%B8%B0%EC%A4%80%ED%91%9C-342d2e5e

### [ISSUE-17] 비교 테이블 열/행 전치 + 가독성 개선 — ✅ 완료 (2026-03-07)

ShippingCompareView(택배비 비교)의 테이블 패턴(업체=행, 항목=열)으로 결제 수수료·오픈마켓 비교 페이지를 통일.

**변경 내용**
- [x] 17-1 `PaymentCompareView` — 모바일 카드 + 데스크톱 전치 테이블 → 단일 스크롤 테이블 (행=서비스, 열=항목)
- [x] 17-2 `OpenMarketCompareView` — 동일 패턴 적용
- [x] 17-3 `paymentGateways.ts` — 셀 데이터에 개행(`\n`) 추가 (수수료 범위, 정산주기, 비고)
- [x] 17-4 `openMarketCompare.ts` — 정산주기·비고 개행 보강
- [x] 17-5 셀 데이터 폰트 크기 `text-caption`(13px) → `text-[12px]`(12px) 축소
- [x] 17-6 타이틀바에 "최저 수수료" 뱃지 추가 (ShippingCompareView의 "최저가" 뱃지와 동일 패턴)

**번들 크기 변화**
- OpenMarketCompareView: 9.44 kB → 6.67 kB (gzip 3.55 → 2.98 kB)
- PaymentCompareView: 10.05 kB → 6.80 kB (gzip 3.69 → 3.09 kB)

---

## 종결/상태전환 이슈

- ISSUE-01 Zod 입력 검증
- ISSUE-02 TypeScript strict 모드
- ISSUE-03 글로벌 에러 핸들러
- ISSUE-04 Router 타이틀 동적 설정
- ISSUE-05 유틸 테스트 커버리지
- ISSUE-06 CI/CD 파이프라인
- ISSUE-07 `.env.example` 설명
- ISSUE-08 Vite 청크 전략
- ISSUE-09 수수료 기준일 UI 노출 (부분 해결)
- ISSUE-10 Docker 빌드 (N/A 전환)
- ISSUE-12 네비게이션 구조 개선 6탭→4탭 (**2026-03-07 완료**)
- ISSUE-13 sitemap.xml 갱신 (**2026-03-07 완료**)
- ISSUE-14 Vercel 301 리다이렉트 설정 (**2026-03-07 완료**)
- ISSUE-15 섹션 헤더/뱃지 중복 제거 (**2026-03-07 완료**)
- ISSUE-16 데이터 정확성 재검증 (**2026-03-07 완료**)
- ISSUE-17 비교 테이블 열/행 전치 + 가독성 개선 (**2026-03-07 완료**)

### [ISSUE-12] 네비게이션 구조 개선 — ✅ 완료 (2026-03-07)

**변경 내용**:
카테고리 비교, 가격대 비교, 마켓 가이드 3개 페이지가 실시간 계산기와 역할 중복 → 정적 레퍼런스 비교표 1장(`OpenMarketCompareView`)으로 통합.

```
Before: 실시간 계산기 | 카테고리 비교 | 가격대 비교 | 결제 수수료 | 택배비 비교 | 마켓 가이드
After:  수수료 계산기 | 오픈마켓 비교 | 결제 수수료 | 택배비 비교
```

**작업 완료 목록**:
- [x] 12-1 `src/data/openMarketCompare.ts` 신규 생성 (정적 비교 데이터)
- [x] 12-2 `src/views/OpenMarketCompareView.vue` 신규 생성 (PaymentCompareView 패턴 복제)
- [x] 12-3 `src/router/index.ts` — `/market-compare` 추가 + 기존 10개 URL 리다이렉트
- [x] 12-4 `src/components/common/TabNavigation.vue` — 6탭→4탭
- [x] 12-5 `src/views/HomeView.vue` — "더 알아보기" 패널 단순화
- [x] 12-6 삭제: `CategoryCompareView.vue`, `PriceCompareView.vue`, `MarketDetailView.vue`
- [x] 12-7 빌드 검증: `typecheck` ✅ + `build` ✅

**파생 이슈**: ISSUE-13 (sitemap 갱신), ISSUE-14 (Vercel 301 리다이렉트)

---

## 최근 품질 검증

### 2026-03-07 로컬 검증 결과 (최종)
- `cd client && npx vue-tsc --noEmit` ✅ 통과
- `cd client && npm run build` ✅ 통과
- 빌드 산출물: OpenMarketCompareView 6.67 kB (gz 2.98), PaymentCompareView 6.80 kB (gz 3.09)

### 2026-03-07 데이터 정확성 점검
- 정적 데이터 파일(`marketFees.ts`, `openMarketCompare.ts`, `paymentGateways.ts`, `shippingRates.ts`) 수동 대조
- 공식 공개 페이지 기준 교차 확인:
  - 토스페이먼츠 PG 수수료
  - ESM PLUS G마켓/옥션 수수료 안내
  - 캠페이너스 제주·도서산간 우편번호 기준표

### 2026-03-06 UX KPI 도구 검증
- `node scripts/ux/evaluate-kpi.mjs docs/UX_KPI_INPUT_EXAMPLE.json` ✅ 실행 성공

---

### [ISSUE-18] 디자인 품질 정밀 점검 — 신규 (2026-03-08)

전체 프론트엔드 컴포넌트를 코드 수준에서 정밀 리뷰한 결과, 레이아웃·일관성·반응형·색상·접근성·다크모드 영역에서 22건의 어색한 사항을 확인.

#### 18-A. 레이아웃/구조적 어색함

**18-A1. HomeView 정보 계층 과밀 (High) — ✅ 해결 (2026-03-08)**
- 위치: `HomeView.vue` 전체
- 현상: Hero(3 STEP 안내) → 입력폼 → SummaryBanner(오렌지 그라데이션) → MarketCardGrid(4카드) → 광고 → 시뮬레이션 → 상세비교표 → 셀러 비용 3축 → 더 알아보기 → FAQ → 광고가 한 페이지에 모두 나열
- 문제: SummaryBanner의 시각적 무게(오렌지 그라데이션 + 큰 글씨)와 바로 아래 MarketCardGrid의 정보 밀도가 겹치면서 시선이 분산됨
- 해결: `SummaryBanner` 아래의 `MarketCardGrid`를 `마켓별 결과 카드` 접힘 패널로 전환해 첫 화면에서 요약과 상세 카드가 동시에 경쟁하지 않도록 정리

**18-A2. "더 알아보기" 섹션 중복/고아 상태 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `HomeView.vue:368-377`
- 현상: "더 알아보기" 패널에 "오픈마켓 수수료 한눈에 비교" 링크 하나만 존재
- 문제: 바로 위 "셀러 비용 3축" 섹션에서 이미 오픈마켓/결제/택배 비교 페이지로 이동하는 카드 3개가 있어 역할이 중복됨
- 해결: 별도 패널을 제거하고 `셀러 비용 3축` 본문에 `오픈마켓 비교` 인라인 링크로 통합

**18-A3. ShippingCompareView 입력+결과가 하나의 패널에 과밀 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:285-414`
- 현상: 설명, 현재 조건 요약, 팩트카드 4개, 무게 입력, 크기 입력이 모두 하나의 `retro-panel` 안에 존재
- 문제: HomeView에서는 입력(CompareInput)과 결과(MarketCardGrid)가 별도 섹션으로 분리되어 있는데, 택배비 비교에서는 한 패널에 모든 것이 몰려 있어 페이지 간 구조 일관성이 깨짐
- 해결: 소개/현재 조건 요약 패널과 `운임 조건 입력` 패널을 분리

**18-A4. 제주·도서산간 우편번호 정리표 과도한 비중 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:620-733`
- 현상: 택배비 비교의 핵심 기능(운임 비교)과 관련성이 낮은 참고 데이터가 같은 수준으로 노출
- 해결: 우편번호 정리표 전체를 기본 접힘 패널로 전환

#### 18-B. 컴포넌트 일관성 문제

**18-B1. 패널 border-radius 불일치 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `main.css (.retro-panel: rounded-2xl)` vs `MarketCard.vue:40 (rounded-3xl)` vs `MonthlySim.vue:174 (rounded-3xl)`
- 문제: `retro-panel` 디자인 시스템은 `rounded-2xl`(1rem)인데, MarketCard/MonthlySim 카드는 `rounded-3xl`(1.5rem) 적용
- 해결: `MarketCard.vue`, `MonthlySim.vue`의 카드 래퍼를 `rounded-2xl`로 조정해 `retro-panel` 기준 곡률과 맞춤

**18-B2. 버튼 border-radius 혼재 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `button/index.ts`
- 현상: `chipSm` → `rounded-lg`, `iconSm` → `rounded-md`로 3단계 혼재
- 해결: 2단계 체계로 통일 — `rounded-lg` (기본/아이콘), `rounded-xl` (chip계열)

**18-B3. heading 태그 계층 불일치 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: 여러 뷰
- 현상:
  - HomeView: `h1` → `h2` → `h2` → `h3` → `h2` (h3 뒤에 h2 등장)
  - ShippingCompareView: `h1` → `span.retro-title` → `span.retro-title` (heading 아닌 span 사용)
  - OpenMarketCompareView: `h1` 하나만 존재
- 해결: `ShippingCompareView`의 섹션 제목을 실제 `h2`로 유지하고, `HomeView` 비용 3축 카드 제목은 문서 heading이 아닌 본문 텍스트로 내려 문서 계층을 `h1 → h2` 흐름으로 정리

#### 18-C. 반응형/모바일 어색함

**18-C1. CompareHint 툴팁이 터치 기기에서 작동 불가 (High) — ✅ 해결 (2026-03-08)**
- 위치: `CompareHint.vue`
- 현상: 물음표 아이콘의 상세 설명이 `mouseenter`/`mouseleave`로만 트리거. `@focus` 핸들러가 있지만 `MouseEvent`로 캐스팅하여 좌표를 구하므로 키보드/터치에서 위치가 부정확
- 문제: 오픈마켓/결제/택배 비교 테이블의 핵심 부가 정보(수수료 조건 등)가 모바일 사용자에게 접근 불가
- 해결: `CompareHint.vue`를 클릭/탭 토글 + 포커스 기반 위치 계산 + 외부 클릭 닫기 구조로 개편

**18-C2. SummaryBanner 모바일에서 정보 과밀 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `SummaryBanner.vue`
- 현상: 모바일에서 단일 컬럼 전환 시 리더 카드 + 델타 카드 + context + CTA 버튼 + facts 4개가 세로로 쌓여 화면 2~3스크롤 분량
- 해결: 모바일에서 facts 4개를 기본 접힘 `details`로 전환하고, 배너 내부 패딩·간격도 함께 줄여 첫 화면 높이를 압축

**18-C3. ShareModal 하단 시트 스타일 불완전 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `ShareModal.vue:48`
- 현상: 모바일에서 `items-end`로 하단 정렬하지만, `rounded-b-none`이 없어 하단에 불필요한 둥근 모서리와 간격 존재
- 해결: 모바일 하단 정렬 시 `rounded-b-none`과 `mb-0`를 적용해 실제 bottom sheet처럼 바닥에 붙도록 조정

**18-C4. FeeCompareTable sticky header와 TabNavigation 겹침 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `FeeCompareTable.vue:93`
- 현상: `thead`가 `sticky top-0 z-10`이고 TabNavigation이 `sticky top-0 z-50`. details 패널 안에서 스크롤 시 thead가 tab nav 뒤로 들어감
- 해결: `FeeCompareTable.vue` thead의 sticky 오프셋을 `top-12`로 조정해 TabNavigation 높이만큼 아래에서 고정되도록 변경

#### 18-D. 색상/대비 문제

**18-D1. 마켓 브랜드 배지의 작은 글씨 대비 부족 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: 테이블 내 마켓명 배지 (OpenMarketCompareView:175, PaymentCompareView:168, ShippingCompareView:464)
- 현상: `:style="{ backgroundColor: market.color }"` + `text-white` + `text-tiny font-bold`에서:
  - G마켓 `#00B050`(초록) + 흰색 → WCAG AA(4.5:1) 미달 우려
  - 11번가 `#FF6B00`(데이터 파일) vs `#FF0B0B`(tailwind config) → 색상 불일치
- 해결: 오픈마켓·결제 서비스·택배 비교표 배지에 배경색 기준 대비 계산을 적용해 밝은 브랜드 색에서는 어두운 텍스트를 사용하도록 조정

**18-D2. SummaryBanner 내 하드코딩된 색상 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `SummaryBanner.vue`
- 현상: `bg-emerald-100`, `text-emerald-700`, `bg-slate-950/90` 등 디자인 토큰(`profit`, `fee`)을 쓰지 않고 Tailwind 기본 색상 직접 사용
- 해결: `SummaryBanner.vue`의 emerald/slate 직접 색상을 `profit`, `foreground`, `card` 계열 시맨틱 색상으로 정리

**18-D3. MarketCard/MonthlySim hex+opacity 직접 연결 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `MarketCard.vue:58`, `MonthlySim.vue:181`
- 현상: `meta.color + '18'` (예: `#03C75A18`) — 나머지 디자인 시스템은 HSL 기반이라 색상 체계 혼재
- 해결: `meta.color + '18'` 직접 연결을 제거하고 `toBrandTint()` 계산 함수로 브랜드 tint 배경을 생성하도록 변경

#### 18-E. 접근성 (a11y)

**18-E1. 입력 필드와 label 미연결 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `CompareInput.vue:122-132` (판매가), `CompareInput.vue:200-210` (배송비)
- 현상: `id="price-input"`, `id="shipping-input"` 존재하지만 상위 레이블("판매가", "배송비")은 `<span>` 태그로 `for` 속성 없음
- 해결: 카드 헤더 텍스트를 실제 `<label for>`로 교체

**18-E2. MonthlySim 프로그레스 바 시맨틱 부재 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `MonthlySim.vue:253-261`
- 현상: "연 수수료 상대 크기" 프로그레스 바가 `<div>` + width 스타일로만 구현 — `role`, `aria-label` 없음
- 제안: `role="meter"` + `aria-label` + `aria-valuenow` 추가

**18-E3. ShippingCompareView 입력 필드 label 미연결 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:342-349` (무게), `ShippingCompareView.vue:395-404` (3변 합)
- 현상: 무게 입력에 `id` 없고, 3변 합 입력은 `<label>` 사용하지만 `for` 없음
- 해결: `shipping-weight-input`, `shipping-sum-input` id 추가 후 `<label for>` 연결

#### 18-F. 타이포그래피/콘텐츠

**18-F1. 유사한 제목 메시지 중복 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `HomeView.vue:210` vs `CompareInput.vue:109`
- 현상: HomeView h1 "오픈마켓 수수료를 30초 안에 비교해보세요" / CompareInput h2 "내 상품 수수료 한눈에 비교하기" — 바로 인접한 두 제목이 같은 의도 반복
- 제안: CompareInput 제목을 입력 행위에 집중하는 문구로 변경 (예: "상품 정보 입력")

**18-F2. FeeCompareTable 스크롤 힌트 위치 어색 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `FeeCompareTable.vue`
- 해결: scroll-hint를 `overflow-x-auto` div 안 테이블 바로 위로 이동

#### 18-G. 다크모드 전환 어색함

**18-G1. 비교표 최저 행 하이라이트 다크모드 가시성 약함 (Low) — ✅ 해결 (2026-03-09)**
- 위치: OpenMarketCompareView, PaymentCompareView, ShippingCompareView의 `bg-profit/5`
- 현상: 다크모드에서 5% 불투명도 하이라이트가 거의 보이지 않음
- 제안: 다크모드에서 불투명도 높이기 (예: `dark:bg-profit/10`)

**18-G2. 비교표 뱃지 다크모드 텍스트 대비 (Low)**
- 위치: 비교 뷰의 `bg-emerald-50` / `border-emerald-300/60` 등
- 현상: 다크모드용 배경 전환은 되어 있으나, 일부 텍스트(`text-foreground`)가 다크모드 어두운 배경 위에서 대비 약할 수 있음
- 제안: 다크모드 뱃지에 `dark:text-emerald-200` 등 명시적 텍스트 색상 확인

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 18-A1 | HomeView 정보 계층 과밀 | 레이아웃 |
| High | 18-C1 | CompareHint 터치 기기 미지원 | 반응형 |
| Medium | 18-A2 | "더 알아보기" 섹션 중복/고아 | 레이아웃 |
| Medium | 18-A3 | ShippingCompare 입력+결과 미분리 | 레이아웃 |
| Medium | 18-B1 | 패널 border-radius 불일치 | 일관성 |
| Medium | 18-B3 | heading 태그 계층 불일치 | 일관성 |
| Medium | 18-C2 | SummaryBanner 모바일 과밀 | 반응형 |
| Medium | 18-D1 | 브랜드 배지 글씨 대비 부족 | 색상 |
| Medium | 18-E1 | 입력 label 미연결 | 접근성 |
| Low | 18-A4 | 도서산간 우편번호표 과도 노출 | 레이아웃 |
| Low | 18-B2 | 버튼 border-radius 혼재 | 일관성 |
| Low | 18-C3 | ShareModal 하단 시트 불완전 | 반응형 |
| Low | 18-C4 | FeeCompareTable sticky 겹침 | 반응형 |
| Low | 18-D2 | SummaryBanner 하드코딩 색상 | 색상 |
| Low | 18-D3 | hex+opacity 직접 연결 | 색상 |
| Low | 18-E2 | 프로그레스 바 시맨틱 부재 | 접근성 |
| Low | 18-E3 | ShippingCompare label 미연결 | 접근성 |
| Low | 18-F1 | 유사 제목 중복 | 타이포그래피 |
| Low | 18-F2 | 스크롤 힌트 위치 어색 | 타이포그래피 |
| Low | 18-G1 | 다크모드 행 하이라이트 약함 | 다크모드 |
| Low | 18-G2 | 다크모드 뱃지 텍스트 대비 | 다크모드 |

### [ISSUE-19] OpenMarketCompareView 디자인 품질 점검 — 신규 (2026-03-08)

`/market-compare` 오픈마켓 비교 화면을 집중 점검한 결과, 테이블 가독성·모바일 대응·정보 설계·색상·일관성 영역에서 14건의 어색한 사항을 확인.

#### 19-A. 테이블 구조/가독성

**19-A1. 모바일 좌우 스크롤 시 마켓명 열 고정 없음 (High) — ✅ 해결 (2026-03-08)**
- 위치: `OpenMarketCompareView.vue:151-211`
- 현상: 6열(오픈마켓 + 입점비 + 판매수수료 + 배송비수수료 + 정산주기 + 비고) 테이블이 모바일에서 가로 스크롤 필요. 그런데 첫 번째 열(마켓명+배지)이 고정되지 않아 스크롤 시 어떤 마켓의 데이터인지 알 수 없음
- 비교: ShippingCompareView의 FeeCompareTable에는 `scroll-hint`가 있지만, 이 페이지에는 힌트조차 없음
- 해결: 첫 번째 열에 `sticky left-0`를 적용하고 모바일용 `scroll-hint`를 추가

**19-A2. 입점비 열이 4개 마켓 모두 "무료"로 동일 — 비교 가치 없는 열 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `OpenMarketCompareView.vue:31`, `openMarketCompare.ts` 각 마켓의 `setupFee`
- 현상: 4개 마켓 모두 `setupFee.core: "무료"`, 4개 셀 모두 `compare-cell-highlight` 적용. 차이가 없는 열이 가로 공간을 차지하면서 모바일 스크롤 부담을 키움
- 해결: `입점비` 열을 제거하고 상단 요약을 `4개 마켓 모두 무료 입점` 문맥형 표현으로 대체

**19-A3. 테이블 내 폰트 크기 3단계 혼재 (Low)**
- 위치: `OpenMarketCompareView.vue:152` (`text-body` = 14px) + `thead` (`text-caption` = 13px) + 셀 (`compare-cell-value` = 12px)
- 현상: 같은 테이블에서 본문 14px → 헤더 13px → 셀 12px으로 3단계가 혼재. 헤더가 셀보다 크면서도 셀보다 얇은 `font-semibold`여서 시각 위계가 모호
- 제안: 테이블 기본 `text-body` 제거하고, thead/td 각각에 명시적 크기 적용. 또는 셀 크기를 `text-caption`으로 통일

**19-A4. 비고 열의 정보가 마켓마다 성격이 이질적 (Low)**
- 위치: `openMarketCompare.ts` 각 마켓의 `note`
- 현상: 스마트스토어 "등급+유입경로 분리형", 쿠팡 "로켓그로스 물류비 별도"(caution), 11번가 "카테고리 단일형 구조", G마켓 "대표값 기준 표기" — 구조적 특성·추가비용·데이터 표기 방식이 혼재
- 제안: 비고 열의 목적을 "주의사항" 또는 "구조 특성"으로 통일하고, 성격이 다른 내용은 CompareHint tooltip으로 분리

#### 19-B. 모바일/반응형

**19-B1. CompareHint 터치 기기에서 수수료 조건 접근 불가 (High) — ✅ 해결 (2026-03-08)**
- 위치: `CompareHint.vue` (이 페이지에서 7개 셀에 사용됨)
- 현상: 판매수수료(스마트스토어: tooltip+condition, 쿠팡: tooltip), 배송비(스마트스토어: tooltip), 정산주기(쿠팡: tooltip), 비고(스마트스토어/11번가: tooltip, 쿠팡/G마켓: condition)의 핵심 부가 정보가 hover 전용
- 문제: 이 페이지의 핵심 가치(수수료 조건 비교)인데, 모바일 사용자가 tooltip을 볼 수 없어 "영세 1.95%~"가 어떤 조건인지 파악 불가
- 해결: 공통 `CompareHint.vue` 개선으로 탭/클릭 토글 지원

**19-B2. FreshBadge가 모바일에서 타이틀바 줄바꿈 유발 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `OpenMarketCompareView.vue:125-130`
- 현상: 타이틀바에 `h1.retro-title`("오픈마켓 비교")와 `FreshBadge`("2025.10 수수료 데이터 반영")가 `justify-between`으로 배치. 모바일(360px 이하)에서 FreshBadge의 텍스트가 길어 타이틀바가 2줄로 높아지거나 레이아웃이 흐트러질 수 있음
- 해결: 타이틀바를 모바일 세로 배치 허용 구조로 바꾸고 FreshBadge 메시지를 `2025.10 반영`으로 축약

#### 19-C. 정보 설계/콘텐츠

**19-C1. "무료 입점 4/4" 뱃지가 무의미한 정보 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `OpenMarketCompareView.vue:138-141`
- 현상: 4개 마켓 모두 무료 입점이므로 "4/4"는 차이를 보여주지 않음. 비교 가치가 없는 수치가 요약 뱃지로 강조됨
- 해결: `4개 마켓 모두 무료 입점` 문맥형 표현으로 변경

**19-C2. 본문 내 CTA 연결 부재 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `OpenMarketCompareView.vue:133-136`
- 현상: "실시간 계산이 필요하면 수수료 계산기에서 바로 확인할 수 있습니다"라는 문장에 링크가 없음. CTA 버튼("홈으로 돌아가 계산기 사용하기")은 페이지 최하단에만 존재
- 해결: 본문 문장 안에 `수수료 계산기` 인라인 링크 추가

**19-C3. 하단 면책 문구와 테이블 간 시각 구분 약함 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `OpenMarketCompareView.vue:213-215`
- 현상: 면책 문구(`rounded-[1.2rem] bg-muted/20`)가 테이블과 `space-y-4` 간격으로 붙어있어, 테이블의 마지막 셀과 면책 문구의 경계가 모호
- 해결: 하단 안내를 `mt-2` 여백 + 경고 아이콘 + amber 톤 안내 박스로 바꿔 표 본문과 시각적으로 분리

**19-C4. 광고 → CTA 버튼 사이 페이지 하단 산만 (Low)**
- 위치: `OpenMarketCompareView.vue:219-225`
- 현상: `retro-panel` (테이블) → AdSlot → CTA 버튼이 3개 독립 블록으로 나열. 광고와 CTA 사이에 시각적 연결이 없어 페이지 끝이 마무리되지 않은 느낌
- 제안: CTA 버튼을 retro-panel 내부 하단으로 이동하거나, 광고를 CTA 아래로 배치

**19-C5. 오픈마켓 비교에 계산기 직접 포함 시 Home과 역할 중복 재발 (Medium)**
- 위치: `OpenMarketCompareView.vue` 전체 vs `HomeView.vue:221-330`
- 현상: 현재 구조는 Home이 입력형 계산기, OpenMarketCompareView가 정적 레퍼런스 비교표로 역할이 분리돼 있음. 여기에 `CompareInput + MarketCardGrid + FeeCompareTable` 성격의 계산기를 다시 넣으면 Home의 핵심 기능이 `/market-compare`로 복제됨
- 문제: 네비게이션 상에서 `수수료 계산기`와 `오픈마켓 비교`의 차이가 다시 흐려지고, 기존 ISSUE-12에서 정리한 IA 분리가 무너질 수 있음. 유지보수 측면에서도 계산 로직/카피/추적 이벤트를 두 화면에서 동시에 관리하게 됨
- 제안: 계산기는 Home에 유지하고, `OpenMarketCompareView`에는 현재처럼 인라인 CTA 또는 축약 입력 링크만 두는 방향이 더 적절

#### 19-D. 색상/스타일 일관성

**19-D1. 11번가 브랜드 색상 불일치 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `openMarketCompare.ts:84` (`#FF6B00`) vs `tailwind.config.ts:103` (`#FF0B0B`) vs `marketFees.ts:23` (`#FF6B00`)
- 현상: 데이터 파일(주황 `#FF6B00`)과 Tailwind config(빨강 `#FF0B0B`)의 11번가 색상이 다름. CompareInput의 고급 설정에서는 `border-market-elevenst`/`bg-market-elevenst`가 사용되어 빨강이 적용되고, 비교 테이블에서는 데이터 파일의 주황이 적용됨
- 해결: `client/tailwind.config.ts`의 `market.elevenst`를 `#FF6B00`으로 통일

**19-D2. FreshBadge와 요약 뱃지의 모서리/스타일 불일치 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `FreshBadge.vue:15` (`rounded` = 0.25rem) vs 요약 뱃지 (`rounded-full`)
- 현상: FreshBadge는 `rounded`(각진 모서리), 바로 아래 요약 뱃지("무료 입점", "최저 수수료")는 `rounded-full`(완전 원형). 같은 정보 요약 라인에서 모서리 스타일이 다름
- 해결: `FreshBadge.vue`를 `rounded-full` + 짧은 라벨 구조로 통일

**19-D3. PaymentCompareView와 서브타이틀 구조 차이 (Low)**
- 위치: `OpenMarketCompareView.vue:180-191` vs `PaymentCompareView.vue:174-186`
- 현상: PaymentCompareView는 마켓명 아래에 `gateway.badge`(예: "PG 인프라", "네이버쇼핑 연동") 서브타이틀이 있는데, OpenMarketCompareView에는 이 구조가 없음. 같은 비교 테이블 패턴인데 마켓 셀의 정보 밀도가 다름
- 제안: 오픈마켓에도 짧은 서브타이틀 추가 (예: 스마트스토어 "등급·유입 분리형", 쿠팡 "자체배송+판매자배송") 또는 PaymentCompareView에서 badge 제거로 통일

**19-D4. 최저 행 하이라이트 `bg-profit/5` 가시성 부족 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `OpenMarketCompareView.vue:170`
- 현상: 스마트스토어(최저 수수료) 행에 `bg-profit/5` 적용. 라이트모드에서도 5% 불투명도는 거의 안 보이고, 다크모드에서는 사실상 투명
- 비교: 최저 뱃지(`bg-profit text-white`)는 잘 보이지만, 행 전체 하이라이트가 뱃지의 시각적 무게와 불균형
- 제안: `bg-profit/8 dark:bg-profit/12`로 강화하거나, 왼쪽 테두리 강조(`border-l-3 border-profit`) 추가

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 19-A1 | 모바일 스크롤 시 마켓명 열 고정 없음 | 테이블 |
| High | 19-B1 | CompareHint 터치 미지원 (7개 셀) | 반응형 |
| Medium | 19-A2 | 입점비 열 4/4 동일 — 비교 가치 없음 | 테이블 |
| Medium | 19-B2 | FreshBadge 모바일 줄바꿈 | 반응형 |
| Medium | 19-C1 | "무료 입점 4/4" 뱃지 무의미 | 정보 설계 |
| Medium | 19-C2 | 본문 내 계산기 CTA 링크 없음 | 정보 설계 |
| Medium | 19-C5 | 계산기 직접 포함 시 Home과 역할 중복 재발 | 정보 설계 |
| Medium | 19-D1 | 11번가 브랜드 색상 불일치 | 색상 |
| Low | 19-A3 | 테이블 폰트 크기 3단계 혼재 | 테이블 |
| Low | 19-A4 | 비고 열 정보 성격 이질적 | 테이블 |
| Low | 19-C3 | 면책 문구-테이블 시각 구분 약함 | 정보 설계 |
| Low | 19-C4 | 페이지 하단(광고→CTA) 산만 | 정보 설계 |
| Low | 19-D2 | FreshBadge-요약뱃지 모서리 불일치 | 스타일 |
| Low | 19-D3 | PaymentCompare와 서브타이틀 구조 차이 | 일관성 |
| Low | 19-D4 | 최저 행 하이라이트 가시성 부족 | 색상 |

### [ISSUE-20] PaymentCompareView 디자인 품질 점검 — 신규 (2026-03-08)

`/payment-compare` 결제 수수료 비교 화면을 집중 점검한 결과, 색상 대비·정보 설계·모바일 대응·데이터 일관성 영역에서 15건의 어색한 사항을 확인.

#### 20-A. 색상/대비 (이 페이지 고유)

**20-A1. 카카오페이 배지 노란 배경 + 흰 글씨 — 대비 심각 미달 (High) — ✅ 해결 (2026-03-08)**
- 위치: `PaymentCompareView.vue:168-172`, `paymentGateways.ts:111` (`#FFCD00`)
- 현상: 카카오페이 배지가 `backgroundColor: #FFCD00`(밝은 노란) + `text-white` + `text-tiny font-bold`(11px). 노란 배경 위 흰 텍스트는 WCAG AA 대비비(4.5:1) 기준 **약 1.5:1 수준**으로 심각하게 미달. 글자가 거의 보이지 않음
- 비교: 다른 배지(토스 `#0064FF`, 네이버 `#03C75A`, 페이코 `#FA2828`)는 흰 글씨 대비가 양호하지만, 노란색만 예외
- 해결: 카카오페이 배지에만 `text-[#3B1E00]`를 적용해 작은 글씨 대비를 확보

**20-A2. 네이버페이 주문형/결제형 배지 색상이 너무 유사 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `paymentGateways.ts:61` (`#03C75A`) vs `paymentGateways.ts:86` (`#00A862`)
- 현상: 두 행의 배지가 거의 동일한 초록. 테이블에서 두 행이 나란히 위치하면 배지만으로 구분 불가. shortName도 "주문형"/"결제형"으로 의미가 직관적이지 않음
- 해결: 결제형 배지 색상을 청록 `#0099B8`으로 분리하고 shortName을 `N주문`/`N결제`로 변경

**20-A3. 최저 행(카카오페이) 하이라이트 `bg-profit/5` 가시성 부족 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `PaymentCompareView.vue:164`
- 현상: 19-D4와 동일. 라이트모드에서도 5% 불투명도 하이라이트가 거의 안 보이고, 다크모드에서는 사실상 투명
- 제안: `bg-profit/8 dark:bg-profit/12`로 강화

#### 20-B. 정보 설계/콘텐츠

**20-B1. 페이지 제목 "간편결제 비교"에 PG 서비스가 포함됨 — 범주 혼재 (High) — ✅ 해결 (2026-03-08)**
- 위치: `PaymentCompareView.vue:120` (`<h1>간편결제 비교</h1>`)
- 현상: 토스페이먼츠는 PG 인프라(결제창·정산·위험관리 전체 제공)이고, 네이버페이 주문형은 오픈마켓 연동형, 카카오페이/PAYCO는 간편결제. 서비스 범주가 다른 5개를 "간편결제"라는 제목으로 묶으면 사용자가 동일 카테고리로 오해
- 해결: 페이지 제목과 SEO 타이틀을 `결제 서비스 비교`로 변경

**20-B2. 최저 수수료 뱃지가 조건 차이를 감춤 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `PaymentCompareView.vue:177-183`, `paymentGateways.ts:112` (카카오페이 0.89%)
- 현상: 카카오페이가 `microBusinessRate: 0.89%`로 최저 표시되지만, 정산주기가 "연동 PG 정책 따름"이고 비고에 "PG 연동 구조에 따라 부가 비용 달라질 수 있음" 안내. PG 수수료가 별도 추가될 수 있어 실질 비용이 0.89%가 아닐 수 있는데, "최저" 뱃지가 이 조건을 감춤
- 해결: 최저 수수료 칩에 `CompareHint`를 붙여 "간편결제 단독 수수료 기준 / PG 연동 시 추가 비용 가능" 조건을 함께 노출

**20-B3. badge 속성과 note.core가 동일 텍스트 — 중복 표시 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `paymentGateways.ts`
- 현상:
  - 카카오페이: `badge: "간편결제 중심"` = `note.core: "간편결제 중심"` (완전 동일)
  - 페이코: `badge: "포인트 결제 특화"` = `note.core: "포인트 결제 특화"` (완전 동일)
- 문제: 테이블에서 마켓명 셀 하위에 badge가 표시되고, 비고 열에 동일한 텍스트가 다시 나타나 같은 정보가 한 행에 2번 노출
- 해결: `note.core`를 카카오페이 `PG 연동 비용 확인`, 페이코 `제휴·포인트 결제 강점`으로 조정해 badge와 역할을 분리

**20-B4. 정산주기 열: 5개 중 3개가 "서비스 정책 확인 필요" — 비교 가치 희박 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `paymentGateways.ts` 네이버 주문형·결제형·페이코의 `settlementCycle`
- 현상: 5개 서비스 중 3개가 동일하게 "서비스 정책 확인 필요"로 표시. 비교표의 핵심 가치(차이를 보여주는 것)가 약화됨. 카카오페이도 "연동 PG 정책 따름"으로 실질 비교 불가
- 해결: 열 제목을 `정산 기준`으로 바꾸고, 네이버 주문형·결제형·카카오페이·PAYCO의 core/tooltip을 서비스 구조별 안내로 분리해 동일 문구 반복을 줄임

**20-B5. 연회비 열 "없음" vs "무료" 용어 혼용 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `paymentGateways.ts` — 네이버·페이코: `"없음"`, 카카오: `"무료"`
- 현상: `isFreeValue()`는 둘 다 매칭하여 하이라이트는 동일하지만, 사용자에게는 "없음"(원래 존재하지 않는 항목)과 "무료"(원래 유료지만 면제)가 다른 의미. 같은 열에서 용어가 혼재
- 해결: 네이버 주문형·네이버 결제형·페이코의 연회비 표기를 `무료`로 통일

#### 20-C. 모바일/반응형

**20-C1. 모바일 좌우 스크롤 시 서비스명 열 고정 없음 (High) — ✅ 해결 (2026-03-08)**
- 위치: `PaymentCompareView.vue:145-206`
- 현상: 6열(결제 서비스 + 가입비 + 연회비 + 수수료 + 정산주기 + 비고) 테이블이 모바일에서 좌우 스크롤 필요하지만, 첫 번째 열(서비스명+배지)이 고정되지 않아 스크롤 시 어떤 서비스인지 알 수 없음. 스크롤 힌트도 없음
- 해결: 첫 번째 열에 `sticky left-0`를 적용하고 모바일용 `scroll-hint`를 추가

**20-C2. CompareHint 터치 기기에서 수수료 조건 접근 불가 (High) — ✅ 해결 (2026-03-08)**
- 위치: `CompareHint.vue` (이 페이지에서 8개 셀에 사용됨)
- 현상: 카드 수수료(토스: tooltip, 네이버 주문형/결제형: tooltip, 카카오: tooltip, 페이코: tooltip), 연회비(카카오: condition), 비고(토스/네이버 주문형/결제형/카카오: tooltip)의 핵심 조건이 hover 전용
- 문제: 특히 카카오페이 연회비의 "이벤트/정책 기간에 따라 변동 가능" 조건과, 카드 수수료의 "계약별 상이" 정보가 모바일에서 접근 불가
- 해결: 공통 `CompareHint.vue` 개선으로 탭/클릭 토글 지원

**20-C3. FreshBadge 모바일 타이틀바 줄바꿈 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `PaymentCompareView.vue:119-123`
- 현상: 19-B2와 동일 패턴. "2026.03 결제 수수료 비교 반영" 텍스트가 360px 이하에서 타이틀바 높이를 키움
- 해결: 타이틀바를 모바일 세로 배치 허용 구조로 바꾸고 FreshBadge 메시지를 `2026.03 반영`으로 축약

#### 20-D. 테이블 구조

**20-D1. 테이블 내 폰트 크기 3단계 혼재 (Low)**
- 위치: `PaymentCompareView.vue:146` (`text-body` = 14px) + thead (`text-caption` = 13px) + 셀 (`compare-cell-value` = 12px)
- 현상: 19-A3과 동일. 같은 테이블에서 본문 14px → 헤더 13px → 셀 12px 3단계 혼재

**20-D2. 가입비·연회비 열이 대부분 동일값 — 열 효율 낮음 (Low)**
- 위치: `paymentGateways.ts`
- 현상: 가입비는 4/5가 "무료", 연회비도 4/5가 "없음"/"무료". 토스페이먼츠만 유료(22만/11만). 2열이 거의 동일값으로 채워져 모바일 가로 공간 낭비
- 제안: 가입비·연회비를 하나의 "고정비" 열로 합치거나, 토스만 별도 표기하는 방식 검토

#### 20-E. 스타일 일관성

**20-E1. FreshBadge와 요약 뱃지 모서리 불일치 (Low) — ✅ 해결 (2026-03-08)**
- 위치: 19-D2와 동일
- 현상: FreshBadge `rounded`(0.25rem) vs 요약 뱃지 `rounded-full`
- 해결: `FreshBadge.vue`를 `rounded-full`로 통일

**20-E2. 면책 문구와 테이블 간 시각 구분 약함 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `PaymentCompareView.vue:208-210`
- 현상: 19-C3과 동일 패턴
- 해결: 결제 서비스 비교 하단 안내를 amber 톤 아이콘 안내 박스로 바꿔 표 본문과 구분

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 20-A1 | 카카오페이 배지 노란+흰 대비 심각 미달 | 색상 |
| High | 20-B1 | "간편결제 비교" 제목에 PG 포함 — 범주 혼재 | 정보 설계 |
| High | 20-C1 | 모바일 스크롤 시 서비스명 열 고정 없음 | 반응형 |
| High | 20-C2 | CompareHint 터치 미지원 (8개 셀) | 반응형 |
| Medium | 20-A2 | 네이버 주문형/결제형 배지 색상 거의 동일 | 색상 |
| Medium | 20-B2 | 최저 뱃지가 PG 추가 비용 조건 감춤 | 정보 설계 |
| Medium | 20-B3 | badge와 note.core 동일 텍스트 중복 | 정보 설계 |
| Medium | 20-B4 | 정산주기 3/5가 "확인 필요" — 비교 가치 희박 | 정보 설계 |
| Medium | 20-C3 | FreshBadge 모바일 줄바꿈 | 반응형 |
| Low | 20-A3 | 최저 행 하이라이트 가시성 부족 | 색상 |
| Low | 20-B5 | 연회비 "없음" vs "무료" 용어 혼용 | 정보 설계 |
| Low | 20-D1 | 테이블 폰트 크기 3단계 혼재 | 테이블 |
| Low | 20-D2 | 가입비·연회비 열 대부분 동일값 | 테이블 |
| Low | 20-E1 | FreshBadge-요약뱃지 모서리 불일치 | 스타일 |
| Low | 20-E2 | 면책 문구-테이블 시각 구분 약함 | 스타일 |

### [ISSUE-21] ShippingCompareView 디자인 품질 점검 — 신규 (2026-03-08)

`/shipping-compare` 택배비 비교 화면을 집중 점검한 결과, 입력 인터랙션·테이블 구조·모바일 대응·정보 설계·스타일 일관성 영역에서 18건의 어색한 사항을 확인. 이 페이지는 753줄로 전체 뷰 중 가장 길며, 입력 패널 + 일반 택배 테이블 + 편의점 택배 테이블 + 우편번호 정리표의 4개 대형 섹션으로 구성됨.

#### 21-A. 입력/인터랙션

**21-A1. 크기 버튼 활성 상태가 3변 합 입력 시 사라짐 — UX 혼란 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:377-383`
- 현상: 크기 버튼의 활성 스타일 조건이 `sumCm == null && selectedSize === sizeKey`. 사용자가 "소형"을 선택한 후 3변 합(예: 80cm)을 입력하면, 내부적으로 `resolveShippingSize(80)`이 여전히 "소형" 구간을 반환하지만 버튼의 활성 스타일은 해제됨
- 문제: 선택한 크기가 적용 중인데 시각적으로 선택 해제된 것처럼 보여, 현재 어떤 구간이 적용되고 있는지 혼란
- 해결: 크기 버튼 활성 조건을 `resolvedSize === sizeKey`로 변경해 3변 합 입력 시에도 현재 적용 구간이 유지되도록 조정

**21-A2. 입력 변경 후 결과 테이블까지 시각적 피드백 없음 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: 입력 패널(`ShippingCompareView.vue:281-410`) → 결과 테이블(`ShippingCompareView.vue:412-614`)
- 현상: 무게/크기를 변경하면 아래 테이블 값이 반응적으로 갱신되지만, 입력 패널과 결과 테이블이 별도 `section`으로 분리되어 있어 변경이 반영되었는지 시각적 피드백이 없음. 특히 모바일에서는 입력 패널이 화면 전체를 차지하므로 결과 테이블이 뷰포트 밖에 있을 가능성이 높음
- 해결: 입력 패널 상단에 `현재 적용 조건` 요약과 `결과 바로 보기` CTA를 추가해 모바일에서도 결과 반영 상태 확인과 결과 섹션 이동이 가능하도록 조정

**21-A3. 무게 입력 필드에 id/label 미연결 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:334,338-345`
- 현상: "무게 입력" 텍스트가 `<span>`이고, input에 `id` 없음. 3변 합 입력은 `<label>` 사용하지만 `for` 없고 input에 `id` 없음(line 389-401). 18-E3과 동일
- 해결: `shipping-weight-input`, `shipping-sum-input` id를 부여하고 각각 `<label for>`로 연결해 입력 라벨 접근성을 확보

#### 21-B. 테이블 구조/가독성

**21-B1. 모바일 좌우 스크롤 시 택배사 열 고정 없음 + 스크롤 힌트 없음 (High) — ✅ 해결 (2026-03-08)**
- 위치: 일반 택배 테이블(`ShippingCompareView.vue:437-509`), 편의점 택배 테이블(`ShippingCompareView.vue:539-610`)
- 현상: 5열(택배사 + 기본운임 + 무게추가 + 예상총운임 + 접수제한) 테이블이 모바일에서 가로 스크롤 필요. 첫 번째 열(택배사명+배지)이 고정되지 않아 스크롤 시 어떤 택배사인지 식별 불가. HomeView의 FeeCompareTable에는 `scroll-hint`가 있지만, 이 페이지의 두 테이블에는 힌트조차 없음
- 비교: 19-A1, 20-C1과 동일 패턴이지만, 이 페이지는 테이블이 2개여서 문제가 2배
- 해결: 일반/편의점 택배 테이블 모두 첫 열에 `sticky left-0`를 적용하고 모바일용 `scroll-hint`를 추가

**21-B2. "접수 불가" 행이 접수 가능 행과 시각적 구분 약함 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:452-506` (일반), `ShippingCompareView.vue:554-608` (편의점)
- 현상: 무게/크기 초과로 접수 불가한 택배사 행에서, `totalFare`만 "접수 불가"로 표시되고 `limit` 셀만 `compare-cell-caution` 배경. 행 전체의 시각적 무게(글씨 크기, 배지 스타일, 행 높이)는 접수 가능한 행과 동일
- 문제: 6개 택배사 중 접수 불가가 1~2개일 때, 사용자가 빠르게 "사용 가능한 택배사"를 구분하기 어려움
- 해결: 접수 불가 행 전체를 `bg-muted/25` 톤으로 낮추고, 첫 열 배지를 desaturate 처리한 뒤 `접수 불가` 상태 배지를 추가해 빠르게 식별되도록 조정

**21-B3. 편의점 택배 2행만으로 풀 테이블 구조 사용 — 과도한 형식 (Low)**
- 위치: `ShippingCompareView.vue:514-614`
- 현상: CU택배, GS25택배 2개 항목에 thead + tbody + 5열 테이블. 행보다 헤더가 차지하는 비중이 커서 정보 효율이 낮음
- 비교: 일반 택배 6사와 동일한 테이블 형식으로 일관성은 있지만, 2행에 대한 풀 테이블은 과도
- 제안: 일관성을 우선하면 현행 유지 가능. 또는 카드 형태로 전환하여 공간 효율 개선

**21-B4. 테이블 내 폰트 크기 3단계 혼재 (Low)**
- 위치: `table.text-body`(14px) + `thead.text-caption`(13px) + `compare-cell-value`(12px)
- 현상: 19-A3, 20-D1과 동일. 3단계 혼재

#### 21-C. 모바일/반응형

**21-C1. CompareHint 터치 기기에서 접수 제한 조건 접근 불가 (High) — ✅ 해결 (2026-03-08)**
- 위치: `CompareHint.vue` (일반 6사 × limit 열 + 편의점 2사 × limit 열 + 우편번호 정리표 = 약 30개 이상 사용)
- 현상: 접수 제한 열의 `restrictionText`(tooltip)와 `unavailableReason`(condition)이 hover 전용. 모바일에서 "접수 불가"인 택배사가 왜 불가인지(무게 초과? 크기 초과?) 확인 불가
- 문제: 이 페이지는 CompareHint 사용량이 전체 뷰 중 최다. 우편번호 정리표의 `cluster.note` tooltip도 포함하면 30개 이상
- 해결: 공통 `CompareHint.vue` 개선으로 탭/클릭 토글 지원. 접수 불가 사유는 셀 상태색으로도 먼저 구분 가능하게 유지

**21-C2. FreshBadge 모바일 타이틀바 줄바꿈 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:282-285`
- 현상: 19-B2, 20-C3과 동일. "2026.03 공개 운임 기준 추정" 텍스트가 360px 이하에서 타이틀바 높이 증가
- 해결: 타이틀바를 모바일 세로 배치 허용 구조로 바꾸고 FreshBadge 메시지를 `2026.03 추정 반영`으로 축약

**21-C3. 우편번호 정리표 모바일 카드 뷰가 수십 개 펼침 — 과도한 스크롤 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:635-682`
- 현상: 모바일에서 `md:hidden` 카드 뷰로 전환되는데, 모든 권역의 모든 클러스터가 한 번에 펼쳐짐. `REMOTE_AREA_POSTAL_CODE_SUMMARY`의 그룹 수 × 클러스터 수만큼 카드가 생성되어 스크롤이 매우 길어짐
- 해결: 모바일 카드 뷰를 권역별 `<details>` 구조로 바꿔 기본 접힘 처리

#### 21-D. 정보 설계/콘텐츠

**21-D1. 팩트카드 4개가 완전 정적 — 동적 가치 없음 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:311-328`
- 현상: "비교 대상: 8개 택배사", "입력값: 무게 + 크기", "출력값: 기본운임 + 추가요금", "주의: 지역·계약단가 제외" 4개 카드가 사용자 입력에 관계없이 항상 동일한 고정 텍스트. "현재 조건 기준" 박스(line 294-308)가 이미 동적 요약을 제공하므로, 팩트카드의 정보 가치가 거의 없음
- 문제: 모바일에서 `grid-cols-2`로 표시되면서 화면의 상당 부분을 차지. 입력 필드(아래)까지 도달하려면 추가 스크롤 필요
- 해결: 정적 팩트카드를 제거하고 `접수 가능 수`, `비교 대상 수`, `현재 최저 예상 운임`의 동적 요약 칩으로 대체

**21-D2. 우편번호 정리표가 기본 펼침 — 핵심 기능과 비중 불균형 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:616-736`
- 현상: 18-A4와 동일. 택배비 비교의 핵심 기능(운임 비교)과 관련성이 낮은 참고 데이터가 같은 수준으로 기본 펼침 노출
- 해결: 전체 섹션을 기본 접힘 패널로 전환하고 요약 설명을 더 낮은 위계로 조정

**21-D3. 면책 문구가 패널 밖에 독립 배치 — 귀속 모호 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:739-742`
- 현상: 면책 문구가 어떤 `retro-panel`에도 속하지 않고 독립 블록으로 배치. 우편번호 정리표 아래에 위치하지만, 내용은 운임 추정에 대한 면책("동일권 기준 공개 운임 우선 사용")
- 비교: OpenMarketCompareView/PaymentCompareView는 면책 문구가 `retro-panel` 내부에 위치
- 해결: 운임 추정 면책 문구를 상단 `택배비 비교` 패널 내부의 `운임 추정 기준` 블록으로 이동해 섹션 귀속을 명확히 함

**21-D4. "현재 조건 기준" 박스와 팩트카드가 같은 레벨에서 역할 중복 (Low) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:288` (grid: 설명+요약 | 팩트카드)
- 현상: 왼쪽 영역에 설명 + "현재 조건 기준" 동적 요약, 오른쪽에 정적 팩트카드 4개가 `lg:grid-cols` 레이아웃으로 배치. 동적 요약과 정적 메타가 같은 시각 레벨에 있어 정보 계층 모호
- 해결: 팩트카드를 제거하고 상단 요약을 단일 흐름으로 정리

#### 21-E. 스타일 일관성

**21-E1. heading 태그 대신 span.retro-title 사용 — 시맨틱 부재 (Medium) — ✅ 해결 (2026-03-08)**
- 위치: `ShippingCompareView.vue:418` ("일반 택배 6사 비교"), `:520` ("편의점 택배 2종 비교"), `:620` ("제주·도서산간 우편번호 정리표")
- 현상: 3개 섹션 제목이 모두 `<span class="retro-title">`. `h1` → `span` → `span` → `span`으로 heading 계층이 끊김. 18-B3에서 이미 지적된 패턴
- 해결: 세 섹션 제목을 모두 `<h2 class="retro-title">`로 변경

**21-E2. 커스텀 border-radius 값 난립 — 시스템 미준수 (Low) — ✅ 해결 (2026-03-08)**
- 위치: 여러 요소
- 현상: "현재 조건 기준" 박스 `rounded-[1.5rem]`(line 294), 팩트카드 `rounded-[1.35rem]`(line 312), 면책 문구 `rounded-[1.4rem]`(line 739), 모바일 우편번호 카드 `rounded-2xl`(line 639), 입력 패널 `rounded-2xl`(line 332). `retro-panel`은 `rounded-2xl`(1rem)인데 각 요소마다 미세하게 다른 arbitrary 값 사용
- 해결: `ShippingCompareView` 상단 조건 박스의 `rounded-[1.5rem]`를 `rounded-2xl`로 정리해 남아 있던 arbitrary radius를 제거

**21-E3. 최저 행 하이라이트 `bg-profit/5` 가시성 부족 (Low) — ✅ 해결 (2026-03-08, 2026-03-09 다크모드 강화)**
- 위치: `ShippingCompareView.vue:456,558`
- 현상: 19-D4, 20-A3과 동일. 5% 불투명도로 라이트/다크 모두 거의 투명
- 해결: 일반/편의점 택배 표의 최저 행 하이라이트를 `bg-profit/8 dark:bg-profit/12`로 높여 라이트·다크 모두에서 구분되게 조정

**21-E4. FreshBadge와 요약 뱃지 모서리 불일치 (Low) — ✅ 해결 (2026-03-08)**
- 위치: 19-D2, 20-E1과 동일 패턴
- 현상: FreshBadge `rounded` vs 요약 뱃지 `rounded-full`
- 해결: `FreshBadge.vue`를 `rounded-full`로 통일

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 21-B1 | 모바일 스크롤 시 택배사 열 고정 없음 + 힌트 없음 (테이블 2개) | 테이블 |
| High | 21-C1 | CompareHint 터치 미지원 (30개 이상 사용) | 반응형 |
| Medium | 21-A1 | 크기 버튼 활성 상태 3변 합 입력 시 사라짐 | 입력 |
| Medium | 21-A2 | 입력 변경 후 결과 테이블 시각 피드백 없음 | 입력 |
| Medium | 21-B2 | "접수 불가" 행 시각 구분 약함 | 테이블 |
| Medium | 21-C2 | FreshBadge 모바일 줄바꿈 | 반응형 |
| Medium | 21-C3 | 우편번호 모바일 카드 뷰 과도한 스크롤 | 반응형 |
| Medium | 21-D1 | 팩트카드 4개 완전 정적 — 동적 가치 없음 | 정보 설계 |
| Medium | 21-D2 | 우편번호표 기본 펼침 — 핵심 기능과 비중 불균형 | 정보 설계 |
| Medium | 21-E1 | span.retro-title → heading 시맨틱 부재 | 스타일 |
| Low | 21-A3 | 무게/3변합 입력 id/label 미연결 | 입력 |
| Low | 21-B3 | 편의점 2행 풀 테이블 — 과도한 형식 | 테이블 |
| Low | 21-B4 | 테이블 폰트 크기 3단계 혼재 | 테이블 |
| Low | 21-D3 | 면책 문구 패널 밖 독립 배치 | 정보 설계 |
| Low | 21-D4 | "현재 조건 기준" 박스와 팩트카드 역할 중복 | 정보 설계 |
| Low | 21-E2 | 커스텀 border-radius 값 난립 | 스타일 |
| Low | 21-E3 | 최저 행 하이라이트 가시성 부족 | 스타일 |
| Low | 21-E4 | FreshBadge-요약뱃지 모서리 불일치 | 스타일 |

---

### [ISSUE-22] 오픈마켓 비교 표 데이터/힌트 정확성 점검 — 신규 (2026-03-09)

`openMarketCompare.ts`의 표 데이터와 `CompareHint` 힌트(tooltip/condition)를 `marketFees.ts` 계산용 데이터와 교차 검증. 5건의 데이터 오류/불일치 확인.

#### 검증 방법
- `openMarketCompare.ts` (비교표 문자열) ↔ `marketFees.ts` (계산용 수치) 교차 대조
- tooltip/condition 내 수치의 VAT 포함 여부 확인
- `microBusinessRate` 비교 로직의 공정성 검증
- 데이터 기준일 일관성 확인

#### 22-A. 데이터 정확성 — 수치 불일치

**22-A1. SmartStore `microBusinessRate: 1.95` — 주문관리 수수료만 포함, 비교 불공정 (High) — ✅ 해결 (2026-03-09)**
- 위치: `openMarketCompare.ts:33`, `OpenMarketCompareView.vue:38-47`
- 현상: SmartStore의 `microBusinessRate`(1.95%)는 주문관리 수수료(`orderFee.micro: 0.01947`)만 반영. 실제 영세 셀러 최소 총수수료는 주문관리 1.95% + 판매수수료 0.91%(마케팅링크) = **2.86%**
- 비교 대상: 쿠팡(7.8%), 11번가(10%), G마켓(9%)은 카테고리별 **총수수료**가 `microBusinessRate`에 반영
- 영향: `lowestFeeMarket` 계산, "최저 수수료 네쇼 1.95%~" 뱃지, 최저 행 하이라이트가 모두 부분 수수료 기준으로 동작
- 실제 차이: SmartStore 2.86% vs 쿠팡 7.8%로 여전히 최저이지만, 표시 수치(1.95%)가 실제(2.86%)보다 1% 가까이 낮아 과대 표현
- 제안: `microBusinessRate`를 최소 합산값(2.86%)으로 수정하거나, 뱃지에 "주문관리 기준" 단서 추가

**22-A2. SmartStore 판매수수료 tooltip — VAT 포함/별도 수치 혼재 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `openMarketCompare.ts:40`
- 현상: tooltip `"주문관리 1.95~3.63% + 판매 0.91~2.73%"`
  - 주문관리 수수료: VAT **포함** 수치 (`marketFees.ts:32` 주석 "VAT 포함")
  - 판매 수수료: VAT **별도** 수치 (`marketFees.ts:41` 주석 "VAT 별도 → 실제 부담은 ×1.1")
  - 실제 판매수수료 부담: 0.91%×1.1 = **1.0%**, 2.73%×1.1 = **3.0%**
- 문제: 두 수치를 단순 합산하면 실제 부담(VAT 통일 기준)과 차이 발생. 사용자가 합산해서 판단할 때 오해 유발
- 제안: tooltip에 "(판매수수료 VAT 별도)" 명시하거나, VAT 포함 기준으로 통일 표기

**22-A3. SmartStore salesFeeRange core "영세 1.95%~" — 총수수료가 아닌 주문관리만 표시 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `openMarketCompare.ts:39`
- 현상: core 표시값 `"영세 1.95%~"`가 주문관리 수수료만 의미. 다른 마켓(쿠팡 7.8%~, 11번가 10%~, G마켓 9%~)은 총수수료 표시
- 문제: 같은 열(판매 수수료)에서 표기 기준이 SmartStore만 다름. tooltip을 보지 않으면 수수료가 1.95%라고 오해
- 제안: core를 `"영세 2.86%~"` (최소 합산) 또는 `"영세 1.95%+α"` 형태로 수정

#### 22-B. 힌트(CompareHint) 표시 문제

**22-B1. SmartStore condition "스타트 제로수수료" — 긍정 혜택에 경고(amber) 스타일 적용 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `openMarketCompare.ts:41`, `CompareHint.vue:119`
- 현상: `condition: "스타트 제로수수료(신규 12개월) 별도 적용"`은 셀러에게 유리한 혜택 안내
- 문제: CompareHint는 모든 condition을 `text-amber-700`(경고 색상)으로 표시. 쿠팡 "건당 700~4,300원 추가 발생"(비용 경고)과 같은 스타일이라 혜택이 경고처럼 보임
- 제안: condition에 `type: "positive" | "caution"` 구분 추가하거나, 이 항목을 tooltip으로 이동

#### 22-C. 데이터 기준일/메타 정보

**22-C1. 데이터 기준일 5개월 경과 — 갱신 필요 여부 확인 (Medium)**
- 위치: `openMarketCompare.ts:25` (`MARKET_COMPARE_UPDATED = "2025.10"`), `marketFees.ts:134` (`FEE_DATA_UPDATED = "2025.10"`)
- 현상: 두 파일 모두 2025년 10월 기준. 현재 2026-03-09로 5개월 경과
- 위험: 마켓별 수수료 정책은 분기~반기 주기로 변동 가능 (특히 SmartStore 2025.10.01 인하 이후 추가 조정 여부 미확인)
- 제안: 각 마켓 공식 판매자센터에서 현행 수수료율 재확인 후 데이터 갱신

#### 교차 검증 통과 항목 (오류 없음)
| 항목 | 비교표 데이터 | marketFees.ts 수치 | 일치 |
|------|-------------|-------------------|------|
| 쿠팡 최저 수수료 | 7.8% | electronics: 0.078 | ✅ |
| 쿠팡 최대 수수료 | 10.6% | food: 0.106 | ✅ |
| 쿠팡 배송비 수수료 | 3.3% | shippingFeeRate: 0.033 | ✅ |
| 쿠팡 로켓그로스 물류비 범위 | 700~4,300원 | xs:700, xxl:4300 | ✅ |
| 11번가 최저 수수료 | 10% | electronics: 0.10 | ✅ |
| 11번가 tooltip "전자기기 10%, 기타 13%" | — | electronics:0.10, 나머지:0.13 | ✅ |
| 11번가 배송비 수수료 | 3.3% | shippingFeeRate: 0.033 | ✅ |
| G마켓 최저 수수료 | 9% | electronics: 0.09 | ✅ |
| G마켓 tooltip "9~13% 범위" | — | electronics:0.09, 나머지:0.13 | ✅ |
| G마켓 배송비 수수료 | 3.3% | shippingFeeRate: 0.033 | ✅ |
| SmartStore 주문관리 범위 | 1.95~3.63% | micro:0.01947, normal:0.0363 | ✅ |
| SmartStore 판매수수료 범위 | 0.91~2.73% | marketingLink:0.0091, naverShopping:0.0273 | ✅ |
| SmartStore 배송비 과금 방식 | 주문관리만 | shippingFeeApplied: "orderFee" | ✅ |
| 마켓 색상 일관성 | 4개 마켓 전체 | MARKET_META 동일 | ✅ |

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 22-A1 | SmartStore microBusinessRate 주문관리만 반영 — 비교 불공정 | 데이터 |
| Medium | 22-A2 | SmartStore tooltip VAT 포함/별도 수치 혼재 | 데이터 |
| Medium | 22-A3 | SmartStore core 표시값이 총수수료가 아닌 주문관리만 | 데이터 |
| Medium | 22-C1 | 데이터 기준일 5개월 경과 — 갱신 필요 확인 | 기준일 |
| Low | 22-B1 | 긍정 혜택(제로수수료)에 경고 스타일 적용 | 힌트 |

---

### [ISSUE-23] 결제수수료 비교 표 데이터/힌트 정확성 점검 — 신규 (2026-03-09)

`paymentGateways.ts`의 표 데이터와 `CompareHint` 힌트(tooltip/condition)를 `marketFees.ts` 및 ISSUE-16 검증 출처와 교차 검증. 4건의 데이터 오류/불일치 확인.

#### 검증 방법
- `paymentGateways.ts` (비교표 문자열) ↔ `marketFees.ts` (계산용 수치) ↔ ISSUE-16 검증 출처 교차 대조
- 서비스 간 동일 수수료의 표기 일관성 확인
- tooltip/condition 수치 정확성 및 표현 명확성 검증
- ISSUE-20 해결 항목 반영 여부 확인

#### 23-A. 데이터 정확성 — 수치 불일치

**23-A1. 네이버페이 주문형 1.98% vs 스마트스토어 주문관리 1.95% — 동일 수수료 교차 불일치 (High) — ✅ 해결 (2026-03-09)**
- 위치: `paymentGateways.ts:62` (`microBusinessRate: 1.98`) vs `marketFees.ts:33` (`orderFee.micro: 0.01947`) vs `openMarketCompare.ts:39` (`"영세 1.95%~"`)
- 현상: 네이버페이 주문형의 영세 수수료가 세 곳에서 각각 다르게 표기됨
  - `paymentGateways.ts`: **1.98%** (비교표 core "영세 1.98%~")
  - `marketFees.ts`: **0.01947 = 1.947%** (계산 로직용)
  - `openMarketCompare.ts`: **1.95%** (오픈마켓 비교표)
- 문제: 네이버페이 주문형 수수료 = 스마트스토어 주문관리 수수료(같은 결제 인프라). 동일 수수료가 1.95%, 1.947%, 1.98%로 3가지 다른 값으로 표시됨
- 영향: 결제비교 페이지의 "최저 수수료" 순위 판단, 사용자가 두 비교 페이지를 오갈 때 혼란
- 검증 기준: `marketFees.ts`의 0.01947(1.947%)이 계산 로직의 원본값. 반올림하면 1.95%
- 제안: 세 파일 모두 동일 기준으로 통일 (1.95% 또는 정확히 1.947%)

**23-A2. 네이버페이 결제형 "영세 2%대 초중반~" — 비교표에 부적합한 모호 표기 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `paymentGateways.ts:96` (`core: "영세 2%대 초중반~"`), `paymentGateways.ts:88` (`microBusinessRate: 2.2`)
- 현상: 다른 4개 서비스는 모두 구체 수치 표기 (토스 3.4%, 네이버주문형 1.98%, 카카오 0.89%, PAYCO 1.5%). 네이버페이 결제형만 "2%대 초중반"이라는 범위형 표현
- 문제:
  - `microBusinessRate: 2.2`로 비교 로직에서는 정확한 숫자를 사용하면서, 사용자에게는 모호한 표현을 보여줌
  - 비교표 특성상 구체 수치가 있어야 횡적 비교 가능
  - tooltip "구체 수수료는 업종/계약별로 개별 안내됩니다."도 다른 서비스의 tooltip(구체 범위 안내)과 정보량 차이가 큼
- 비교: 네이버주문형 tooltip은 "일반 구간은 최대 3.63% 수준" → 범위 제시. 결제형은 범위조차 없음
- 제안: core를 `"영세 2.2%~"`로 명시하고, tooltip에 "업종/계약별 상이, 일반 구간 범위 별도 확인" 추가

**23-A3. 토스페이먼츠 "약 22만원"/"약 11만원" — 공식 확정가에 불필요한 "약" (Low) — ✅ 해결 (2026-03-09)**
- 위치: `paymentGateways.ts:39` (`"약 22만원(1회)"`), `paymentGateways.ts:42` (`"약 11만원/년"`)
- ISSUE-16 검증: 토스페이먼츠 공식 페이지에서 가입비 **220,000원**, 연관리비 **110,000원**으로 확인 (2026-03-07)
- 현상: 공식가가 정확히 22만원/11만원(VAT 포함)인데 "약"을 붙여 불확실성 암시
- 제안: `"22만원(1회)"`, `"11만원/년"`으로 "약" 제거. 단, VAT 포함 여부가 불확실하면 현행 유지

#### 23-B. 데이터 일관성 — ISSUE-20 해결 미반영

**23-B1. 네이버페이 주문형/결제형 배지 색상 미분리 — ISSUE-20-A2 수정 누락 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `paymentGateways.ts:61` (`naverOrder.color: "#03C75A"`) vs `paymentGateways.ts:87` (`naverPayment.color: "#03C75A"`)
- 현상: ISSUE-20-A2에서 "결제형 배지 색상을 청록 `#0099B8`으로 분리 → ✅ 해결"로 기록됨. 그러나 현재 코드에서 `naverPayment.color`는 여전히 `#03C75A`로 `naverOrder`와 동일
- shortName 변경(`N주문`/`N결제`)은 반영됨 ✅, 색상 변경은 미반영 ❌
- 영향: 두 행의 배지가 동일한 초록색으로 표시되어 시각적 구분 불가

#### 교차 검증 통과 항목 (오류 없음)
| 항목 | 비교표 데이터 | 검증 기준 | 일치 |
|------|-------------|----------|------|
| 토스페이먼츠 카드수수료 | 영세 3.4%~ | ISSUE-16 공식 확인: 3.4% | ✅ |
| 토스페이먼츠 가입비 | 약 22만원 | 공식: 220,000원 | ✅ (금액 일치, "약" 문제 별도) |
| 토스페이먼츠 연관리비 | 약 11만원/년 | 공식: 110,000원 | ✅ (금액 일치, "약" 문제 별도) |
| 카카오페이 영세 수수료 | 0.89%~ | microBusinessRate: 0.89 | ✅ |
| 카카오페이 일반 최대 | 1.72% (tooltip) | — | 확인 필요 |
| PAYCO 영세 수수료 | 1.5%~ | microBusinessRate: 1.5 | ✅ |
| PAYCO 일반 최대 | 3.0% (tooltip) | — | 확인 필요 |
| 네이버주문형 일반 최대 | 3.63% (tooltip) | marketFees.ts orderFee.normal: 0.0363 | ✅ |
| 최저수수료 뱃지 카카오 조건 힌트 | PG 연동 비용 안내 | ISSUE-20-B2 반영 | ✅ |
| 데이터 기준일 | 2026.03 | PAYMENT_DATA_UPDATED | ✅ (최신) |

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 23-A1 | 네이버페이 주문형 1.98% vs 스마트스토어 1.95% — 동일 수수료 교차 불일치 | 데이터 |
| Medium | 23-A2 | 네이버페이 결제형 "2%대 초중반" 모호 표기 — 비교표 부적합 | 데이터 |
| Medium | 23-B1 | 네이버 결제형 배지 색상 #03C75A → #0099B8 수정 누락 (ISSUE-20-A2) | 일관성 |
| Low | 23-A3 | 토스페이먼츠 "약 22만/11만" — 확정가에 "약" 불필요 | 데이터 |

---

### [ISSUE-24] 택배비 비교 표 데이터/힌트 정확성 점검 — 신규 (2026-03-09)

`shippingRates.ts`의 택배사별 운임 데이터·접수 제한·CompareHint 힌트를 교차 검증. 가격 모델 오류 1건(High), 데이터 누락 1건(Medium), 힌트 일관성 2건(Medium/Low) 확인.

#### 검증 방법
- 택배사별 pricingMode(profile vs band) 로직과 실제 요금 체계 대조
- `estimateShippingRates()` 시뮬레이션: 극단 조건(소형 크기+고중량, maxWeightKg 근접)에서 추정값 검증
- maxWeightKg/maxSumCm과 rateBands/sizeProfiles 범위의 정합성 확인
- restrictionNote/estimateNote의 역할 일관성 점검
- 도서산간 우편번호 데이터는 ISSUE-16 기반 이미 검증 완료

#### 24-A. 운임 추정 모델 — 계산 오류

**24-A1. 한진택배 profile mode + extraWeightFeePerKg: 0 — 소형 크기+고중량 시 운임 과소 추정 (High) — ✅ 해결 (2026-03-09)**
- 위치: `shippingRates.ts:319` (`extraWeightFeePerKg: 0`), `:323-328` (sizeProfiles)
- 현상: 한진택배의 profile 모델은 3변합(크기)만으로 운임 구간을 결정하고, 무게 초과 추가요금이 0원
- 시뮬레이션 (무게 10kg, 3변합 70cm):
  - 현재 추정: 소형 구간 → baseFare 5,000원, 무게추가 0원, **총 5,000원**
  - 실제 한진 요금: 소형(3kg이하) 5,000원 / 중형(5kg이하) 6,000원 / **대형(15kg이하) 7,000원** 적용
  - 오차: **-2,000원 (29% 과소 추정)**
- 원인: 한진의 실제 요금 체계는 "무게와 크기 중 높은 구간 적용"이지만, profile mode는 크기 기준 구간 → 무게 추가요금 방식이라 "구간 승격" 로직을 표현할 수 없음
- 영향: 소형(80cm 이하) 크기에 3kg 초과 물품에서 한진이 실제보다 저렴하게 표시 → 최저가 순위 왜곡
- 제안: 한진을 band mode로 전환 (로젠·우체국·경동·롯데와 동일 패턴)
  ```
  rateBands: [
    buildBand("small", 3, 80, 5000),
    buildBand("medium", 5, 100, 6000),
    buildBand("large", 15, 120, 7000),
    buildBand("xlarge", 20, 160, 8000),
  ]
  ```

#### 24-B. 데이터 누락

**24-B1. 우체국택배 maxWeightKg: 30 vs 최대 band 20kg — 20~30kg 구간 데이터 누락 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `shippingRates.ts:278` (`maxWeightKg: 30`), `:283-288` (rateBands 최대 20kg)
- 현상: 우체국택배는 30kg까지 접수 가능(`maxWeightKg: 30`)하지만, rateBands의 마지막 구간이 `xlarge: ≤20kg, 6,700원`
- 시뮬레이션 (무게 25kg):
  - 초기 무게 체크(619행): 25 ≤ 30 → 통과
  - band 매칭: 25kg > 20kg(xlarge) → **매칭 실패 → "구간 초과" 접수 불가 표시**
  - 실제: 우체국 창구 일반소포는 30kg까지 접수 가능
- 영향: 20~30kg 물품에서 우체국이 "접수 불가"로 표시되어 사용자가 실제 가능한 옵션을 놓침
- 제안: 20~30kg band 추가 (예: `buildBand("xlarge", 30, 160, 8200)` — 실제 요금 확인 후 반영)

#### 24-C. 힌트(CompareHint) — restrictionNote 역할 혼재

**24-C1. restrictionNote가 접수 제한 vs 요금 기준 설명을 혼재 — 열 제목과 불일치 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: 각 택배사의 `restrictionNote` (CompareHint tooltip으로 "접수 제한" 열에 표시)
- 현상: "접수 제한" 열의 CompareHint tooltip인데, 내용 성격이 택배사마다 다름
  - **접수 조건 중심** (열 제목과 일치):
    - CJ: "20kg 이하 · 3변 합 160cm 이하 · 지역별 할증 별도" ✅
    - 로젠: "타권 +1,000원 · 제주 추가운임 · 25kg 이하" ✅
    - CU: "동일권 기준 · 도서 +4,000원 · 착불 0~2kg +300원" ✅
    - GS25: "동일권 기준 · 도서 +4,000원 · 착불 +300원" ✅
  - **요금 기준/서비스 유형 설명** (열 제목과 불일치):
    - 한진: "공식 요금안내 기준 동일권 최저 운임 사용 · 타권/제주 추가" ← 요금 기준 설명
    - 우체국: "창구 일반소포 D+3 기준 · 방문접수/익일배달은 별도" ← 서비스 유형 설명
    - 경동: "부피 운임과 무게 운임 중 높은 운임 적용 · 지역별 편차 큼" ← 과금 방식 설명
- 문제: 같은 열·같은 tooltip 역할인데 내용 유형이 불일치. 사용자는 "접수 제한"을 탭했을 때 제한 조건을 기대하지만, 한진·우체국·경동은 요금 기준을 보여줌
- 제안: restrictionNote를 접수 조건 중심으로 통일하고, 요금 기준 설명은 estimateNote(택배사명 아래 서브텍스트)에서 담당

**24-C2. CU "착불 0~2kg +300원" vs GS25 "착불 +300원" — 조건 상세도 차이 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `shippingRates.ts:435` (CU) vs `:467` (GS25)
- 현상: CU는 착불 추가요금에 "0~2kg" 무게 조건을 명시하지만, GS25는 무게 조건 없이 일괄 "+300원"으로 표기
- 문제: 두 편의점 택배가 실제로 다른 착불 정책인지, 표기만 다른 것인지 불분명. 비교표에서 동일 성격 데이터의 상세도가 달라 신뢰성 저하
- 제안: 공식 운임표 재확인 후 조건 표기 상세도 통일

#### 교차 검증 통과 항목 (오류 없음)
| 항목 | 데이터 | 검증 결과 |
|------|-------|----------|
| CJ 기본운임 (소/중/대/특대) | 4,000 / 5,000 / 6,200 / 7,800원 | 추정값 명시, 비공개 운임 기반 ✅ |
| CJ 무게추가 250원/kg | extraWeightFeePerKg: 250 | 추정 모델 적합 ✅ |
| 로젠 band 구간 | 5kg 6,000 / 10kg 7,000 / 20kg 9,000 / 25kg 12,000원 | 공식 요금안내 기반 명시 ✅ |
| 우체국 band 구간 (≤20kg) | 3kg 2,700 / 5kg 3,200 / 10kg 4,700 / 20kg 6,700원 | 창구 일반소포 D+3 기준 명시 ✅ |
| 경동 band 구간 (6~30kg, 25구간) | 3,000~9,000원 세밀 구간 | 표준운임 무게 기준 명시 ✅ |
| 롯데 band 구간 | 5kg 5,000 / 15kg 6,000 / 20kg 7,000원 | 택배요금조회 기준 명시 ✅ |
| CU band 구간 (0.35~30kg, 17구간) | 2,600~7,000원 세밀 구간 | CUpost 운임안내 기반 명시 ✅ |
| GS25 band 구간 (0.35~20kg, 18구간) | 3,400~9,000원 세밀 구간 | GS Postbox 운임안내 기반 명시 ✅ |
| band mode 매칭 로직 | weight+size 동시 체크 | 시뮬레이션 정상 ✅ |
| maxWeightKg/maxSumCm 정합 (한진 제외) | 6사 모두 band 범위 ≤ max값 | CJ·로젠·경동·롯데·CU·GS25 정합 ✅ |
| 도서산간 우편번호 | 58826 (신안) | ISSUE-16-4에서 28826→58826 수정 완료 ✅ |
| SHIPPING_DATA_UPDATED | 2026.03 | 최신 ✅ |

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| High | 24-A1 | 한진택배 profile mode 무게 미반영 — 소형+고중량 시 29% 과소 추정 | 모델 오류 |
| Medium | 24-B1 | 우체국 maxWeightKg 30 vs band 최대 20kg — 20~30kg 구간 누락 | 데이터 누락 |
| Medium | 24-C1 | restrictionNote 접수 제한 vs 요금 기준 역할 혼재 | 힌트 |
| Low | 24-C2 | CU vs GS25 착불 조건 표기 상세도 차이 | 힌트 |

---

### [ISSUE-25] 수수료 계산기 (홈) 데이터/힌트 정확성 점검 — 신규 (2026-03-09)

`calculator.ts` 계산 엔진, `CompareFAQ.vue` FAQ 텍스트, `FeeCompareTable.vue` 정렬 로직, `FreshBadge` 기준일 표시를 교차 검증. FAQ 데이터 오류 2건(Medium), 정렬 UX 1건(Low), 수수료율 표시 1건(Low), FAQ 월정액 검증불가 1건(Low) 확인.

#### 검증 방법
- `calculator.ts` 4개 마켓 계산 함수를 `marketFees.ts` 데이터와 대조, 수식 정확성 확인
- `CompareFAQ.vue` 6개 FAQ 답변의 수치를 `marketFees.ts` 원본 데이터와 교차 대조
- `FeeCompareTable.vue` 정렬 키 2개의 수학적 동치 여부 분석
- `FreshBadge` 기본 메시지 → `constantsStore.feeDataUpdated` → `FEE_DATA_UPDATED` 추적

#### 25-A. CompareFAQ 데이터 오류

**25-A1. 쿠팡 카테고리 수수료 최대값 "10.5%" → 실제 10.6% (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `CompareFAQ.vue:18` — `"카테고리 수수료(7.8~10.5%)"`
- 현상: FAQ에서 쿠팡 카테고리 수수료 범위를 "7.8~10.5%"로 표기
- 실제: `marketFees.ts:69` — `food: 0.106` = **10.6%**, `clothing: 0.105` = 10.5%
  - 최솟값 7.8% (electronics/living) ✅
  - 최댓값 **10.6%** (food) ❌ — FAQ는 clothing 기준 10.5%만 반영, food 10.6% 누락
- 영향: 식품 카테고리 판매자가 실제보다 0.1%p 낮은 수수료를 기대. FAQ가 구조화 데이터(FAQPage JSON-LD)로 검색엔진에도 노출되므로 정확성 중요
- 수정: `"7.8~10.5%"` → `"7.8~10.6%"`

**25-A2. SmartStore 판매 수수료 "0.91~2.73%" — VAT 미포함 표기 (Medium) — ✅ 해결 (2026-03-09)**
- 위치: `CompareFAQ.vue:14` — `"판매 수수료(0.91~2.73%)"`
- 현상: FAQ에서 판매 수수료를 VAT 제외 원율(0.0091~0.0273)로 표기
- 실제: 계산기는 `calculator.ts:86-87`에서 `saleFeeRate * 1.1`을 적용하므로 실제 부담률은 **1.001~3.003%**
- 불일치:
  - FAQ 표기: 0.91% ~ 2.73% (VAT 제외)
  - 계산기 적용: 1.001% ~ 3.003% (VAT 포함)
  - 사용자는 FAQ에서 2.73%를 보고 계산기에서 3.003%가 적용되면 혼동
- 관련: ISSUE-22-A2와 동일 근본 원인 (VAT 포함/미포함 혼재)
- 또한: 주문관리 수수료 "1.947%"도 `openMarketCompare.ts`의 "1.95%"와 소수점 반올림 불일치
- 수정: `"주문관리 수수료(1.95~3.63%)와 판매 수수료(1.00~3.00%, VAT 포함)"` 또는 VAT 별도 명시

#### 25-B. 정렬/표시 로직

**25-B1. FeeCompareTable 정렬 버튼 2개 — 항상 동일 결과 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `FeeCompareTable.vue:18-23` — `feeAsc`: `a.totalFee - b.totalFee`, `profitDesc`: `b.netProfit - a.netProfit`
- 현상: 두 정렬 키가 수학적으로 동치
  - `netProfit = price - totalFee` (모든 마켓에서 동일한 `price`)
  - `b.netProfit - a.netProfit = (price - b.totalFee) - (price - a.totalFee) = a.totalFee - b.totalFee`
  - 따라서 "수수료 낮은순"과 "순이익 높은순"은 항상 같은 순서
- 영향: 버튼이 2개지만 결과가 바뀌지 않아 사용자에게 기능이 없는 것처럼 보임
- 제안: (A) 하나로 통합, 또는 (B) profitDesc를 `netProfit - shippingCost`(배송비 차감) 등 다른 기준으로 변경

**25-B2. totalFeeRate 분모가 판매가만 — 배송비 수수료 포함 시 과대 표시 (Low) — ✅ 해결 (2026-03-09)**
- 위치: `calculator.ts:97,131,159,187` — `totalFeeRate = price > 0 ? totalFee / price : 0`
- 현상: 분자(totalFee)에는 배송비 수수료가 포함되지만, 분모는 `price`(판매가)만 사용
- 시뮬레이션 (SmartStore 영세/네이버쇼핑, 30,000원, 배송비 3,000원):
  - totalFee = 584(주문관리) + 900(판매) + 58(배송비수수료) = **1,542원**
  - 현재 totalFeeRate = 1,542 / 30,000 = **5.14%**
  - 매출 대비 실제 비율 = 1,542 / 33,000 = **4.67%**
  - 차이: +0.47%p 과대 표시
- 영향: 유료배송 설정 시 수수료율이 실제보다 높게 보임. 배송비 0원(무료배송)일 때는 정확
- 제안: FeeCompareTable 수수료율 열에 "(판매가 기준)" 서브텍스트 추가, 또는 분모를 `price + shippingFee`로 변경

#### 25-C. 검증 불가 데이터

**25-C1. CompareFAQ 월정액(서버이용료) 데이터 — 코드 내 데이터 파일 부재 (Low)**
- 위치: `CompareFAQ.vue:30` — FAQ 5번 답변
- 현상: "쿠팡 월 100만 초과 시 55,000원, 11번가 월 확정 500만 초과 시 77,000원, G마켓/옥션 월 500만 초과 시 55,000원"
- 문제: 이 수치는 `marketFees.ts`나 다른 데이터 파일에 없고 FAQ 텍스트에만 존재
  - 계산기에서 월정액을 사용하지 않으므로 데이터 파일이 없는 것은 설계상 맞음
  - 그러나 FAQ 텍스트의 금액이 정확한지 코드 레벨에서 검증 불가
- 영향: FAQ가 구조화 데이터(FAQPage JSON-LD)로 검색엔진에 노출되므로, 부정확하면 사이트 신뢰도 저하
- 제안: 월정액 데이터를 별도 상수로 추출하거나, FAQ 텍스트에 "변경될 수 있으므로 각 마켓 확인" 단서 추가

#### 교차 검증 통과 항목 (오류 없음)
| 항목 | 코드/데이터 | 검증 결과 |
|------|-----------|----------|
| SmartStore 계산 공식 | orderFee×price + saleFee×1.1×price + orderFee×shipping | 정확 ✅ |
| 쿠팡 계산 공식 | categoryFee×price + 3.3%×shipping + fulfillment | 정확 ✅ |
| 11번가 계산 공식 | categoryFee×price + 3.3%×shipping | 정확 ✅ |
| G마켓 계산 공식 | categoryFee×price + 3.3%×shipping | 정확 ✅ |
| Math.floor 원 단위 절사 | 전 마켓 동일 적용 | 정확 ✅ |
| Zod 입력 검증 (가격/배송비) | PRICE_MIN=100, PRICE_MAX=100,000,000 | validators.ts 연동 ✅ |
| 카테고리 5종 일치 | categories.ts ↔ marketFees.ts | 5종 동일 ✅ |
| MonthlySim 선형 계산 | totalFee×qty, annualDiff=자기연간-최저연간 | 정확 ✅ |
| MarketCardGrid bestGap | bestNetProfit - runnerUpNetProfit | 정확 ✅ |
| SummaryBanner delta | runnerUp.totalFee - best.totalFee | 정확 ✅ |
| 로켓그로스 물류비 6단계 | 700~4,300원, 조건별 표시/숨김 | 정확 ✅ |
| CompareInput 배송비 프리셋 | 무료/3,000/5,000 | validators.ts 범위 내 ✅ |
| FAQ 배송비 수수료 설명 (FAQ 3) | "스마트스토어는 주문관리만, 나머지 3.3%" | calculator.ts 일치 ✅ |
| FAQ 매출등급 5단계 (FAQ 4) | 영세~일반, 2025.10 인하 반영 | marketFees.ts 일치 ✅ |
| FAQ 정확성 면책 (FAQ 6) | 세부 카테고리 차이·프로모션·광고비 미포함 안내 | 적절 ✅ |

#### 요약 (우선순위별)

| 우선순위 | ID | 이슈 | 범주 |
|---------|-----|------|------|
| Medium | 25-A1 | CompareFAQ 쿠팡 수수료 "7.8~10.5%" → 실제 10.6% 누락 | 데이터 |
| Medium | 25-A2 | CompareFAQ SmartStore 판매수수료 VAT 미포함 표기 — 계산기와 불일치 | 데이터 |
| Low | 25-B1 | FeeCompareTable 정렬 버튼 2개 수학적 동치 — 결과 항상 동일 | UX |
| Low | 25-B2 | totalFeeRate 분모 판매가만 — 유료배송 시 수수료율 과대 표시 | 표시 |
| Low | 25-C1 | CompareFAQ 월정액 데이터 코드 내 미존재 — 검증 불가 | 데이터 |

---

## 총평
- 기술 품질 이슈(검증/타입/에러처리/테스트/CI)는 해결 상태 유지.
- ISSUE-12~17 전부 코드 수정 완료. 네비게이션 통합, 헤더 중복 제거, 테이블 전치, 데이터 정확성 수정 반영.
- ISSUE-18 디자인 품질 정밀 점검 (22건 전체), ISSUE-19 오픈마켓 비교 집중 (14건), ISSUE-20 결제 수수료 비교 집중 (15건), ISSUE-21 택배비 비교 집중 (18건).
- **ISSUE-22~25 데이터/힌트 교차 검증 전체 코드 수정 완료 (2026-03-09):**
  - ISSUE-22: SmartStore microBusinessRate 1.95→2.95(합산), tooltip VAT 통일, core 수정, 제로수수료 condition→tooltip 이동 (5건 해결)
  - ISSUE-23: 네이버페이 주문형 1.98→1.95 통일, 결제형 "2%대 초중반"→"2.2%~", 배지 색상 #0099B8, 토스 "약" 제거 (4건 해결)
  - ISSUE-24: 한진택배 profile→band 모드 전환, 우체국 20~30kg band 추가, restrictionNote 접수조건 통일, GS25 착불 표기 통일 (4건 해결)
  - ISSUE-25: CompareFAQ 쿠팡 10.5→10.6%, SmartStore VAT 포함 표기, 정렬 버튼 통합, 수수료율 title 추가 (4건 해결, 25-C1 제외)
- ISSUE-18 추가 해결: 18-E2(프로그레스바→테이블 전환으로 자동 해결), 18-F1(제목 통합), 18-G1(다크모드 하이라이트 강화, 전 뷰 적용)
- ISSUE-19/20 추가 해결: 19-D4, 20-A3 (bg-profit/5→dark:bg-profit/12 전 뷰 일괄 적용)
- **미해결**: 22-C1(데이터 기준일 외부 확인 필요), 25-C1(FAQ 월정액 코드 외 검증불가) + 디자인 Low 이슈 잔여
- 4개 비교 뷰 전체 디자인 점검 완료. 총 82건의 어색한 사항 확인 (High 11건, Medium 34건, Low 37건).
- 뷰 간 반복 이슈: 폰트 크기 3단계 혼재(전 뷰), 버튼 border-radius 혼재.
- **공통 근본 원인 해결**: SmartStore VAT 포함/미포함 혼재 → 전 파일 VAT 포함 기준으로 통일 완료.
- 유일한 운영 미완료는 ISSUE-11의 GA4 실측 리포트 + 사용자 테스트. 배포 후 7일 경과 시점에 실행.
- 28826 우편번호는 코드에 경고 노트 추가 완료. 우정사업본부 기준표로 2차 확인 시 확정 가능.
- 수수료 데이터 기준일 2025.10 — 5개월 경과. 마켓별 공식 판매자센터 재확인 필요.
