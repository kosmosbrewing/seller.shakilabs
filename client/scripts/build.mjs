import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SITEMAP_ROUTES, SSG_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

function resolveBuildDate() {
  const candidate = process.env.BUILD_DATE?.trim();
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }

  return new Date().toISOString().slice(0, 10);
}

function renderSitemap(buildDate) {
  const baseUrl = "https://shakilabs.com/seller";
  const urls = SITEMAP_ROUTES
    .map(
      ({ path, changefreq, priority }) => `  <url>
    <loc>${path === "/" ? baseUrl : `${baseUrl}${path}`}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(projectRoot, "dist", "index.html")
    : resolve(projectRoot, "dist", `${route.slice(1)}.html`);
}

function removeRenderedNoscriptFallbacks() {
  for (const route of SSG_ROUTES) {
    const outputPath = routeOutputPath(route);
    if (!existsSync(outputPath)) continue;

    const html = readFileSync(outputPath, "utf8");
    const nextHtml = html.replace(
      /\n?\s*<noscript>[\s\S]*?<\/noscript>/i,
      "",
    );
    writeFileSync(outputPath, nextHtml, "utf8");
  }
}

// 404 셸만 애드센스 로더를 떼어낸다.
// NotFoundView가 그리는 화면은 제목·안내문·복귀 링크뿐(50자 미만)이라
// 게시자 콘텐츠가 사실상 없는 화면인데, index.html 셸의 정적 로더를 그대로
// 물려받아 광고가 실렸다. Google "Valuable Inventory" 정책이 금지하는 상태이고,
// 이 도메인의 공개 문서(nutri /disclosure)가 "오류·404 화면에는 광고를 두지
// 않는다"고 명문화하고 있어 자사 고지와도 어긋났다.
// 정상 라우트는 AdSlot.vue가 마운트 시 로더를 직접 주입하므로(ensureAdsenseScript)
// 정적 태그를 404 산출물에서만 제거해도 광고 배선이 끊기지 않는다.
function removeAdsenseLoaderFromNotFound() {
  const outputPath = routeOutputPath("/404");
  if (!existsSync(outputPath)) return;

  const html = readFileSync(outputPath, "utf8");
  const nextHtml = html.replace(
    /\n?\s*<script[^>]*\bdata-adsense="true"[^>]*>\s*<\/script>/gi,
    "",
  );
  writeFileSync(outputPath, nextHtml, "utf8");
}

const buildDate = resolveBuildDate();

mkdirSync(dirname(sitemapPath), { recursive: true });
writeFileSync(sitemapPath, renderSitemap(buildDate), "utf8");

const result = spawnSync(viteSsgBin, ["build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    BUILD_DATE: buildDate,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

removeRenderedNoscriptFallbacks();
removeAdsenseLoaderFromNotFound();

// GmarketSans 서브셋 게이트 — 이번 빌드 산출물이 실제로 새 폰트 파일을 참조하고,
// 그 파일이 매니페스트와 일치하는지 매번 확인한다. 직전 커밋(BL-020)의 사고가
// "서브셋만 좁게 바꾸고 아무도 검증하지 않아 h1 글자가 조용히 빠졌다"였다 —
// 이 게이트가 빠지면 같은 사고가 조용히 재발한다.
const fontsVerifyResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "verify-fonts.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

if (fontsVerifyResult.status !== 0) {
  process.exit(fontsVerifyResult.status ?? 1);
}

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

process.exit(validationResult.status ?? 1);
