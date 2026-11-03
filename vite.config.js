import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vercel sets VERCEL_ENV to "production" or "preview" at build time. Preview builds use Stripe test mode.
  define: { __STRIPE_TEST_MODE__: JSON.stringify(process.env.VERCEL_ENV === 'preview') },
})
