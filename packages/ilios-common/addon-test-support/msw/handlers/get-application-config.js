import { http, HttpResponse } from 'msw';

// GET /application/config
export default function (config) {
  const { apiVersion = '3' } = config;

  return http.get('/application/config', () => {
    return HttpResponse.json({
      config: {
        type: 'form',
        apiVersion,
        appVersion: '1.2.3',
        materialStatusEnabled: true,
        showCampusNameOfRecord: true,
      },
    });
  });
}
