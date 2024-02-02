import { Factory } from 'miragejs';
import { DateTime } from 'luxon';

export default Factory.extend({
  hours: (i) => (i + 1) * 5,
  dueDate: () => DateTime.fromObject({ hour: 8 }),
});
