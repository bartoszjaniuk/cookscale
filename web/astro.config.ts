import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

const adapter = process.env.NETLIFY ? netlify() : node({ mode: "standalone" });

export default defineConfig({
  integrations: [react()],
  adapter: adapter,
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
  output: "server",
});
