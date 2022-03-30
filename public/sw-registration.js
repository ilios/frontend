// Register the service worker
if ('serviceWorker' in navigator) {
  // Wait for the 'load' event to not block other work
  window.addEventListener('load', async () => {
    // Try to register the service worker.
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('Ilios Service worker registered! 😎', reg);
    } catch (err) {
      console.log('😥 Ilios Service worker registration failed: ', err);
    }
  });
}
