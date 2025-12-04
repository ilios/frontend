import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  active: Boolean,
  school: oneOf('school'),
  terms: manyOf('term'),
};
