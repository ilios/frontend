import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';

// POST /auth/login
export default http.post('/auth/login', async ({ request }) => {
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
});
