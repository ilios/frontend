import { http, HttpResponse } from 'msw';
import { db } from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';

// Courses with school filter
// Overrides the generic GET /api/courses handler
export default http.get('/api/courses', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolFilter = params.get('filters[school]');

  let courses = await db.course.all();

  // Apply school filter if present
  if (schoolFilter) {
    const schoolId = JSON.parse(schoolFilter);
    courses = courses.filter((course) => {
      const school = course.school;
      return school && schoolId === school.id;
    });
  }

  const { filterParams, limit, offset, queryTerms, include } = parseQueryParams(params.toString());

  // Apply other filters
  if (filterParams.length > 0) {
    courses = courses.filter((course) => {
      return filterParams.every(({ param, value }) => {
        const fieldValue = course[param];
        if (Array.isArray(value)) {
          return value.includes(String(fieldValue));
        }
        return String(fieldValue) === String(value);
      });
    });
  }

  // Apply search
  if (queryTerms.length > 0) {
    const searchTerm = queryTerms.join(' ').toLowerCase();
    courses = courses.filter((course) => {
      return Object.values(course).some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }
        return false;
      });
    });
  }

  const total = courses.length;
  const paginatedCourses = courses.slice(offset, offset + limit);

  const meta = {
    totalCount: total,
  };

  return HttpResponse.json(formatJsonApi(paginatedCourses, 'course', { meta, include }));
});
