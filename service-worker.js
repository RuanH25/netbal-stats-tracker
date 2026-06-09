const CACHE_NAME = "netball-app-v9";

const urlsToCache = [
  ".",
  "index.html",
  "app.html",
  "offline.html",
  "css/website.css",
  "css/app.css",
  "js/website.js",
  "js/app.js",
  "manifest.json",
  "assets/images/background.jpg.png",
  "assets/logos/Logo.jpg.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(error => {
            console.warn(`Could not cache ${url}`, error);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        if (event.request.destination === "document") {
          return caches.match("offline.html");
        }
      });
    })
  );
});
