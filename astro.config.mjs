// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// The canonical domain. Override with PUBLIC_SITE_URL (e.g. in Cloudflare Pages
// environment variables) if the site moves to another domain.
const site = (process.env.PUBLIC_SITE_URL || 'https://approveddecorators.co.uk').replace(/\/$/, '');

// https://astro.build/config
export default defineConfig({
  site,
  // Emit /about.html instead of /about/index.html so Cloudflare Pages serves
  // /about with a 200 instead of 308-redirecting to /about/.
  trailingSlash: 'never',
  build: {
    format: 'file'
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap({
    filter: (page) => !page.includes('/404')
  })]
});
