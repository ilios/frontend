import { DateTime } from 'luxon';
import { Factory } from 'miragejs';

export default Factory.extend({
  room: (i) => `room ${i}`,
  site: (i) => `site ${i}`,
  startDate: () => DateTime.fromObject({ hour: 8 }).toJSDate(),
  endDate: () => DateTime.fromObject({ hour: 9 }).toJSDate(),
});
