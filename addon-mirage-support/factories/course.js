import { DateTime } from 'luxon';
import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `course ${i}`,
  year: 2013,
  level: 1,
  startDate: () => DateTime.fromObject({ hour: 8 }).toJSDate(),
  endDate: () => DateTime.fromObject({ hour: 8 }).plus({ weeks: 7 }).toJSDate(),
  archived: false,
});
