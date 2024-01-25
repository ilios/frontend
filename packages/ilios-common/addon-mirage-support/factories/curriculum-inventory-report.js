import { Factory } from 'miragejs';
import { DateTime } from 'luxon';

export default Factory.extend({
  name: (i) => `report ${i} `,
  description: (i) => `descirption for report ${i} `,
  year: 2013,
  startDate: () => DateTime.fromObject({ hour: 8 }).toJSDate(),
  endDate: () => DateTime.fromObject({ hour: 8 }).plus({ weeks: 7 }).toJSDate(),
});
