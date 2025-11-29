// A unique name for your cache
// Increment this number (e.g., to 'v1.0.4') every time you update your core files 
// (HTML, main JavaScript, CSS, or the list of external CNDs).
const CACHE_VERSION = 'v1.0.3'; 

// Names for the different cache buckets
const CACHE_SHELL_NAME = 'app-shell-' + CACHE_VERSION;
const CACHE_STATIC_NAME = 'static-libraries-' + CACHE_VERSION;

// --------------------------------------------------------------------------
// 1. APP SHELL FILES (Core application and PWA assets)
// These files are essential for loading the page structure.
// --------------------------------------------------------------------------
const CACHE_SHELL_FILES = [
    '/', // Root index page (your main HTML)
    '/index.html', // Alias for the root page
    '/favicon.png',
    '/favicon.svg', 
    '/manifest.json', // Required for PWA installation
    // The current page is using inlined CSS and JS, but if you add external files, list them here.
    // Example: '/styles/main.css', 
];

// --------------------------------------------------------------------------
// 2. STATIC LIBRARIES (External CDN resources)
// These are heavy, external JavaScript libraries that must be cached for offline use.
// --------------------------------------------------------------------------
const CACHE_STATIC_ASSETS = [
    // pdf.js library (from your <script> tag)
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    // pdf.js worker (needed by your application logic)
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    // jspdf library (from your <script> tag)
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    // Any external fonts or other libraries you load
    // Example: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
];

// --------------------------------------------------------------------------
// INSTALL EVENT: Pre-cache all essential files (Offline preparation)
// --------------------------------------------------------------------------
self.addEventListener('install', (event) => {
    console.log('[SW] Installing and pre-caching assets...');
    event.waitUntil(
        Promise.all([
            // Cache the essential app shell files
            caches.open(CACHE_SHELL_NAME).then((cache) => {
                return cache.addAll(CACHE_SHELL_FILES);
            }),
            // Cache the large, external JavaScript libraries
            caches.open(CACHE_STATIC_NAME).then((cache) => {
                return cache.addAll(CACHE_STATIC_ASSETS);
            })
        ])
    );
});

// --------------------------------------------------------------------------
// ACTIVATE EVENT: Clean up old caches (Version management)
// --------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating and cleaning old caches...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // Delete caches that don't match the current version names
                if (key !== CACHE_SHELL_NAME && key !== CACHE_STATIC_NAME) {
                    console.log('[SW] Deleting old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Immediately take control of clients (speeds up initial load after update)
    return self.clients.claim();
});


// --------------------------------------------------------------------------
// FETCH EVENT: Cache-First Strategy (Speed and Offline Access)
// --------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests for assets, not POSTs or external trackers.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        // 1. Check if the file is already in ANY cache
        caches.match(event.request).then((response) => {
            if (response) {
                // Cache Hit: Serve the file instantly from cache
                return response;
            }

            // Cache Miss: Go to the network
            return fetch(event.request).then((networkResponse) => {
                // Check if we received a valid response (not a 404 or a cross-origin failure)
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                    return networkResponse;
                }
                
                // Clone the response because the stream can only be consumed once
                const responseToCache = networkResponse.clone();
                
                // Use the correct cache name based on the request URL
                const cacheName = CACHE_STATIC_ASSETS.includes(event.request.url) ? CACHE_STATIC_NAME : CACHE_SHELL_NAME;

                // Cache the new resource for future use
                caches.open(cacheName).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                // Return the original network response
                return networkResponse;
            }).catch(() => {
                // Network failed (user is likely offline)
                console.log('[SW] Fetch failed. Serving fallback if available.');
                // For a simple PWA, falling back to the cached app shell is the best we can do.
                return caches.match('/');
            });
        })
    );
});
