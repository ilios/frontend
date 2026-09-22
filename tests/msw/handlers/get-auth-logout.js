import { http, HttpResponse } from 'msw';

// GET /auth/logout
export default http.get('/auth/logout', () => {
  return new HttpResponse(null, { status: 200 });
});
