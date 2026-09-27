import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Cloudflare adapter in "directory" mode = static + server islands.
// Contact API (`src/pages/api/contact.ts`) runs as a Cloudflare Function.
// Everything else prerenders to static for max performance (Webflow parity + faster).
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile'
  }),
  site: 'https://fjord-and-form.demo',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    server: {
      // Allow sandboxed preview hosts (e.g. *.e2b.app) in dev.
      allowedHosts: ['.e2b.app', 'localhost'],
    },
    ssr: {
      external: ['node:buffer', 'node:path', 'node:fs']
    }
  }
});
