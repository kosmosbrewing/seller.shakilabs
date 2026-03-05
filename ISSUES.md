# 03.seller 품질 점검 결과 (ISSUES)

> **점검 기준**: `docs/MVP_QUALITY_MANUAL.md` (22개 항목)
> **점검 대상**: 오픈마켓 수수료 비교 계산기 (Frontend-only SPA)
> **최초 점검**: 2026-03-05
> **갱신일**: 2026-03-05 (2차 점검)

---

## 프로젝트 특성

- **타입**: 프론트엔드 전용 정적 사이트 (백엔드/DB 없음)
- **배포**: Vercel (정적 배포)
- **백엔드 관련 항목 (B1~B9)**: 백엔드가 없으므로 해당 없음 (N/A)

---

## 적용 가능 항목 점검 결과

### 프론트엔드 (F1~F7)

| # | 항목 | 상태 | 설명 |
|---|------|------|------|
| F1 | API 래퍼+캐싱 | N/A | API 호출 없음 (정적 계산기) |
| F2 | Pinia 인증 스토어 | N/A | 인증 불필요 |
| F3 | Router 가드 | ✅ 충족 | beforeEach에서 document.title 설정 + afterEach GA4 추적 |
| F4 | GA4 Analytics | ✅ 충족 | lazy load + trackPageView + trackEvent 구현 |
| F5 | Alert 시스템 | ✅ 충족 | useAlert composable + AlertHost 구현 |
| F6 | Vite 최적화 | ✅ 충족 | manualChunks(vendor/icons/ui/libs) + vitest 설정 포함 |
| F7 | 초기화 순서 | ⚠️ 부분 | GA4 초기화 있으나 글로벌 에러 핸들러 미등록 |

### 공유 코드 (S1~S3)

| # | 항목 | 상태 | 설명 |
|---|------|------|------|
| S1 | Drizzle 스키마 | N/A | DB 없음 |
| S2 | 상수 모듈화 | ⚠️ 부분 | data/ 디렉토리에 분리되었으나 shared/constants 패턴 미적용 |
| S3 | Zod 검증 | ❌ 미충족 | Zod 의존성 있으나 실제 사용 없음 |

### 배포 (D1~D3)

| # | 항목 | 상태 | 설명 |
|---|------|------|------|
| D1 | GitHub Actions | ❌ 미충족 | CI/CD 미설정 |
| D2 | Docker 빌드 | ❌ 미충족 | Dockerfile 없음 (Vercel 배포) |
| D3 | 헬스체크 | N/A | 정적 사이트 |

---

## 변경 이력 (2차 점검)

| 이슈 | 이전 상태 | 현재 상태 | 비고 |
|------|-----------|-----------|------|
| ISSUE-04 (Router 타이틀) | ❌ 미충족 | ✅ **해결됨** | beforeEach에서 document.title 설정 구현 확인 |
| ISSUE-05 (테스트 인프라) | ❌ 미충족 | ⚠️ **부분 해결** | vitest 도입 + calculator.test.ts (70개 케이스) 추가 |
| ISSUE-08 (Vite 청크) | ⚠️ 참고 | ✅ **해결됨** | 프로젝트에 적절한 청크 전략 + vitest 설정 통합 |

---

## 열린 이슈 목록

### [ISSUE-01] Zod 입력값 검증 미적용 — 높음

**매뉴얼 기준**: S3 (Zod 검증), CLAUDE.md [2] "모든 사용자 입력은 Zod 스키마로 검증"
**현재 상태**: `package.json`에 `zod@4.3.6` 의존성이 있지만, 실제 코드에서 사용하지 않음
**위치**: `client/src/composables/useMarketFeeCalc.ts`, `client/src/components/compare/CompareInput.vue`

**문제**:
- 가격, 배송비, 월간 판매량 등 사용자 입력에 Zod 검증 없음
- `Number.isFinite()` 수준의 기본 체크만 존재, 범위 검증 부재
- URL 쿼리 파라미터 파싱 시 타입 검증만 있고 범위 검증 없음
- `calculator.ts` 함수들이 입력값 유효성을 가정하고 처리 (guard clause 없음)

**권장 조치**:
```typescript
// src/lib/validators.ts
import { z } from "zod";

export const compareInputSchema = z.object({
  price: z.number().min(100).max(100_000_000),
  shippingFee: z.number().min(0).max(10_000_000),
  monthlyQty: z.number().int().min(1).max(99_999),
  category: z.enum(["clothing", "food", "electronics", "living", "beauty"]),
});
```

---

### [ISSUE-02] TypeScript strict 모드 비활성화 — 중간

**매뉴얼 기준**: 코드 안정성 전반
**현재 상태**: `tsconfig.json`에서 `"strict": false`
**위치**: `client/tsconfig.json`

**문제**:
- `implicit any` 허용으로 런타임 타입 에러 가능성 증가
- `strictNullChecks` 비활성화로 null/undefined 관련 버그 잠재

**권장 조치**:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

### [ISSUE-03] 글로벌 에러 바운더리 미구현 — 중간

**매뉴얼 기준**: B6 (글로벌 에러 핸들러 개념의 프론트엔드 적용)
**현재 상태**: `main.ts`에 bootstrap try-catch만 존재, `app.config.errorHandler` 미등록

**문제**:
- 컴포넌트 렌더링 에러 시 전체 앱 크래시
- GA4에 에러 이벤트 전송 안 됨
- 사용자에게 에러 상태 노출 안 됨

**권장 조치**:
```typescript
// main.ts
app.config.errorHandler = (err, instance, info) => {
  console.error("Global error:", err);
  trackEvent("app_error", {
    message: err instanceof Error ? err.message : String(err),
    info,
  });
};
```

---

### [ISSUE-05] 유틸리티 테스트 커버리지 부족 — 낮음 (하향 조정)

**매뉴얼 기준**: CLAUDE.md [4] "크리티컬 패스 테스트 우선"
**이전 상태**: 테스트 프레임워크 미설치, 테스트 없음
**현재 상태**: vitest 도입 완료, `calculator.test.ts` (70개 테스트 케이스) 존재

**개선된 점**:
- ✅ vitest@4.0.18 설치 및 vite.config.ts에 테스트 설정 통합
- ✅ `npm test` → `vitest run` 으로 변경
- ✅ `calculator.test.ts` — 4개 마켓 수수료 계산, 경계값, 카테고리별, 월간 시뮬레이션 테스트

**남은 문제**:
- `routeState.ts` — 쿼리 파라미터 파싱/빌딩 테스트 없음
- `lib/utils.ts` — 포맷 함수(formatWon, formatPercent) 테스트 없음

---

### [ISSUE-06] CI/CD 파이프라인 미구성 — 낮음

**매뉴얼 기준**: D1 (GitHub Actions)
**현재 상태**: `.github/workflows/` 디렉토리 없음

**문제**:
- 타입 체크, 빌드 검증, 테스트 실행이 자동화되지 않음
- Vercel 자동 배포만 의존 (PR 단계 검증 없음)

**권장 조치**:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd client && npm ci
      - run: cd client && npm run typecheck
      - run: cd client && npm test
      - run: cd client && npm run build
```

---

### [ISSUE-07] .env.example 값 설명 부재 — 낮음

**매뉴얼 기준**: CLAUDE.md [5] "사전 설정 명시"
**현재 상태**: `client/.env.example`에 키만 나열, 설명 부족

**문제**:
- 새 개발자/환경에서 어떤 값을 넣어야 하는지 알 수 없음
- 필수/선택 구분 없음

**권장 조치**:
```bash
# === 모두 선택사항 (없으면 해당 기능 비활성화) ===
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX    # Google Analytics 4 측정 ID
VITE_GA_DEBUG=false                     # GA4 디버그 모드 (true/false)
VITE_ADSENSE_PUBLISHER_ID=             # Google AdSense 퍼블리셔 ID
VITE_KAKAO_JS_KEY=                     # KakaoTalk 공유 SDK 키
VITE_SITE_URL=https://seller.shakilabs.com  # 사이트 URL (공유/SEO용)
```

---

### [ISSUE-09] 수수료 데이터 하드코딩 — 참고

**매뉴얼 기준**: 해당 없음 (운영 관점)
**현재 상태**: `data/marketFees.ts`에 수수료율 하드코딩 (2025.06 기준)
**위치**: `client/src/data/marketFees.ts`

**문제**:
- 마켓 수수료 변경 시 코드 수정 + 재배포 필요
- 데이터 최신성 보장 메커니즘 없음
- 현재 `lastUpdated: "2025.06"` 표시는 있음

**권장 조치** (향후):
- 수수료 데이터를 별도 JSON 파일 또는 CMS로 분리
- 마지막 업데이트 날짜를 UI에 명시 (현재 일부 구현됨)

---

## 해결된 이슈

### ~~[ISSUE-04] Router에 페이지 타이틀 동적 설정 누락~~ — ✅ 해결됨

`router.beforeEach`에서 `document.title` 설정이 구현되어 있음을 확인.

### ~~[ISSUE-08] Vite manualChunks 청크 전략~~ — ✅ 해결됨

프로젝트에 적합한 청크 전략(vendor/icons/ui/libs) 적용 완료. vitest 설정도 통합됨.

---

## 요약

| 우선순위 | 이슈 수 | 항목 |
|----------|---------|------|
| **높음** | 1 | ISSUE-01 (Zod 검증) |
| **중간** | 2 | ISSUE-02 (TS strict), ISSUE-03 (에러 바운더리) |
| **낮음** | 3 | ISSUE-05 (유틸 테스트), ISSUE-06 (CI/CD), ISSUE-07 (.env 설명) |
| **참고** | 1 | ISSUE-09 (데이터 하드코딩) |
| **해결됨** | 2 | ~~ISSUE-04~~ (타이틀), ~~ISSUE-08~~ (청크) |
| **N/A** | 13 | 백엔드 9개 (B1~B9), DB 스키마 (S1), 인증 (F2), API 래퍼 (F1), 헬스체크 (D3) |

**총평**: 1차 점검 대비 2건 해결, 1건 부분 해결(테스트). 핵심 비즈니스 로직(수수료 계산) 테스트가 추가되어 안정성이 크게 향상됨. 남은 최우선 과제는 **Zod 입력 검증 적용**(보안 원칙)과 **글로벌 에러 핸들러 등록**(앱 안정성).
