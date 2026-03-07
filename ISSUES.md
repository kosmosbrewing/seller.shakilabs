# 03.seller 품질 점검 결과 (ISSUES)

> **점검 기준**: `docs/MVP_QUALITY_MANUAL.md` (22개 항목)  
> **점검 대상**: 오픈마켓 수수료 비교 계산기 (Frontend-only SPA)  
> **최초 점검일**: 2026-03-05  
> **최종 갱신일**: 2026-03-06 (6차 점검, 문서 최적화 + 품질 재검토)

---

## 프로젝트 특성
- 타입: 프론트엔드 전용 정적 사이트 (백엔드/DB 없음)
- 배포: Vercel (정적 배포)
- 백엔드 관련 항목(B1~B9): N/A

---

## 상태 요약

### 진행 스냅샷 (2026-03-06)
- 완료: 9건 (완전 해결 8건 + N/A 전환 1건)
- 부분 해결: 1건 (ISSUE-09)
- 진행 중: 1건 (ISSUE-11)
- 실질 미완료: 2개 작업 (11-7, 11-8)

### 프론트엔드 (F1~F7)
| # | 항목 | 상태 | 근거 |
|---|------|------|------|
| F1 | API 래퍼+캐싱 | N/A | API 호출 없음 |
| F2 | Pinia 인증 스토어 | N/A | 인증 기능 없음 |
| F3 | Router 가드 | ✅ 충족 | 타이틀 설정 + 페이지뷰 추적 |
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

---

## 최근 품질 검증

### 2026-03-06 로컬 검증 결과
- `cd client && npm run typecheck` ✅ 통과
- `cd client && npm test` ✅ 통과 (22/22)
- `cd client && npm run build` ✅ 통과

### 2026-03-06 UX KPI 도구 검증
- `node scripts/ux/evaluate-kpi.mjs docs/UX_KPI_INPUT_EXAMPLE.json` ✅ 실행 성공

---

## 총평
- 기술 품질 이슈(검증/타입/에러처리/테스트/CI)는 해결 상태 유지.
- 현재 실질적 미완료는 ISSUE-11의 운영 검증(실측 데이터/사용자 테스트)뿐.
- 배포 전략이 Vercel 정적 배포이므로 Docker는 필수 조건이 아니며, 운영 관점에서는 계측/사용성 실측이 우선순위다.
