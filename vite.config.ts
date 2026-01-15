
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid 'cwd' property error in TypeScript environments that do not include Node types for the global process object
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Fix: Cast process to any to avoid 'cwd' property error
        '@systems': path.resolve((process as any).cwd(), 'systems'),
        '@shared': path.resolve((process as any).cwd(), 'shared'),
        '@': path.resolve((process as any).cwd(), '.')
      }
    }
  };
});
