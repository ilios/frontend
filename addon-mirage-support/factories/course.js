import { DateTime } from 'luxon';
import { Factory } from 'miragejs';

const june24th2025 = { year: 2005, month: 6, day: 24, hour: 8 };
const startDate = DateTime.fromObject(june24th2025).toJSDate();
const endDate = DateTime.fromObject(june24th2025).plus({ weeks: 7 }).toJSDate();
export default Factory.extend({
  title: (i) => `course ${i}`,
  year: 2013,
  level: 1,
  startDate,
  endDate,
  archived: false,
});
