/* Service Worker for Scouticket PWA */
const versionDeploiement =
  new URL(self.location.href).searchParams.get("version") || "inconnue";
const CACHE_VERSION = `scouticket-${versionDeploiement}`;
const APP_SHELL = ["/manifest.json", "/offline.html"];

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

function isCacheableRequest(request, url) {
  return (
    request.method === "GET" &&
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      APP_SHELL.includes(url.pathname))
  );
}

function putInCache(request, response) {
  if (!response || !response.ok) {
    return Promise.resolve();
  }

  const clone = response.clone();
  return caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Les pages et API ne sont jamais mises en cache : elles peuvent contenir
  // des données privées ou des références propres à un déploiement Next.js.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html")),
    );
    return;
  }

  if (!isCacheableRequest(event.request, url)) return;

  // Ressources statiques : cache d’abord, puis mise à jour en arrière-plan.
  const revalidationPromise = fetch(event.request);
  event.waitUntil(
    revalidationPromise
      .then((networkRes) => putInCache(event.request, networkRes))
      .catch(() => undefined),
  );

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = revalidationPromise.catch(
        () => cached || caches.match("/offline.html"),
      );
      return cached || fetchPromise;
    }),
  );
});
