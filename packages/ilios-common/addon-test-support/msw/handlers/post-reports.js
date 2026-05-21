import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { createFromPostData } from './helpers.js';

// Report year creation sets createdAt
// Overrides the generic POST /api/reports handler
export default http.post('/api/reports', async ({ request }) => {
  const body = await request.json();
  const data = body.data;
  data.attributes.createdAt = DateTime.fromObject({ hour: 8 }).toISO();
  const report = await createFromPostData('report', data);

  return HttpResponse.json(formatJsonApi(report, 'report'), { status: 201 });
});
