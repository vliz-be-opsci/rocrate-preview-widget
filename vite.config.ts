import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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