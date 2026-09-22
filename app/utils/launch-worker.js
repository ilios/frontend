import config from 'frontend/config/environment';
import { isTesting } from '@embroider/macros';

export async function launchWorker() {
  if (
    isTesting() ||
    config.disableServiceWorker ||
    !('serviceWorker' in navigator) ||
    navigator.serviceWorker.controller
  ) {
    return true;
  }

  try {
    navigator.serviceWorker.register(`${config.rootURL}sw.js`, {
      scope: '/',
    });
    const registration = await navigator.serviceWorker.ready;
    while (registration.active?.state !== 'activated') {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    console.info('☀️ Ilios Service worker registered successfully');
  } catch (err) {
    console.error('😥 Ilios Service worker registration failed: ', err);
  }
}
