import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  build: {
    // Raise warning threshold — we're actively splitting below
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely → long-lived cache
          'vendor-react': ['react', 'react-dom'],
          // Supabase client — changes only on version bump
          'vendor-supabase': ['@supabase/supabase-js'],
          // Lucide icons — large library, separate chunk
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
})
