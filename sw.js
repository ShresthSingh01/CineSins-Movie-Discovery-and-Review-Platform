const CACHE_NAME = 'cinesins-cache-v7';
const IMAGE_CACHE_NAME = 'cinesins-images-v3';
const MAX_IMAGE_CACHE_SIZE_MB = 30;

const APP_SHELL = [
    './',
    './index.html',
    './styles.css',
    './main.js',
    './api.js',
    './store.js',
    './ui.js',
    './config.js',
    './src/regionData.js',
    './src/eventStore.js',
    './src/archetype.js',
    './ui/animations.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Pre-caching App Shell');
                return cache.addAll(APP_SHELL);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

async function enforceImageLRU() {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const keys = await cache.keys();

    // Limit to 200 items for cache sanity
    const MAX_ITEMS = 200;

    if (keys.length > MAX_ITEMS) {
        // Delete oldest (first keys added)
        const keysToDelete = keys.slice(0, keys.length - MAX_ITEMS);
        for (const key of keysToDelete) {
            await cache.delete(key);
        }
    }
}

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // If it's an image request
    if (url.pathname.match(/\.(jpg|png|gif|webp)$/i) || url.hostname.includes('media-amazon') || url.hostname.includes('placeholder')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) return response;

                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(IMAGE_CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache).then(() => {
                            enforceImageLRU();
                        });
                    });
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Handle other requests
    event.respondWith((async () => {
        const isAppShell = APP_SHELL.some(path => url.pathname.endsWith(path.replace('./', '')));

        if (isAppShell) {
            return caches.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => null);

                return cachedResponse || fetchPromise;
            });
        }

        if (url.hostname.includes('omdbapi.com')) {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse && networkResponse.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            } catch (err) {
                return new Response("Offline Mode", { status: 503, statusText: "Offline" });
            }
        }

        try {
            return await fetch(event.request);
        } catch (err) {
            return caches.match(event.request);
        }
    })());
});
