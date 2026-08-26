import type { APIRoute } from "astro";

import { localePath, locales } from "../lib/i18n";

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("Astro site URL is required to generate the sitemap");

  const entries = locales
    .map(
      (locale) =>
        `  <url><loc>${new URL(localePath(locale, import.meta.env.BASE_URL), site)}</loc></url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    },
  );
};
