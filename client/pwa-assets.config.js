// Config for "npm run generate-pwa-assets", which turns public/logo.svg
// into every icon size the PWA needs (favicon, Android, iOS, maskable).
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const background = '#1f1a24'; // same dark colour as the app

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // "Maskable" icons get cropped into circles/squircles by Android,
    // so they need padding filled with the background colour (not white).
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ['public/logo.svg'],
});
