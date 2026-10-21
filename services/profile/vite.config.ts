import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SERVICE = 'profile';
const watch = process.argv.includes('--watch');

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  base: `/mfe/${SERVICE}/`,
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
          preserveEntrySignatures: 'strict',
          output: { codeSplitting: false },
        },
      },
}));
