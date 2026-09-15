#!/usr/bin/env node
// GmarketSans 브랜드 폰트 서브셋 재생성 (BL-020, docs/BRAND_FONT_SUBSET.md §3~4)
//
// 왜 브라우저 없이 재생성만 하는가: 문자셋 자체는 렌더 스캔(playwright로 전
// 라우트 + 공유 모달 클릭까지 훑어 GmarketSans로 계산된 요소의 텍스트를 모으는
// 작업)으로 "생성 시점"에만 한 번 만들고 scripts/brand-font-charset.txt에
// 체크인해 둔다. 매 빌드마다 브라우저를 띄우는 건 비용이 크고, 이 스크립트가
// 하는 일은 그 체크인 파일을 fontTools에 그대로 먹이는 것뿐이다.
//
// UI 텍스트가 바뀌면(h1 타이틀 문구, retro-title 섹션 제목, ShareModal 문구 등)
// brand-font-charset.txt가 낡는다 — 그때는 render-scan을 다시 돌려 파일을
// 갱신한 뒤 이 스크립트를 재실행해야 한다. 이 스크립트 혼자서는 "UI가 바뀌어서
// 새 글자가 생겼다"를 알 방법이 없다(그게 렌더 스캔이 필요한 이유다).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  CHARSET_FILE,
  MANIFEST_FILE,
  MAX_BYTES,
  OUTPUT_FILENAME,
  OUTPUT_FONT,
  SOURCE_FONT,
} from "./font-subset-config.mjs";

function fail(message) {
  console.error(`[fonts:subset] ${message}`);
  process.exit(1);
}

if (!existsSync(SOURCE_FONT)) {
  fail(`원본 폰트가 없다: ${SOURCE_FONT}`);
}
if (!existsSync(CHARSET_FILE)) {
  fail(`문자셋 체크인 파일이 없다: ${CHARSET_FILE} (render-scan으로 먼저 만들어야 한다)`);
}

const charset = readFileSync(CHARSET_FILE, "utf8");
if (charset.length === 0) {
  fail("문자셋 파일이 비어있다.");
}

// --layout-features=''는 절대 쓰지 않는다 — 커널링(GPOS)이 날아간다.
// (docs/BRAND_FONT_SUBSET.md §4)
const args = [
  "-m",
  "fontTools.subset",
  SOURCE_FONT,
  `--text-file=${CHARSET_FILE}`,
  "--flavor=woff2",
  `--output-file=${OUTPUT_FONT}`,
  "--no-hinting",
];

const result = spawnSync("python3", args, { stdio: "inherit" });
if (result.status !== 0) {
  fail(`fontTools.subset 실행 실패 (exit ${result.status})`);
}

if (!existsSync(OUTPUT_FONT)) {
  fail(`서브셋 산출물이 생성되지 않았다: ${OUTPUT_FONT}`);
}

const outputBytes = statSync(OUTPUT_FONT).size;
if (outputBytes > MAX_BYTES) {
  fail(`서브셋이 예산을 초과했다: ${outputBytes}B > ${MAX_BYTES}B`);
}

const outputSha256 = createHash("sha256").update(readFileSync(OUTPUT_FONT)).digest("hex");
const charsetSha256 = createHash("sha256").update(charset, "utf8").digest("hex");

const manifest = {
  // 왜 남기나: verify-fonts.mjs가 "빌드 산출물의 폰트가 이 스크립트가 만든
  // 그 파일과 정말 같은가"를 sha256으로 대조한다 — 사람이 손으로 바꿔치기하거나
  // 캐시가 낡은 파일을 물고 있는 회귀를 잡기 위함.
  outputFilename: OUTPUT_FILENAME,
  outputBytes,
  outputSha256,
  maxBytes: MAX_BYTES,
  charsetLength: [...charset].length,
  charsetSha256,
  sourceFont: "GmarketSansBold.woff",
  generatedAt: new Date().toISOString(),
  note:
    "문자셋은 렌더 스캔(전 라우트 + 공유 모달 등 상호작용 요소)으로 얻었다. " +
    "UI 텍스트가 바뀌면 scripts/brand-font-charset.txt를 render-scan으로 다시 만들고 " +
    "이 스크립트를 재실행해야 한다.",
};

writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(
  `[fonts:subset] OK — ${OUTPUT_FILENAME} (${outputBytes}B, 문자 ${manifest.charsetLength}자, 예산 ${MAX_BYTES}B 이내)`,
);
