// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    try {
      navigator.serviceWorker.register('/sw.js');
    } catch (err) {
      console.log('😥 Ilios Service worker registration failed: ', err);
    }
  });
}
