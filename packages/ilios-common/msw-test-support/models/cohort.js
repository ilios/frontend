import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  programYear: oneOf('programYear'),
  courses: manyOf('course'),
  learnerGroups: manyOf('learnerGroup'),
  users: manyOf('user'),
};
