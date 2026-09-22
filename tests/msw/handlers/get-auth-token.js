import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';

// GET /auth/token
export default http.get('/auth/token', () => {
  const now = DateTime.now();
  const nextWeek = now.plus({ weeks: 1 });
  const header = '{"alg":"none"}';
  const body = `{"iss": "ilios","aud": "ilios","iat": "${now.toUnixInteger()}","exp": "${nextWeek.toUnixInteger()}","user_id": 4136}`;

  const encodedData = globalThis.btoa(header) + '.' + globalThis.btoa(body) + '.';

  return HttpResponse.json({
    jwt: encodedData,
  });
});
