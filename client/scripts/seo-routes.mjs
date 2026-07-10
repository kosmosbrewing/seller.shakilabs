export const SITEMAP_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/market-compare", changefreq: "monthly", priority: "0.8" },
  { path: "/payment-compare", changefreq: "monthly", priority: "0.8" },
  { path: "/shipping-compare", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];

export const SEO_ROUTES = SITEMAP_ROUTES.map(({ path }) => path);

export const PUBLIC_ROUTES = [...SEO_ROUTES, "/terms"];

// /404는 Vercel의 실제 404 응답 본문으로 사용한다.
export const SSG_ROUTES = [...PUBLIC_ROUTES, "/404"];
