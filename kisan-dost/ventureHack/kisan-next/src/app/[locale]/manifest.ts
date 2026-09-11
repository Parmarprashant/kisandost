import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KisanDost - Digital Companion for Farmers',
    short_name: 'KisanDost',
    description: 'Crop health, fertilizer calculator, and NDVI tracking for farmers in India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2e6b3b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
