const CACHE_VERSION = 'v12';
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
      c.addAll(PRECACHE).catch(() => {})
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

// Хелпер для безопасного кэширования
async function cacheSafe(urlOrRequest, cache) {
  try {
    const response = typeof urlOrRequest === 'string' 
      ? await fetch(urlOrRequest) 
      : await fetch(urlOrRequest);
    
    if (response && response.status === 200) {
      await cache.put(urlOrRequest, response.clone());
      return response.clone();
    }
  } catch (e) {
    // Ignore network errors
  }
  return null;
}

// Хелпер для очистки старого кэша
async function pruneCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > MAX_CACHE_SIZE) {
      await cache.delete(keys[0]);
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

self.addEventListener('fetch', e => {
  const { request } = e;
  
  // Игнорируем не-GET запросы
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  
  // Игнорируем не-HTTP(S) протоколы
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Аудиофайлы: Network First с fallback на кэш
  if (url.pathname.match(/\.(mp3|wav|flac|m4a|ogg)$/i)) {
    e.respondWith(
      fetch(request)
        .then(async response => {
          if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Изображения (обложки): Cache First с обновлением
  if (url.pathname.match(/\.(webp|png|jpe?g|gif|svg|ico)$/i)) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
          // Обновляем в фоне
          fetch(request)
            .then(async response => {
              if (response && response.status === 200) {
                await cache.put(request, response.clone());
              }
            })
            .catch(() => {});
          return cached;
        }
        
        // Не найдено в кэше — пробуем сеть
        const networkResponse = await fetch(request).catch(() => null);
        if (networkResponse && networkResponse.status === 200) {
          await cache.put(request, networkResponse.clone());
          return networkResponse;
        }
        
        return new Response('', { status: 404 });
      })()
    );
    return;
  }

  // HTML/JS/CSS: Network First с fallback на кэш
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    e.respondWith(
      fetch(request)
        .then(async response => {
          if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          
          // Fallback на index.html для SPA роутинга
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Остальное: Cache First
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      
      if (cached) return cached;
      
      const networkResponse = await fetch(request).catch(() => null);
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        await cache.put(request, networkResponse.clone());
      }
      
      return networkResponse || cached || new Response('', { status: 404 });
    })()
  );
});
