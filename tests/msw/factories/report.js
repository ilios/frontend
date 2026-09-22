import { DateTime } from 'luxon';

export default {
  createdAt: () => DateTime.fromObject({ hour: 8 }).toISO(),
};
