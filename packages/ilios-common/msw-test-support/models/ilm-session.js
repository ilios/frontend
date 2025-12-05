import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  hours: Number,
  dueDate: String,
  session: oneOf('session'),
  learnerGroups: manyOf('learnerGroup'),
  instructorGroups: manyOf('instructorGroup'),
  instructors: manyOf('user'),
  learners: manyOf('user'),
};
