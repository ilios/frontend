import { DateTime } from 'luxon';

export default {
  hours: (i) => (i + 1) * 5,
  dueDate: () => DateTime.fromObject({ hour: 8 }).toJSDate(),
};
