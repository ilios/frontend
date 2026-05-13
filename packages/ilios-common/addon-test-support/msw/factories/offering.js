import { DateTime } from 'luxon';

export default {
  room: (i) => `room ${i}`,
  site: (i) => `site ${i}`,
  startDate: DateTime.fromObject({ hour: 8 }).toJSDate(),
  endDate: DateTime.fromObject({ hour: 9 }).toJSDate(),
  updatedAt: DateTime.fromObject({ hour: 9 }).toJSDate(),
};
