import { http, HttpResponse } from 'msw';
import { db } from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';

// Cohorts with school filter
// Overrides the generic GET /api/cohorts handler
export default http.get('/api/cohorts', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolsFilter = params.get('filters[schools]');

  let cohorts = await db.cohort.all();

  // Apply school filter if present
  if (schoolsFilter) {
    const schoolIds = JSON.parse(schoolsFilter);
    cohorts = cohorts.filter((cohort) => {
      const programYear = cohort.programYear;
      if (!programYear) return false;

      const program = programYear.program;
      if (!program) return false;

      const school = program.school;
      return school && schoolIds.includes(school.id);
    });
  }

  const { limit, offset, include } = parseQueryParams(params.toString());
  const total = cohorts.length;
  const paginatedCohorts = cohorts.slice(offset, offset + limit);

  const meta = {
    totalCount: total,
  };

  return HttpResponse.json(formatJsonApi(paginatedCohorts, 'cohort', { meta, include }));
});
