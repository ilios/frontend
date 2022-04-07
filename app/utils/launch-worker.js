import config from 'ilios/config/environment';

export async function launchWorker() {
  if (!config.disableServiceWorker && !navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.register(`${config.rootURL}sw.js`, {
        scope: '/',
      });
    } catch (err) {
      console.log('😥 Ilios Service worker registration failed: ', err);
    }
    const registration = await navigator.serviceWorker.ready;
    while (registration.active?.state !== 'activated') {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}
