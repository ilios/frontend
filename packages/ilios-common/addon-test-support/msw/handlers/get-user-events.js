import { http, HttpResponse } from 'msw';
import { DateTime } from 'luxon';
import { db } from '../db.js';

// User events with date range filtering
export default http.get('/api/userevents/:userid', async ({ request, params }) => {
  const url = new URL(request.url);
  const from = Number(url.searchParams.get('from'));
  const to = Number(url.searchParams.get('to'));
  const userid = Number(params.userid);

  const userEvents = (await db.userevent.all()).filter((event) => {
    const st = DateTime.fromISO(event.startDate).toUnixInteger();
    const et = DateTime.fromISO(event.endDate).toUnixInteger();
    return Number(event.user) === userid && from <= st && to >= et;
  });

  return HttpResponse.json({
    userEvents,
  });
});
