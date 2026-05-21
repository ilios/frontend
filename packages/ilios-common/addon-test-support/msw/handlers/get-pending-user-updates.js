import { http, HttpResponse } from 'msw';
import { db } from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';

// Pending user updates with school filter
// Overrides the generic GET /api/pendinguserupdates handler
export default http.get('/api/pendinguserupdates', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolsFilter = params.get('filters[schools]');

  let updates = await db.pendingUserUpdate.all();

  // Apply school filter if present
  if (schoolsFilter) {
    const schoolIds = JSON.parse(schoolsFilter);
    updates = updates.filter((update) => {
      const user = update.user;
      if (!user) return false;

      const school = user.school;
      return school && schoolIds.includes(school.id);
    });
  }

  const { limit, offset, include } = parseQueryParams(params.toString());
  const total = updates.length;
  const paginatedUpdates = updates.slice(offset, offset + limit);

  const meta = {
    totalCount: total,
  };

  return HttpResponse.json(formatJsonApi(paginatedUpdates, 'pendingUserUpdate', { meta, include }));
});
