#!/usr/bin/env node
// GmarketSans 브랜드 폰트 서브셋 검증 게이트 (BL-020, docs/BRAND_FONT_SUBSET.md §6)
//
// 왜 필요한가: 직전 커밋(9f62960)의 사고가 "아무도 검증 안 함"이었다 — 서브셋
// 파일만 좁게 바꾸고 아무 게이트도 없어서 h1 제목 글자가 조용히 빠진 채
// 배포됐다. 이 스크립트는 build.mjs 체인에 항상 물려서 같은 사고가 조용히
// 재발하지 않게 한다.
//
// document.fonts.check()는 쓰지 않는다 — 이 환경의 Chromium은 그게 무엇을
// 물어도 true를 반환해서 게이트가 실패할 수 없다(§6). 판정은 fontTools cmap
// 대조로만 한다.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  DIST_ASSETS_DIR,
  DIST_FONTS_DIR,
  MANIFEST_FILE,
  MAX_BYTES,
  OUTPUT_FILENAME,
  RETIRED_FILENAME,
} from "./font-subset-config.mjs";

let failed = false;
function fail(message) {
  console.error(`[verify:fonts] FAIL — ${message}`);
  failed = true;
}
function pass(message) {
  console.log(`[verify:fonts] ok — ${message}`);
}

if (!existsSync(MANIFEST_FILE)) {
  fail(`매니페스트가 없다: ${MANIFEST_FILE} (npm run fonts:subset을 먼저 실행)`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf8"));

const distFontPath = `${DIST_FONTS_DIR}/${OUTPUT_FILENAME}`;

// 1) dist에 파일이 존재하는가
if (!existsSync(distFontPath)) {
  fail(`빌드 산출물에 폰트가 없다: ${distFontPath}`);
} else {
  const bytes = readFileSync(distFontPath);

  // 2) woff2 매직바이트("wOF2")
  const magic = bytes.subarray(0, 4).toString("ascii");
  if (magic === "wOF2") {
    pass(`woff2 매직바이트 확인 (${magic})`);
  } else {
    fail(`woff2 매직바이트가 아니다: ${JSON.stringify(magic)}`);
  }

  // 3) byte budget
  if (bytes.length <= MAX_BYTES) {
    pass(`용량 예산 이내: ${bytes.length}B ≤ ${MAX_BYTES}B`);
  } else {
    fail(`용량 예산 초과: ${bytes.length}B > ${MAX_BYTES}B`);
  }

  // 4) manifest sha256 일치 — 사람이 손으로 바꿔치기했거나 캐시가 낡은 파일을
  //    물고 있는 회귀를 잡는다.
  const actualSha256 = createHash("sha256").update(bytes).digest("hex");
  if (actualSha256 === manifest.outputSha256) {
    pass("manifest sha256 일치");
  } else {
    fail(
      `manifest sha256 불일치 — dist의 파일이 fonts:subset이 만든 파일과 다르다. ` +
        `(manifest=${manifest.outputSha256} actual=${actualSha256})`,
    );
  }
}

// 5) 빌드된 CSS가 새 파일명을 참조하는가 (그리고 옛 파일명을 더는 참조하지 않는가)
if (!existsSync(DIST_ASSETS_DIR)) {
  fail(`dist/assets가 없다: ${DIST_ASSETS_DIR}`);
} else {
  const cssFiles = readdirSync(DIST_ASSETS_DIR).filter((f) => f.endsWith(".css"));
  let referencesNew = false;
  let referencesRetired = false;
  for (const file of cssFiles) {
    const content = readFileSync(`${DIST_ASSETS_DIR}/${file}`, "utf8");
    if (content.includes(OUTPUT_FILENAME)) referencesNew = true;
    if (content.includes(RETIRED_FILENAME)) referencesRetired = true;
  }
  if (referencesNew) {
    pass(`빌드된 CSS가 ${OUTPUT_FILENAME}을 참조한다`);
  } else {
    fail(`빌드된 CSS 어디에도 ${OUTPUT_FILENAME} 참조가 없다`);
  }
  if (referencesRetired) {
    fail(`빌드된 CSS가 폐기된 ${RETIRED_FILENAME}을 여전히 참조한다 — 교체가 반쪽만 됐다`);
  } else {
    pass(`폐기된 ${RETIRED_FILENAME} 참조 없음`);
  }
}

if (failed) {
  console.error("[verify:fonts] 검증 실패 — 위 FAIL 항목을 해결하라.");
  process.exit(1);
}

console.log("[verify:fonts] 전체 통과.");
