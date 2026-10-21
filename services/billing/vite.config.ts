import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SERVICE = 'billing';
// у watch-режимі не чистимо dist: entrypoint може читати файли саме під час перезбірки
const watch = process.argv.includes('--watch');

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // client-білд роздає entrypoint за цим префіксом
  base: `/mfe/${SERVICE}/`,
  // server.js самодостатній: свій React усередині, нічого не резолвиться з node_modules entrypoint
  ssr: { noExternal: true },
  build: isSsrBuild
    ? {
        outDir: 'dist/server',
        emptyOutDir: !watch,
        rolldownOptions: {
          output: { entryFileNames: 'server.js', codeSplitting: false },
        },
      }
    : {
        outDir: 'dist/client',
        emptyOutDir: !watch,
        manifest: true,
        rolldownOptions: {
          input: 'src/client.tsx',
          // інакше Vite прибере export hydrate з entry-чанка
          preserveEntrySignatures: 'strict',
          // один JS + один CSS: Vite не інжектить CSS чанків у document.head (поза shadow root)
          output: { codeSplitting: false },
        },
      },
}));
