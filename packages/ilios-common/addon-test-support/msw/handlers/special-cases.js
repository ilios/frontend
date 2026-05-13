import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';
import { db, filterByParams } from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';

// Cohorts with school filter
// Overrides the generic GET /api/cohorts handler
const cohortsHandler = http.get('/api/cohorts', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolsFilter = params.get('filters[schools]');

  let cohorts = await db.cohort.findMany();

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

  const { limit, offset } = parseQueryParams(params.toString());
  const total = cohorts.length;
  const paginatedCohorts = cohorts.slice(offset, offset + limit);

  const meta = {
    totalCount: total,
  };

  return HttpResponse.json(formatJsonApi(paginatedCohorts, 'cohort', { meta }));
});

// Courses with school filter
// Overrides the generic GET /api/courses handler
const coursesHandler = http.get('/api/courses', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolFilter = params.get('filters[school]');

  let courses = await db.course.findMany();

  // Apply school filter if present
  if (schoolFilter) {
    const schoolId = JSON.parse(schoolFilter);
    courses = courses.filter((course) => {
      const school = course.school;
      return school && schoolId === school.id;
    });
  }

  const { filterParams, limit, offset, queryTerms } = parseQueryParams(params.toString());

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

  return HttpResponse.json(formatJsonApi(paginatedCourses, 'course', { meta }));
});

// Sessions with school filter
// Overrides the generic GET /api/sessions handler
const sessionsHandler = http.get('/api/sessions', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolsFilter = params.get('filters[schools]');

  let sessions = await db.session.findMany();

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

// Pending user updates with school filter
// Overrides the generic GET /api/pendinguserupdates handler
const pendingUserUpdatesHandler = http.get('/api/pendinguserupdates', async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const schoolsFilter = params.get('filters[schools]');

  let updates = await db.pendingUserUpdate.findMany();

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

  const { limit, offset } = parseQueryParams(params.toString());
  const total = updates.length;
  const paginatedUpdates = updates.slice(offset, offset + limit);

  const meta = {
    totalCount: total,
  };

  return HttpResponse.json(formatJsonApi(paginatedUpdates, 'pendingUserUpdate', { meta }));
});

// Program year creation with auto-cohort creation
// Overrides the generic POST /api/programyears handler
const programYearCreateHandler = http.post('/api/programyears', async ({ request }) => {
  const body = await request.json();
  const data = body.data;

  if (!data) {
    return new HttpResponse(JSON.stringify({ errors: ['Invalid request body'] }), {
      status: 400,
    });
  }

  // Extract attributes and relationships
  const attrs = { ...data.attributes };
  if (data.relationships) {
    Object.keys(data.relationships).forEach((key) => {
      const relationship = data.relationships[key];
      if (relationship.data) {
        if (Array.isArray(relationship.data)) {
          attrs[key] = relationship.data.map((item) => item.id);
        } else {
          attrs[key] = relationship.data.id;
        }
      }
    });
  }

  // Create the program year
  const programYear = await db.programYear.create(attrs);

  // Automatically create associated cohort
  const program = programYear.program;
  const graduationYear = parseInt(programYear.startYear, 10) + parseInt(program?.duration || 4, 10);
  const cohortTitle = `Class of ${graduationYear}`;

  const cohort = await db.cohort.create({
    programYear: programYear.id,
    title: cohortTitle,
  });

  // Update program year with cohort reference
  db.programYear.update({
    where: { id: { equals: programYear.id } },
    data: { cohort: cohort.id },
  });

  const updated = db.programYear.findFirst((q) => q.where({ id: programYear.id }));

  return HttpResponse.json(formatJsonApi(updated, 'programYear'), { status: 201 });
});

// User events with date range filtering
const userEventsHandler = http.get('/api/userevents/:userid', async ({ request, params }) => {
  const url = new URL(request.url);
  const from = Number(url.searchParams.get('from'));
  const to = Number(url.searchParams.get('to'));
  const userid = Number(params.userid);

  const userEvents = db.userevent.findMany().filter((event) => {
    const st = DateTime.fromJSDate(event.startDate).toUnixInteger();
    const et = DateTime.fromJSDate(event.endDate).toUnixInteger();
    return Number(event.user) === userid && from <= st && to >= et;
  });

  return HttpResponse.json({
    userEvents,
  });
});

// School events with date range filtering
const schoolEventsHandler = http.get('/api/schoolevents/:schoolid', async ({ request, params }) => {
  const url = new URL(request.url);
  const from = Number(url.searchParams.get('from'));
  const to = Number(url.searchParams.get('to'));
  const schoolId = Number(params.schoolid);

  const schoolEvents = db.schoolevent.findMany().filter((event) => {
    const st = DateTime.fromJSDate(event.startDate).toUnixInteger();
    const et = DateTime.fromJSDate(event.endDate).toUnixInteger();
    return Number(event.school) === schoolId && from <= st && to >= et;
  });

  return HttpResponse.json({
    events: schoolEvents,
  });
});

// File upload mock
const uploadHandler = http.post('/upload', async () => {
  let hash = '';
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    hash += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }

  return HttpResponse.json({
    filename: 'bogus.txt',
    fileHash: hash,
  });
});

export const specialCaseHandlers = [
  cohortsHandler,
  coursesHandler,
  sessionsHandler,
  pendingUserUpdatesHandler,
  programYearCreateHandler,
  userEventsHandler,
  schoolEventsHandler,
  uploadHandler,
];
