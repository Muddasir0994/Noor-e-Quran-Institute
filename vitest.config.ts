import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' if DOM methods are used in tests (like for React components), but node is better for backend/lib
    globals: true,
  },
});
