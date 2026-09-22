import { http, HttpResponse } from 'msw';

// Default user preferecnes
export default http.get('/application/preferences', async () => {
  return HttpResponse.json({
    version: 1,
    preferences: {},
  });
});
