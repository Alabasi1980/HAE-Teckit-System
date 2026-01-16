
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  /* 
    Fix: Use bracket notation for process['cwd']() to avoid Property 'cwd' does not exist on type 'Process' error 
  */
  const env = loadEnv(mode, process['cwd'](), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        /* 
          Fix: Using process['cwd']() for paths to avoid TypeScript resolution issues in certain environments 
        */
        '@systems': path.resolve(process['cwd'](), 'systems'),
        '@shared': path.resolve(process['cwd'](), 'shared'),
        '@': path.resolve(process['cwd'](), '.')
      }
    },
    build: {
      target: 'esnext'
    }
  };
});