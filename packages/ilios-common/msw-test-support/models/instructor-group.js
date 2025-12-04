import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  school: oneOf('school'),
  learnerGroups: manyOf('learnerGroup'),
  ilmSessions: manyOf('ilmSession'),
  users: manyOf('user'),
  offerings: manyOf('offering'),
};
