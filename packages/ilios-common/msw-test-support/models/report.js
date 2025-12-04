import { primaryKey, oneOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  subject: String,
  prepositionalObject: String,
  prepositionalObjectTableRowId: String,
  user: oneOf('user'),
  school: oneOf('school'),
};
