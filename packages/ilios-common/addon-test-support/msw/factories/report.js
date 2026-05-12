import { DateTime } from 'luxon';

export default {
  title: (i) => `report ${i}`,
  createdAt: () => DateTime.fromObject({ hour: 8 }).toJSDate(),
};
