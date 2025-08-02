// astro.config.mjs
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind(), icon({ autoInstall: true, include: { ic: ["*"] } })],
});
