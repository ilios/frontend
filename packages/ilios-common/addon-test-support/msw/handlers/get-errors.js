import { http, HttpResponse } from 'msw';

// POST /errors - swallow errors
export default http.post('/errors', () => {
  return new HttpResponse(null, { status: 204 });
});
