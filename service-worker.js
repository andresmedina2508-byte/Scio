const CACHE_NAME = "guardianes-palabra-v6";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS);
    }).catch((error) => {
      console.error("Error instalando caché:", error);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {

        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const copia = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copia);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("./index.html");
        });
      })
  );
});
