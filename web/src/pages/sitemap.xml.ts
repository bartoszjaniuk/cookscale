import type { APIRoute } from "astro";

const BASE_URL = "https://cookscale.app";

const pages = [
  { url: "/", changefreq: "weekly", priority: "1.0" },
  { url: "/calculator", changefreq: "monthly", priority: "0.9" },
  { url: "/ai", changefreq: "monthly", priority: "0.8" },
  { url: "/history", changefreq: "monthly", priority: "0.5" },
];

export const GET: APIRoute = () => {
  const now = new Date().toISOString().split("T")[0];

  const urls = pages
    .map(
      (p) =>
        `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
