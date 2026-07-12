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
  const expectedUrls = SEO_ROUTES.map((route) =>
    route === "/" ? canonicalBase : `${canonicalBase}${route}`
  );

  assert(actualUrls.length === SEO_ROUTES.length,
    `Sitemap must contain exactly ${SEO_ROUTES.length} public routes`);
  assert(new Set(actualUrls).size === actualUrls.length,
    "Sitemap contains duplicate routes");
  assert(JSON.stringify(actualUrls) === JSON.stringify(expectedUrls),
    "Sitemap routes do not match the expected public routes");
}

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
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"), "client/dist");
validateVercelConfig(resolve(projectRoot, "vercel.json"), "dist");
validateSitemap();
validatePublicRoutes();
validateNotFound();

console.log(
  "Validated " + SEO_ROUTES.length + " sitemap routes, "
  + PUBLIC_ROUTES.length + " public routes, both Vercel configs, and custom HTTP 404 output."
);
