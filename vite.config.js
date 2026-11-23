import {defineConfig} from 'vite';

export default defineConfig({
  // hydra-synth's browser bundle expects the Node-style global alias.
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['hydra-synth'],
  },
});
