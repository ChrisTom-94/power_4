import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl({root: './public'})],
  // base: '/power_4/',
  build: {
    outDir: 'release'
  }
});