/**
 * Service Worker - A1 Saúde
 * Gerencia cache e funcionalidade offline
 */

const CACHE_NAME = 'a1-saude-v1';
const STATIC_CACHE = 'a1-saude-static-v1';
const DYNAMIC_CACHE = 'a1-saude-dynamic-v1';
const API_CACHE = 'a1-saude-api-v1';

// Arquivos essenciais para cache inicial
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// URLs da API que devem ser cacheadas
const API_ROUTES = [
  '/api/v1/patients',
  '/api/v1/medications',
  '/api/v1/establishments'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Removing old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estratégia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar extensões do Chrome
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API: Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Arquivos estáticos: Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Páginas HTML: Network First para SPA
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Verificar se é arquivo estático
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(pathname);
}

// Estratégia: Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia: Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network first fallback to cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Para navegação, retornar a página principal (SPA)
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background Sync para operações offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sincronizar dados offline
async function syncOfflineData() {
  try {
    // Obter dados pendentes do IndexedDB
    const pendingData = await getPendingOfflineData();
    
    for (const data of pendingData) {
      try {
        const response = await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: JSON.stringify(data.body)
        });
        
        if (response.ok) {
          await removePendingData(data.id);
          console.log('[SW] Synced:', data.id);
        }
      } catch (error) {
        console.log('[SW] Sync failed for:', data.id);
      }
    }
  } catch (error) {
    console.log('[SW] Sync error:', error);
  }
}

// Funções placeholder para IndexedDB
async function getPendingOfflineData() {
  // Implementação com IndexedDB
  return [];
}

async function removePendingData(id) {
  // Implementação com IndexedDB
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const data = event.data?.json() || {
    title: 'A1 Saúde',
    body: 'Nova notificação',
    icon: '/icon-192.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data
    })
  );
});

// Click em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
