// @ts-check
import { fileURLToPath } from 'node:url';

import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  output: 'static',
  compressHTML: false,

  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src/', import.meta.url)),
      },
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          loadPaths: [fileURLToPath(new URL('./src', import.meta.url))],
        },
      },
    },
    build: {
      sourcemap: false,
      minify: false,
      cssCodeSplit: false,
    },
  },
});