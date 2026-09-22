import { http, HttpResponse } from 'msw';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { createFromPostData } from './helpers.js';
import { createModel } from '../create-model.js';

// Program year creation with auto-cohort creation
// Overrides the generic POST /api/programyears handler
export default http.post('/api/programyears', async ({ request }) => {
  const body = await request.json();
  const data = body.data;
  const programYear = await createFromPostData('programYear', data);

  // Automatically create associated cohort
  const graduationYear = programYear.startYear + (programYear.program.duration || 4);
  const cohortTitle = `Class of ${graduationYear}`;

  await createModel('cohort', {
    programYear: programYear,
    title: cohortTitle,
  });

  return HttpResponse.json(formatJsonApi(programYear, 'programYear'), { status: 201 });
});
