import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  optimizeDeps: {
    include: [
      'react-data-grid',
      'chart.js',
      'react-chartjs-2',
      'd3-array',
      'react-pdf',
      'wavesurfer.js',
      'react-markdown',
      'remark-gfm',
      '@comunica/query-sparql',
      '@comunica/query-sparql-rdfjs',
      'sigma',
      'graphology',
      'graphology-layout-forceatlas2'
    ],
  },
  server: {
    open: true,
  },
});