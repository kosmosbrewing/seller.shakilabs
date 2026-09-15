// GmarketSans 브랜드 폰트 서브셋 공통 설정 (BL-020, docs/BRAND_FONT_SUBSET.md)
//
// 왜 별도 config 파일인가: subset-fonts.mjs(생성)와 verify-fonts.mjs(검증)가
// 같은 경로·같은 예산을 봐야 "만든 파일과 검증하는 파일이 다르다" 류의 드리프트가
// 안 생긴다. 값은 여기 한 곳에서만 바꾼다.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(__dirname, "..");

// 문자셋 체크인 파일 — docs/BRAND_FONT_SUBSET.md §3 렌더 스캔 규칙으로 만든 결과물.
// UI 텍스트(h1 타이틀, retro-title 섹션 제목, ShareModal 등)가 바뀌면 이 파일이
// 낡는다 — 그때는 다시 렌더 스캔(전 라우트 + 공유 모달 등 상호작용 요소 트리거)해서
// 갱신해야 한다. subset-fonts.mjs는 이 파일을 "읽기만" 하고 브라우저를 띄우지 않는다.
export const CHARSET_FILE = resolve(PROJECT_ROOT, "scripts", "brand-font-charset.txt");

// 서브셋 소스(원본, 저장소에 남겨둔다 — CSS는 참조하지 않음)와 산출물.
export const SOURCE_FONT = resolve(PROJECT_ROOT, "public", "fonts", "GmarketSansBold.woff");
export const OUTPUT_FILENAME = "GmarketSansBold-brand-v1.woff2";
export const OUTPUT_FONT = resolve(PROJECT_ROOT, "public", "fonts", OUTPUT_FILENAME);

// 이 파이프라인이 대체한, 더는 쓰지 않는 이전 산출물(숫자 전용 41자).
// verify-fonts.mjs가 이 이름이 빌드 산출물에 남아있지 않은지도 확인한다
// (교체가 반쪽만 되는 회귀를 잡기 위함 — main.css는 고쳤는데 dist에 구 파일이
// 캐시로 남는 경우 등).
export const RETIRED_FILENAME = "GmarketSansBold-num-v1.woff2";

export const MANIFEST_FILE = resolve(PROJECT_ROOT, "scripts", "font-subset-manifest.json");

// 실측 11KB(finance 181자 기준)에 여유를 둔 예산. docs/BRAND_FONT_SUBSET.md §4.
export const MAX_BYTES = 24 * 1024;

export const DIST_FONTS_DIR = resolve(PROJECT_ROOT, "dist", "fonts");
export const DIST_ASSETS_DIR = resolve(PROJECT_ROOT, "dist", "assets");

// NUMERAL_CHARACTERS — 히어로 수치(카운트업 중간 프레임 포함)가 만들어낼 수 있는
// 모든 문자. docs/BRAND_FONT_SUBSET.md §3 원문 그대로 — 렌더 스캔 결과와 합집합해
// 최종 문자셋을 만든다. 두 스크립트(collect-brand-font-chars.mjs가 문자셋을 생성할
// 때, subset-fonts.mjs가 검증할 때)가 같은 상수를 보게 하려고 여기 한 곳에 둔다.
export const NUMERAL_CHARACTERS = "0123456789,.%+-~/()· 원억만천조년월일개회건세명점배급시간분초";

// scripts/collect-brand-font-chars.mjs(렌더 스캔 러너)와의 이름 호환 — 그 스크립트는
// charsetFile/clientRoot로 import한다. 값은 위 CHARSET_FILE/PROJECT_ROOT와 동일하다.
export const charsetFile = CHARSET_FILE;
export const clientRoot = PROJECT_ROOT;
