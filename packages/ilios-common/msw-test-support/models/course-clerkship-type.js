import { primaryKey, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  courses: manyOf('course'),
};
