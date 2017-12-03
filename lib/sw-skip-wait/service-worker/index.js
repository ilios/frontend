/* global self */ // self is defined in the ember-service-worker which consumes this file

/**
 * Listen for service worker messages and if the
 * content is 'skipWaiting' then this immediately activates the worker
 * for all tabs and windows currently using the previous version.
 */
self.addEventListener('message', function skipWaitingMessageCallback(event) {
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }
});

/**
 * When a new worker is activated 'claim' all windows and tabs that were not using
 * the original worker. This really only happens with new connections that did not go
 * through the worker for their assets.
 */
self.addEventListener('activate', function installEventListenerCallback() {
  return self.clients.claim();
});
