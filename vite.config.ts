import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (id.includes('/three/')) return id.includes('three.core') ? 'three-core' : 'three-renderer';
          if (id.includes('/gsap/')) return 'motion';
          if (id.includes('/node_modules/react') || id.includes('/scheduler/')) return 'react';
          return 'spatial';
        },
      },
    },
  },
});
