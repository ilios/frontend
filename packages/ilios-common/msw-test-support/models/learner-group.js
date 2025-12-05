import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  location: String,
  url: String,
  needsAccommodation: Boolean,
  cohort: oneOf('cohort'),
  parent: oneOf('learnerGroup'),
  children: manyOf('learnerGroup'),
  ilmSessions: manyOf('ilmSession'),
  offerings: manyOf('offering'),
  instructorGroups: manyOf('instructorGroup'),
  users: manyOf('user'),
  instructors: manyOf('user'),
  ancestor: oneOf('learnerGroup'),
  descendants: manyOf('learnerGroup'),
};
