import { http, HttpResponse } from 'msw';

// GET /auth/whoami
export default http.get('/auth/whoami', () => {
  return HttpResponse.json({
    userId: 4136,
  });
});
