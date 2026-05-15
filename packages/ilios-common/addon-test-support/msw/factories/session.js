import { DateTime } from 'luxon';

export default {
  title: (i) => `session ${i}`,
  attireRequired: false,
  equipmentRequired: false,
  supplemental: false,
  updatedAt: DateTime.fromObject({ month: 2, day: 4, hour: 6, minute: 8 }).toISO(),
};
