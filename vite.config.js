import { cpSync, existsSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'dist',
  plugins: [{
    name: 'optional-player-model',
    configureServer(server) {
      server.middlewares.use('/models', (request, response, next) => {
        request.url = '/public/models' + request.url;
        next();
      });
    },
    closeBundle() {
      if (existsSync('public/models')) cpSync('public/models', 'build/models', { recursive: true });
    },
  }],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 850,
  },
});
