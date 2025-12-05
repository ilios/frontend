import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';
import { handlers } from './handlers.js';

// Creates and configures MSW server with auth and config routes
export function startMSW(config = {}) {
  const { apiVersion = '3' } = config;

  // Auth and config handlers
  const authHandlers = [
    // POST /auth/login
    http.post('/auth/login', async ({ request }) => {
      const errors = [];
      const attrs = await request.json();

      if (!attrs.username) {
        errors.push('missingUsername');
      }
      if (!attrs.password) {
        errors.push('missingPassword');
      }

      const username = attrs.username?.toLowerCase();

      if (errors.length === 0) {
        if (username === 'demo' && attrs.password === 'demo') {
          const now = DateTime.now();
          const nextWeek = now.plus({ weeks: 1 });
          const header = '{"alg":"none"}';
          const body = `{"iss": "ilios","aud": "ilios","iat": "${now.toUnixInteger()}","exp": "${nextWeek.toUnixInteger()}","user_id": 4136}`;

          const encodedData = globalThis.btoa(header) + '.' + globalThis.btoa(body) + '.';

          return HttpResponse.json({
            jwt: encodedData,
          });
        } else {
          errors.push('badCredentials');
        }
      }

      return HttpResponse.json({ errors }, { status: 400 });
    }),

    // GET /auth/logout
    http.get('/auth/logout', () => {
      return new HttpResponse(null, { status: 200 });
    }),

    // GET /auth/whoami
    http.get('/auth/whoami', () => {
      return HttpResponse.json({
        userId: 4136,
      });
    }),

    // GET /auth/token
    http.get('/auth/token', () => {
      const now = DateTime.now();
      const nextWeek = now.plus({ weeks: 1 });
      const header = '{"alg":"none"}';
      const body = `{"iss": "ilios","aud": "ilios","iat": "${now.toUnixInteger()}","exp": "${nextWeek.toUnixInteger()}","user_id": 4136}`;

      const encodedData = globalThis.btoa(header) + '.' + globalThis.btoa(body) + '.';

      return HttpResponse.json({
        jwt: encodedData,
      });
    }),

    // GET /application/config
    http.get('/application/config', () => {
      return HttpResponse.json({
        config: {
          type: 'form',
          apiVersion,
          appVersion: '1.2.3',
          materialStatusEnabled: true,
          showCampusNameOfRecord: true,
        },
      });
    }),

    // POST /errors - swallow errors
    http.post('/errors', () => {
      return new HttpResponse(null, { status: 204 });
    }),
  ];

  // Combine auth handlers with model handlers
  // Auth handlers first to ensure they match before generic routes
  const allHandlers = [...authHandlers, ...handlers];

  const worker = setupWorker(...allHandlers);

  return worker;
}

export default startMSW;
