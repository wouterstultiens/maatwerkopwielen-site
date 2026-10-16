/* Sitemap voor Google. Bouwt mee met de site, dus nieuwe auto's in het aanbod
   komen er vanzelf in. De aanbodpagina staat er alleen in als er een auto
   online staat: een lege overzichtspagina hoort niet in de index. */
import { autos } from "../lib/aanbod.js";

const SITE = "https://maatwerkopwielen.nl";

export function GET() {
  const paden = ["/"];
  if (autos.length > 0) {
    paden.push("/aanbod/", ...autos.map((a) => `/aanbod/${a.slug}/`));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paden.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
