import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Raise the warning threshold slightly (default 500 kB)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy:
         *  - "vendor-react"   : React core + Router (needed on every page)
         *  - "vendor-charts"  : Recharts / Chart.js (heavy, rarely needed on first load)
         *  - "vendor-ui"      : Lucide icons + other UI libs
         *  - Each page already gets its own dynamic chunk via React.lazy()
         */
        manualChunks(id) {
          // React ecosystem – always cached after first visit
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // Charting libraries – large, only used on dashboard pages
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/chart.js') ||
              id.includes('node_modules/react-chartjs') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }

          // Icon / UI utility libraries
          if (id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/@headlessui') ||
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/class-variance-authority')) {
            return 'vendor-ui';
          }

          // HTTP / utility libraries
          if (id.includes('node_modules/axios') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/dayjs')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
})
