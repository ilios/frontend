import { primaryKey, oneOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  value: String,
  school: oneOf('school'),
};
