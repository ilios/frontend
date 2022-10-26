import { Factory } from 'miragejs';
import { DateTime } from 'luxon';

export default Factory.extend({
  title: (i) => `learning material ${i}`,
  description: (i) => ` ${i} lm description`,
  uploadDate: () => DateTime.fromObject({ hour: 8 }),
});
