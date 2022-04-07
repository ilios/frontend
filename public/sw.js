const iliosServiceWorkerCacheName = 'ilios-files-1';

const indexUrlPatterns = [
  /\/dashboard(\/.*)?$/,
  /\/courses(\/.*)?$/,
  /\/course-materials(\/.*)?$/,
  /\/instructorgroups(\/.*)?$/,
  /\/learnergroups(\/.*)?$/,
  /\/programs(\/.*)?$/,
  /\/admin(\/.*)?$/,
  /\/login(\/.*)?$/,
  /\/logout(\/.*)?$/,
  /\/schools(\/.*)?$/,
  /\/myprofile(\/.*)?$/,
  /\/mymaterials(\/.*)?$/,
  /\/course-rollover(\/.*)?$/,
  /\/curriculum-inventory-reports(\/.*)?$/,
  /\/curriculum-inventory-sequence-block(\/.*)?$/,
  /\/data(\/.*)?$/,
  /\/weeklyevents(\/.*)?$/,
];
// Handle requests for index.html
self.addEventListener('fetch', (event) => {
  if (shouldHandleRequest(event.request, ['text/html'], indexUrlPatterns)) {
    const indexUrl = new URL('index.html', self.location).toString();
    cacheFallbackFetch(event, indexUrl);
  }
});

self.addEventListener('activate', (event) => {
  const cacheAllowlist = [iliosServiceWorkerCacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheAllowlist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

function shouldHandleRequest(request, fileTypes, filePatterns) {
  const url = new URL(request.url);
  const isGETRequest = request.method === 'GET';
  const isLocal = url.origin === location.origin;
  const isTests = url.pathname === '/tests';
  const acceptHeader = request.headers?.get('accept');
  const isAcceptedRequest = fileTypes.some((type) => acceptHeader.includes(type));
  const matchesPattern = filePatterns.some((pattern) => pattern.test(url.pathname));

  return !isTests && isGETRequest && isAcceptedRequest && isLocal && matchesPattern;
}

function cacheFallbackFetch(event, url) {
  fetch(url)
    .then(function (res) {
      return caches.open(iliosServiceWorkerCacheName).then(function (cache) {
        // Put in cache if succeeds
        cache.put(url, res.clone());
        event.respondWith(res);
      });
    })
    .catch(function () {
      // Fallback to cache
      cacheFirstFetch(event, url);
    });
}

function cacheFirstFetch(event, url) {
  return event.respondWith(
    caches.match(url, { cacheName: iliosServiceWorkerCacheName }).then((response) => {
      if (response) {
        return response;
      }

      /**
          Re-fetch the resource in the event that the cache had been cleared
          (mostly an issue with Safari 11.1 where clearing the cache causes
          the browser to throw a non-descriptive blank error page).
        */
      return fetch(url, { credentials: 'include' }).then((fetchedResponse) => {
        caches.open(iliosServiceWorkerCacheName).then((cache) => cache.put(url, fetchedResponse));
        return fetchedResponse.clone();
      });
    })
  );
}

/* ############### KILL SWITCH ###############
The rest of this file is a service worker kill switch adapted from https://stackoverflow.com/a/38980776
The purpose is to assume controll of all active workers and replace them with a noop
By commenting out the top of this file and uncommenting this we can get out of any
weird situation with our service worker and caching.
############### KILL SWITCH ###############
*/

/*
self.addEventListener('install', () => {
  // Skip over the "waiting" lifecycle state, to ensure that our
  // new service worker is activated immediately, even if there's
  // another tab open controlled by our older service worker code.
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Get a list of all the current open windows/tabs under
  // our service worker's control, and force them to reload.
  // This can "unbreak" any open windows/tabs as soon as the new
  // service worker activates, rather than users having to manually reload.
  self.clients.matchAll({type: 'window'}).then(windowClients => {
    windowClients.forEach(windowClient => {
      windowClient.navigate(windowClient.url);
    });
  });
});
*/
