const CACHE_VERSION = 'v11';
const CACHE_NAME = 'a5000-player-' + CACHE_VERSION;

// Статические ассеты для пре-кэширования
const PRECACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Максимальный размер кэша
const MAX_CACHE_SIZE = 50;

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      Promise.all(PRECACHE.map(u => c.add(u).catch(() => null)))
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Стратегия: Network First для аудио, Cache First для изображений
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Аудиофайлы: Network First с fallback на кэш
  if (url.pathname.match(/\.(mp3|wav|flac|m4a|ogg)$/i)) {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => {
              c.keys().then(keys => {
                if (keys.length > MAX_CACHE_SIZE) c.delete(keys[0]);
                c.put(request, clone);
              });
            });
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Изображения (обложки): Cache First с обновлением
  if (url.pathname.match(/\.(webp|png|jpe?g|gif|svg|ico)$/i)) {
    e.respondWith(
      caches.match(request).then(cached => {
        const cacheOrFetch = cached || fetch(request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => {
              c.keys().then(keys => {
                if (keys.length > MAX_CACHE_SIZE) c.delete(keys[0]);
                c.put(request, clone);
              });
            });
          }
          return res;
        }).catch(() => cached);
        return cacheOrFetch || new Response('', { status: 404 });
      })
    );
    return;
  }

  // HTML/JS/CSS: Network First с fallback на кэш (stale-while-revalidate)
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Остальное: Cache First
  e.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

// Periodic background sync для обновления кэша
self.addEventListener('periodicsync', e => {
  if (e.tag === 'update-cache') {
    e.waitUntil(
      caches.open(CACHE_NAME).then(cache =>
        Promise.all(PRECACHE.map(url => cache.add(url).catch(() => null)))
      )
    );
  }
});
