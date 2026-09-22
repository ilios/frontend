import { setupWorker } from 'msw/browser';
import { getHandlers } from './handlers';

let server;
let serverStartPromise;

export async function startMSW(config = {}) {
  if (server) {
    return server;
  }

  if (!serverStartPromise) {
    serverStartPromise = (async () => {
      const createdServer = setupAndStartMSW(config);

      await createdServer.start({ onUnhandledRequest: 'warn', quiet: true });

      server = createdServer;

      return server;
    })();
  }

  return serverStartPromise;
}

export async function stopMSW() {
  if (!server) {
    return;
  }

  await server.stop();

  server = undefined;
  serverStartPromise = undefined;
}

function setupAndStartMSW(config = {}) {
  const handlers = getHandlers(config);
  const worker = setupWorker(...handlers);

  return worker;
}
