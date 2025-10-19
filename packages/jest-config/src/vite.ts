// import type { UserConfig } from 'vite';

// export const viteConfig: UserConfig = {
export const viteConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
};
