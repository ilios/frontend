import { DateTime } from 'luxon';
import { Factory } from 'miragejs';

export default Factory.extend({
  createdAt: () => DateTime.fromObject({ hour: 8 }),
});
