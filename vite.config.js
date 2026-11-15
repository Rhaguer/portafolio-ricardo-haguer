import { copyFileSync, cpSync, existsSync } from 'node:fs';
import { defineConfig } from 'vite';

const additionalFiles = ['classic.html', 'portfolio.js', 'logo-rihm.webp'];

export default defineConfig({
  base: './',
  publicDir: 'dist',
  plugins: [{
    name: 'portfolio-static-files',
    configureServer(server) {
      server.middlewares.use('/models', (request, response, next) => {
        request.url = '/public/models' + request.url;
        next();
      });
    },
    closeBundle() {
      for (const file of additionalFiles) copyFileSync(file, `build/${file}`);
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
