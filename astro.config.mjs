// astro.config.mjs
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [
    // applyBaseStyles: false, want de nieuwe pagina heeft zijn eigen stylesheet
    // (public/assets/css/style.css) met een eigen reset. Zonder deze instelling
    // injecteert Tailwind zijn preflight in elke pagina en botst dat met de
    // eigen opmaak.
    tailwind({ applyBaseStyles: false }),
    icon({ autoInstall: true, include: { ic: ["*"] } }),
  ],
});
