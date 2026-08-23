export const SITEMAP_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/market-compare", changefreq: "monthly", priority: "0.8" },
  { path: "/payment-compare", changefreq: "monthly", priority: "0.8" },
  { path: "/shipping-compare", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  // /terms는 라우터에 등록된 self-canonical·색인 가능 페이지인데 사이트맵에서만
  // 빠져 있었다(라이브 6 URL). 다른 앱(biz·car·loan·travel)은 전부 싣고 있다.
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];

export const SEO_ROUTES = SITEMAP_ROUTES.map(({ path }) => path);

// seller에는 canonical을 다른 곳으로 모으는 변종 라우트가 없어서 "200을 내는 공개
// 페이지" 집합과 "사이트맵에 싣는 집합"이 일치한다. 변종 패밀리를 도입하게 되면
// 그때만 PUBLIC_ROUTES에 더하고 SITEMAP_ROUTES에는 넣지 않는다.
export const PUBLIC_ROUTES = [...SEO_ROUTES];

// /404는 Vercel의 실제 404 응답 본문으로 사용한다.
export const SSG_ROUTES = [...PUBLIC_ROUTES, "/404"];
