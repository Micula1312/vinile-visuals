import {defineConfig} from 'vite';

import archive from './aphis-archive.mjs';
export default defineConfig({
  plugins:[archive()],
  // hydra-synth's browser bundle expects the Node-style global alias.
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['hydra-synth'],
  },
});
