const CACHE_NAME = 'carnet-dettes-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Installation : mise en cache des nouveaux fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Forcer le nouveau Service Worker à devenir actif immédiatement
  self.skipWaiting();
});

// Activation : suppression des anciens caches (ex: v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Prendre le contrôle immédiat de toutes les pages ouvertes
  self.clients.claim();
});

// Interception des requêtes : stratégie Network-First pour toujours charger le code le plus récent si connecté
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si le réseau fonctionne, on met à jour le cache et on renvoie la réponse fraîche
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne de réseau / hors ligne, on utilise le cache
        return caches.match(event.request);
      })
  );
});
