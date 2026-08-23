import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_ROUTES, SEO_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const repositoryRoot = resolve(projectRoot, "..");
const distRoot = resolve(projectRoot, "dist");
const canonicalBase = "https://shakilabs.com/seller";
const legacyRedirectSources = [
  "/smartstore",
  "/coupang",
  "/11st",
  "/gmarket",
  "/clothing-fee-compare",
  "/food-fee-compare",
  "/electronics-fee-compare",
  "/beauty-fee-compare",
  "/living-fee-compare",
  "/price/:amount",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(distRoot, "index.html")
    : resolve(distRoot, `${route.slice(1)}.html`);
}

// cleanUrls가 "/seller/"를 "/seller"로 보내므로 홈은 어디서나 슬래시 없이 주소를 잡는다:
// canonical·og:url·사이트맵 loc이 전부 같은 규칙을 써야 대조가 성립한다.
function canonicalUrlFor(route) {
  return route === "/" ? canonicalBase : `${canonicalBase}${route}`;
}

function validateVercelConfig(configPath, expectedOutputDirectory) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rewrites = config.rewrites ?? [];
  const redirects = config.redirects ?? [];
  const routeRewrite = rewrites.find(
    (rewrite) => rewrite.source === "/seller/:path*"
  );
  const routeRewriteIndex = rewrites.indexOf(routeRewrite);
  const aliasRewrites = ["/seller", "/seller/"].map((source) =>
    rewrites.find((rewrite) => rewrite.source === source)
  );

  assert(config.framework === null, `${configPath}: framework must be null`);
  assert(config.cleanUrls === true, `${configPath}: cleanUrls must be true`);
  assert(config.trailingSlash === false,
    `${configPath}: trailingSlash must be false`);
  assert(config.outputDirectory === expectedOutputDirectory,
    `${configPath}: unexpected outputDirectory`);
  assert(rewrites.length === 3,
    `${configPath}: only seller alias and path-preserving rewrites are allowed`);
  assert(!rewrites.some((rewrite) => rewrite.destination === "/index.html"),
    `${configPath}: index.html catch-all rewrite is forbidden`);
  assert(routeRewrite?.destination === "/:path*",
    `${configPath}: seller rewrite must preserve the requested path`);
  assert(aliasRewrites.every((rewrite) => rewrite?.destination === "/"),
    `${configPath}: seller root aliases must rewrite to root HTML`);
  assert(aliasRewrites.every((rewrite) => rewrites.indexOf(rewrite) < routeRewriteIndex),
    `${configPath}: seller aliases must precede the wildcard rewrite`);
  assert(redirects.length === legacyRedirectSources.length * 2,
    configPath + ": legacy redirect inventory is incomplete");
  for (const source of legacyRedirectSources) {
    for (const redirectSource of [source, "/seller" + source]) {
      const redirect = redirects.find((candidate) => candidate.source === redirectSource);
      assert(redirect?.destination === "/seller/market-compare" && redirect.permanent === true,
        configPath + ": invalid legacy redirect for " + redirectSource);
    }
  }
}

function validateSitemap() {
  const sitemapPath = resolve(distRoot, "sitemap.xml");
  assert(existsSync(sitemapPath), `Missing sitemap output: ${sitemapPath}`);

  const sitemap = readFileSync(sitemapPath, "utf8");
  const actualUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => url
  );
  const expectedUrls = SEO_ROUTES.map(canonicalUrlFor);

  assert(actualUrls.length === SEO_ROUTES.length,
    `Sitemap must contain exactly ${SEO_ROUTES.length} public routes`);
  assert(new Set(actualUrls).size === actualUrls.length,
    "Sitemap contains duplicate routes");
  assert(JSON.stringify(actualUrls) === JSON.stringify(expectedUrls),
    "Sitemap routes do not match the expected public routes");

  return new Set(actualUrls);
}

// 라우터에 선언된 경로를 뜯어 { path, redirect } 목록으로 돌려준다.
// 라우터 파일이 진실의 원천이라 소스를 직접 읽는다 — seo-routes.mjs는 사람이 손으로
// 맞추는 사본이고, 사본이 원본과 어긋나도 여태 아무 게이트도 울지 않았다.
// 추출에 실패하면 폴백 없이 즉시 실패한다: 조용히 0건을 검사하는 게이트는
// 게이트가 없는 것보다 나쁘다(통과 로그가 안전하다는 착각을 준다).
function parseRouterRoutes(source) {
  const start = source.indexOf("export const routes");
  assert(start !== -1,
    "router/index.ts: could not find `export const routes` — route extraction failed");

  const body = source.slice(start);
  const marks = [...body.matchAll(/path:\s*"([^"]+)"/g)].map((match) => ({
    path: match[1],
    index: match.index,
  }));
  assert(marks.length > 0,
    "router/index.ts: no `path:` declarations parsed — route extraction failed");

  return marks.map((mark, i) => ({
    path: mark.path,
    // 다음 path: 선언 전까지가 이 라우트의 본문이다
    redirect: /redirect:/.test(body.slice(mark.index, marks[i + 1]?.index ?? body.length)),
  }));
}

// 회귀 게이트: 라우터에 등록된 정적 라우트가 사이트맵에 있는가(그리고 리다이렉트
// 라우트는 없는가). SEO_ROUTES는 손으로 유지하는 사본이라, 라우트를 추가하고 열거를
// 빼먹어도 빌드·프리렌더·라이브가 전부 200을 돌려준다. 사이트맵에서만 조용히 사라져
// 색인 후보 밖으로 나가는데, 사람이 XML을 세는 것 말고는 잡을 길이 없었다.
// (실제로 /terms가 이 상태였다 — 라이브 사이트맵 6 URL, 라우터 정적 라우트 7개.)
//
// 양방향인 이유: 리다이렉트 라우트는 자기 화면이 없어 다른 페이지로 canonical이 모이므로
// 사이트맵에 실으면 안 된다. "등록된 건 다 넣어라"만 검사하면 홈을 리다이렉트로 바꾼 뒤
// 사이트맵에는 URL을 남기는, 더 나쁜 모순 상태를 그대로 통과시킨다.
function validateRouterRoutesAreListed(sitemapUrls) {
  const routerSource = readFileSync(
    resolve(projectRoot, "src", "router", "index.ts"),
    "utf8"
  );
  const routerRoutes = parseRouterRoutes(routerSource);
  const indexRoute = routerRoutes.find((route) => route.path === "/");

  assert(indexRoute, "router/index.ts must register an index route");
  assert(!indexRoute.redirect,
    "Index route must render its own view: a redirect home canonicalizes to the "
      + "target page, and a page that points its canonical elsewhere cannot be listed");

  for (const route of routerRoutes) {
    // 파라미터·캐치올 라우트는 정적 URL이 아니고, 리다이렉트는 아래 규칙에서 따로 본다
    if (route.redirect || route.path.includes(":")) continue;
    assert(sitemapUrls.has(canonicalUrlFor(route.path)),
      `Router route is missing from the sitemap: ${canonicalUrlFor(route.path)}`);
  }

  for (const route of routerRoutes) {
    if (!route.redirect) continue;
    assert(!sitemapUrls.has(canonicalUrlFor(route.path)),
      `Redirect route must not be listed in the sitemap: ${canonicalUrlFor(route.path)}`);
  }
}

// Collect every JSON-LD node of a rendered document, flattening arrays and @graph.
function collectJsonLdNodes(html, route) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    ),
  ].map(([, body]) => body.trim());

  const nodes = [];
  for (const [index, block] of blocks.entries()) {
    assert(block.length > 0,
      `Empty JSON-LD block #${index + 1} for ${route}`);

    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (error) {
      throw new Error(
        `Invalid JSON-LD block #${index + 1} for ${route}: ${error.message}`
      );
    }

    const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node || typeof node !== "object") continue;
      if (Array.isArray(node["@graph"])) queue.push(...node["@graph"]);
      nodes.push(node);
    }
  }

  return nodes;
}

// One url must map to one entity: the shell owns the single WebApplication node,
// so a view re-declaring it would split the page into two competing entities.
function validateJsonLd(html, route) {
  const nodes = collectJsonLdNodes(html, route);
  assert(nodes.length > 0, `Missing JSON-LD for ${route}`);

  const webApplications = nodes.filter((node) => node["@type"] === "WebApplication");
  assert(webApplications.length === 1,
    `Expected exactly one WebApplication node for ${route}, found ${webApplications.length}`);
  assert(typeof webApplications[0]["@id"] === "string",
    `WebApplication node must carry an @id for ${route}`);
}

// 셸의 정적 애드센스 태그. AdSlot.vue의 중복 주입 방지 셀렉터와 같은 속성을 본다.
const ADSENSE_LOADER_PATTERN = /<script[^>]*\bdata-adsense="true"[^>]*>\s*<\/script>/i;
const ADSENSE_ANY_PATTERN = /adsbygoogle/i;

// vite-ssg는 정적 HTML이 곧 화면이므로 태그를 걷어낸 본문 길이가 렌더 후 자수와 같다.
function visibleTextLength(html) {
  const withoutHead = html.replace(/<head\b[\s\S]*?<\/head>/i, " ");
  const withoutInert = withoutHead
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  return withoutInert.replace(/<[^>]+>/g, " ").replace(/\s+/g, "").length;
}

const MIN_PUBLIC_ROUTE_CHARS = 1500;

function validatePublicRoutes() {
  const titles = new Set();
  const rawDocuments = new Set();

  for (const route of PUBLIC_ROUTES) {
    const outputPath = routeOutputPath(route);
    assert(existsSync(outputPath),
      `Missing HTTP 200 static output for ${route}: ${outputPath}`);

    const html = readFileSync(outputPath, "utf8");
    const expectedCanonical = route === "/"
      ? canonicalBase
      : `${canonicalBase}${route}`;
    const actualTitle = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
    const actualCanonical = html.match(
      /<link rel="canonical" href="([^"]+)"\s*\/?>/
    )?.[1];
    const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

    assert(actualTitle, `Missing title for ${route}`);
    assert(!titles.has(actualTitle), `Duplicate title for ${route}: ${actualTitle}`);
    assert(actualCanonical === expectedCanonical,
      `Invalid canonical for ${route}: expected ${expectedCanonical}`);
    assert(!/name="robots" content="noindex/.test(html),
      `Public route must be indexable: ${route}`);
    assert(html.includes('id="app"'), `Missing app root for ${route}`);
    assert(h1Count === 1, `Expected one H1 for ${route}, found ${h1Count}`);
    assert(!/<noscript>/i.test(html),
      `Rendered route must not retain the shell noscript for ${route}`);
    assert(!rawDocuments.has(html), `Duplicate raw HTML for ${route}`);
    // 404 로더 제거가 정상 라우트까지 번지면 광고가 통째로 죽는다 — 역방향으로 고정한다.
    assert(ADSENSE_LOADER_PATTERN.test(html),
      `Public route must keep the AdSense loader: ${route}`);
    const chars = visibleTextLength(html);
    assert(chars >= MIN_PUBLIC_ROUTE_CHARS,
      `Thin content for ${route}: ${chars} chars (minimum ${MIN_PUBLIC_ROUTE_CHARS})`);
    validateJsonLd(html, route);

    titles.add(actualTitle);
    rawDocuments.add(html);
  }
}

function validateNotFound() {
  const notFoundPath = resolve(distRoot, "404.html");
  assert(existsSync(notFoundPath), "Missing custom 404.html output");

  const html = readFileSync(notFoundPath, "utf8");
  assert(/name="robots" content="noindex,nofollow"/.test(html),
    "404.html must be noindex,nofollow");
  assert(html.includes(">404<"), "404.html must render the recovery page");
  assert(html.includes('href="/seller"'),
    "404.html must link back to an existing seller page");
  // Valuable Inventory: 게시자 콘텐츠가 없는 화면(404 본문 50자 미만)에는 광고를 두지 않는다.
  assert(!ADSENSE_ANY_PATTERN.test(html),
    "404.html must not carry any AdSense loader or slot (Valuable Inventory)");
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"), "client/dist");
validateVercelConfig(resolve(projectRoot, "vercel.json"), "dist");
const sitemapUrls = validateSitemap();
validateRouterRoutesAreListed(sitemapUrls);
validatePublicRoutes();
validateNotFound();

console.log(
  "Validated " + SEO_ROUTES.length + " sitemap routes (router↔sitemap parity checked "
  + "both ways), " + PUBLIC_ROUTES.length + " public routes (JSON-LD included), "
  + "both Vercel configs, and custom HTTP 404 output."
);
