import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  room: String,
  site: String,
  url: String,
  startDate: String,
  endDate: String,
  updatedAt: String,
  session: oneOf('session'),
  learnerGroups: manyOf('learnerGroup'),
  instructorGroups: manyOf('instructorGroup'),
  learners: manyOf('user'),
  instructors: manyOf('user'),
};
