/* Service Worker for Factures carte procurement SGDF PWA */
const CACHE_VERSION = "v3";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/SGDF_symbole_RVB.png",
  "/SGDF_symbole_blanc.png",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/shortcut-96.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isCacheableRequest(request, url) {
  return (
    request.method === "GET" &&
    url.origin === self.location.origin &&
    (url.protocol === "http:" || url.protocol === "https:")
  );
}

function putInCache(request, response) {
  if (!response || !response.ok) {
    return;
  }

  const clone = response.clone();
  caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!isCacheableRequest(event.request, url)) return;

  if (isApiRequest(url)) {
    // Network first for API; fallback to cache (likely empty) then offline page
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          putInCache(event.request, res);
          return res;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((r) => r || caches.match("/offline.html")),
        ),
    );
    return;
  }

  // For navigation requests, try network then offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          putInCache(event.request, res);
          return res;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((r) => r || caches.match("/offline.html")),
        ),
    );
    return;
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkRes) => {
          putInCache(event.request, networkRes);
          return networkRes;
        })
        .catch(() => cached || caches.match("/offline.html"));
      return cached || fetchPromise;
    }),
  );
});
