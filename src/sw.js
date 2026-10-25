// Minimal service worker: ilovani o'rnatish imkonini beradi, hech narsani keshlamaydi.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})