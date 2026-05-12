import { DateTime } from 'luxon';

export default {
  title: (i) => `learning material ${i}`,
  description: (i) => ` ${i} lm description`,
  uploadDate: () => DateTime.fromObject({ hour: 8 }).toJSDate(),
};
