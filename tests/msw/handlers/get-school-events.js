import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';
import { db } from '../db.js';

// School events with date range filtering
export default http.get('/api/schoolevents/:schoolid', async ({ request, params }) => {
  const url = new URL(request.url);
  const from = Number(url.searchParams.get('from'));
  const to = Number(url.searchParams.get('to'));
  const schoolId = Number(params.schoolid);

  const schoolEvents = (await db.schoolevent.all()).filter((event) => {
    const st = DateTime.fromISO(event.startDate).toUnixInteger();
    const et = DateTime.fromISO(event.endDate).toUnixInteger();
    return Number(event.school) === schoolId && from <= st && to >= et;
  });

  return HttpResponse.json({
    events: schoolEvents,
  });
});
