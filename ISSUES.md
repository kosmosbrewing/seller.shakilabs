# 03.seller 품질 점검 결과 (ISSUES)

> **점검 기준**: `docs/MVP_QUALITY_MANUAL.md` (22개 항목)
> **점검 대상**: 오픈마켓 수수료 비교 계산기 (Frontend-only SPA)
> **최초 점검일**: 2026-03-05
> **최종 갱신일**: 2026-03-07 (8차 점검, 데이터 정확성 점검 반영)

---

## 프로젝트 특성
- 타입: 프론트엔드 전용 정적 사이트 (백엔드/DB 없음)
- 배포: Vercel (정적 배포)
- 백엔드 관련 항목(B1~B9): N/A

---

## 상태 요약

### 진행 스냅샷 (2026-03-07)
- 완료: 14건 (완전 해결 13건 + N/A 전환 1건)
- 진행 중: 2건 (ISSUE-11 운영 검증, ISSUE-16 데이터 정확성 재검증)
- 실질 미완료: 6개 작업 (11-7, 11-8, 16-1, 16-2, 16-3, 16-4)

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

부모 뷰의 section-heading-block(eyebrow + title + description)과 자식 컴포넌트의 retro-titlebar가 같은 제목을 이중 표시하는 문제 수정.

**HomeView — 3건 (컴포넌트 내부 retro-titlebar 제거)**
- [x] 15-1 `MonthlySim.vue` — "월간 시뮬레이션" retro-titlebar 제거
- [x] 15-2 `FeeCompareTable.vue` — "상세 비교표" retro-titlebar 제거, 정렬 버튼은 panel-content 상단으로 이동
- [x] 15-3 `CompareFAQ.vue` — "자주 묻는 질문" retro-titlebar 제거

**ShippingCompareView — 3건 (section-heading-block 제거, retro-titlebar에 통합)**
- [x] 15-4 "일반 택배 6사 비교" section-heading 제거 → retro-titlebar에 제목+설명 통합
- [x] 15-5 "편의점 택배 2종 비교" section-heading 제거 → retro-titlebar에 제목+설명 통합
- [x] 15-6 "제주·도서산간 우편번호 기준표" section-heading 제거 → retro-titlebar에 제목+설명 통합

### [ISSUE-16] 데이터 정확성 재검증 — 중간 (신규)

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

**권장 작업**
- [ ] 16-1 토스페이먼츠 기본 카드 수수료를 공식 요금표 기준으로 수정하거나, 계약형 수수료라면 "계약별 상이"로 명시
- [ ] 16-2 G마켓과 옥션을 분리하거나, 최소한 `단순화된 대표값`임을 UI와 데이터 주석에 명시
- [ ] 16-3 `AboutView`의 데이터 기준월 문구를 실제 상수 기준으로 정정
- [ ] 16-4 `28826` 우편번호를 우정사업본부/택배사 기준표 등 2차 출처로 재검증

**검증 출처 (2026-03-07 확인)**
- 토스페이먼츠 PG 수수료: https://www.tosspayments.com/about/fee
- 옥션 서비스 이용료: https://item.esmplus.com/auction-service-fee.html
- G마켓 판매서비스 이용료: https://item.esmplus.com/gmarket-service-fee.html
- 제주도 및 도서산간 지역 기준표: https://help.campaignus.me/ko/articles/%EC%A0%9C%EC%A3%BC%EB%8F%84-%EB%B0%8F-%EB%8F%84%EC%84%9C%EC%82%B0%EA%B0%84-%EC%A7%80%EC%97%AD-%EA%B8%B0%EC%A4%80%ED%91%9C-342d2e5e

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

### 2026-03-07 로컬 검증 결과
- `cd client && npx vue-tsc --noEmit` ✅ 통과
- `cd client && npm run build` ✅ 통과
- 빌드 산출물에 `OpenMarketCompareView` 청크 포함 확인 (9.44 kB gzip 3.55 kB)

### 2026-03-07 데이터 정확성 점검
- 정적 데이터 파일(`marketFees.ts`, `openMarketCompare.ts`, `paymentGateways.ts`, `shippingRates.ts`) 수동 대조
- 공식 공개 페이지 기준 교차 확인:
  - 토스페이먼츠 PG 수수료
  - ESM PLUS G마켓/옥션 수수료 안내
  - 캠페이너스 제주·도서산간 우편번호 기준표

### 2026-03-06 UX KPI 도구 검증
- `node scripts/ux/evaluate-kpi.mjs docs/UX_KPI_INPUT_EXAMPLE.json` ✅ 실행 성공

---

## 총평
- 기술 품질 이슈(검증/타입/에러처리/테스트/CI)는 해결 상태 유지.
- ISSUE-12 네비게이션 구조 개선 완료 (6탭→4탭, 3개 뷰 삭제, 1개 통합 비교 페이지 신설).
- ISSUE-13 sitemap.xml 갱신, ISSUE-14 Vercel 301 리다이렉트, ISSUE-15 섹션 헤더 중복 제거 완료.
- 현재 미완료는 ISSUE-11의 운영 검증과 ISSUE-16의 데이터 정확성 재검증이다.
