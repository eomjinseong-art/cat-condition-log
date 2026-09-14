const CACHE = "cat-condition-log-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isStatic = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icon-");
  if (!isStatic) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const fetched = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone()).catch(() => undefined);
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetched;
      }),
    ),
  );
});
