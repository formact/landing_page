import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      ignored: [
        '**/*.png',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.gif',
        '**/*.webp',
        '**/*.pdf',
        '**/*.glb',
        '**/*.gltf',
        '**/node_modules/**',
        '**/.git/**'
      ]
    }
  }
});
