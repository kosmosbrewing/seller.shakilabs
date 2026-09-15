// GmarketSans(font-brand) computed fontFamily 리프 요소를 전 라우트에서 렌더 스캔해
// scripts/brand-font-charset.txt를 갱신한다. UI 텍스트가 바뀔 때만 수동 실행:
//   1) npm run build           (dist/ 최신화 — 이 스크립트는 dist를 읽기만 한다)
//   2) npm install -g playwright-core  (한 번만, 프로젝트 devDependency엔 안 넣는다 —
//      결과 검증에만 쓰는 무거운 브라우저 의존성을 앱 번들에 끌고 들어올 이유가 없다)
//   3) node scripts/collect-brand-font-chars.mjs
//
// 소스 .vue를 grep해서 문자셋을 모으지 마라 — 주석의 한글까지 세는 과대 수집이
// 재현된다(docs/BRAND_FONT_SUBSET.md §3). 반드시 빌드 산출물을 브라우저로 렌더해서
// 실제 computed font-family가 GmarketSans로 시작하는 리프 요소만 모은다.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { SSG_ROUTES } from "./seo-routes.mjs";
import { NUMERAL_CHARACTERS, charsetFile, clientRoot } from "./font-subset-config.mjs";

const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require("playwright-core"));
} catch {
  console.error(
    "playwright-core를 찾을 수 없다. `npm install -g playwright-core` 후 " +
      "node scripts/collect-brand-font-chars.mjs 로 실행해라."
  );
  process.exit(1);
}

// vite.config.ts의 base와 동일해야 한다(정적 자산·라우터가 이 접두어로 링크됨).
const BASE_PATH = "/seller";
const distRoot = resolve(clientRoot, "dist");
const PORT = 4890 + Math.floor(Math.random() * 500);

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml",
  ".png": "image/png", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain",
};

function startServer() {
  const server = createServer(async (req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.startsWith(`${BASE_PATH}/`)) urlPath = urlPath.slice(BASE_PATH.length);
    if (urlPath === BASE_PATH) urlPath = "/";
    const withoutSlash = urlPath.replace(/^\//, "");
    let filePath;
    if (urlPath === "/") filePath = resolve(distRoot, "index.html");
    else {
      const direct = resolve(distRoot, withoutSlash);
      const withHtml = resolve(distRoot, `${withoutSlash}.html`);
      filePath = existsSync(direct) && extname(direct) ? direct
        : existsSync(withHtml) ? withHtml
        : resolve(distRoot, "404.html");
    }
    try {
      const content = await readFile(filePath);
      res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((done) => server.listen(PORT, () => done(server)));
}

function scanGmarketLeaves(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.children.length !== 0) continue;
      const text = el.textContent ?? "";
      if (text.trim().length === 0) continue;
      if (getComputedStyle(el).fontFamily.startsWith("GmarketSans")) out.push(text);
    }
    return out;
  });
}

async function scanRoute(page, route) {
  await page.goto(`http://localhost:${PORT}${BASE_PATH}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300); // 하이드레이션·카운트업 초기 렌더 반영 대기
  const texts = await scanGmarketLeaves(page);

  // ShareModal(v-if="props.show")은 공유 버튼을 눌러야만 DOM에 나타난다.
  // retro-title이 그 모달 제목("공유하기")에도 붙으므로, 기본 페이지 로드만
  // 스캔하면 이 문자를 놓친다 — 공유 버튼이 있으면 클릭해 강제로 열고 재스캔한다.
  const shareBtn = page.locator('button:has-text("공유")').first();
  if (await shareBtn.count()) {
    try {
      await shareBtn.click({ timeout: 2000 });
      await page.waitForTimeout(300);
      texts.push(...(await scanGmarketLeaves(page)));
    } catch {
      // 공유 버튼이 없거나 클릭에 실패해도 나머지 라우트 스캔은 계속한다.
    }
  }

  return texts;
}

if (!existsSync(distRoot)) {
  console.error("dist/ 가 없다. 먼저 `npm run build`를 실행해라.");
  process.exit(1);
}

const server = await startServer();
const browser = await chromium.launch();
const page = await browser.newPage();

const renderedTexts = new Set();
for (const route of SSG_ROUTES) {
  for (const text of await scanRoute(page, route)) renderedTexts.add(text);
}

await browser.close();
server.close();

const charset = [...new Set([...[...renderedTexts].join(""), ...NUMERAL_CHARACTERS])].sort().join("");
await writeFile(charsetFile, charset, "utf8");

console.log(`라우트 ${SSG_ROUTES.length}개 스캔, GmarketSans 리프 텍스트 ${renderedTexts.size}종, 문자 ${charset.length}자 -> ${charsetFile}`);
