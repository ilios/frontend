import { http, HttpResponse } from 'msw';
import { db, filterByParams } from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';

// Sessions with school filter
// Overrides the generic GET /api/sessions handler
export default http.get('/api/sessions', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolsFilter = params.get('filters[schools]');

  let sessions = await db.session.all();

  // Apply school filter if present
  if (schoolsFilter) {
    const schoolIds = JSON.parse(schoolsFilter);
    sessions = sessions.filter((session) => {
      const course = session.course;
      if (!course) return false;

      const school = course.school;
      return school && schoolIds.includes(school.id);
    });
  }
  const { filterParams, limit, offset, include } = parseQueryParams(url.searchParams.toString());
  // unset schools filter
  delete filterParams['schools'];

  sessions = await filterByParams('session', sessions, filterParams);
  const total = sessions.length;
  const paginatedSessions = sessions.slice(offset, offset + limit);

  const meta = {
    totalCount: total,
  };

  return HttpResponse.json(formatJsonApi(paginatedSessions, 'session', { meta, include }));
});
