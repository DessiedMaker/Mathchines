const CACHE_NAME = "mathchines-cache-v1";
const PRECACHE_ASSETS = ["/", "/learn", "/auth"];

// Install Event - Precache primary entry points
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch Event - Handle caching strategies
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip caching for API, Supabase, internal Vite dev endpoints, or non-GET requests
  if (
    request.method !== "GET" ||
    url.pathname.includes("/api/") ||
    url.hostname.includes("supabase.co") ||
    url.pathname.startsWith("/@") ||
    url.pathname.includes("hot-update")
  ) {
    return;
  }

  // Navigation requests - return page shell if offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        // If offline, serve the /learn shell for learn subroutes, or root shell
        if (url.pathname.startsWith("/learn")) {
          return caches.match("/learn");
        }
        return caches.match("/") || caches.match("/learn");
      }),
    );
    return;
  }

  // Stale-While-Revalidate for JS, CSS, fonts, and images
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Silent catch for network failures when offline
          });

        return cachedResponse || fetchPromise;
      });
    }),
  );
});
