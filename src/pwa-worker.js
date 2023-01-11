//Cannot pull from app.js as service workers don't have access the window context
const staticCacheName = 'qmcomp-20221205';

const assets = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/favicon.ico',
  '/assets/css/structure.css',
  '/assets/css/modal.css',
  '/assets/js/njtools-core.js',
  '/assets/js/njtools-extensions.js',
  '/assets/img/apple-touch-icon.png',
  '/assets/img/favicon-16x16.png',
  '/assets/img/favicon-32x32.png',
  '/assets/img/pwa-192x192.png',
  '/assets/img/pwa-512x512.png'
];

// install event
self.addEventListener('install', evt => {
	console.log('PWA Install event');
	evt.waitUntil(
		caches.open(staticCacheName).then((cache) => {
			console.log('Caching shell assets');
			cache.addAll(assets);
		})
	);
});

// activate event
self.addEventListener('activate', evt => {
	console.log('PWA Activate event');
	evt.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(keys
				.filter(key => key !== staticCacheName)
				.map(key => caches.delete(key))
			);
		})
	);
});

// fetch event
self.addEventListener('fetch', evt => {
	console.log('PWA Fetching event');
	evt.respondWith(
		caches.match(evt.request).then(cacheRes => {
			return cacheRes || fetch(evt.request);
		})
	);
});