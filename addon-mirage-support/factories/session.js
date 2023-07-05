import { Factory } from 'miragejs';
import { DateTime } from 'luxon';

export default Factory.extend({
  title: (i) => `session ${i}`,
  description: (i) => `session description ${i}`,
  attireRequired: false,
  equipmentRequired: false,
  supplemental: false,
  updatedAt: DateTime.fromObject({ month: 2, day: 4, hour: 6, minute: 8 }).toJSDate(),
});
