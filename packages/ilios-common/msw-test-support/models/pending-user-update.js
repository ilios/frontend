import { primaryKey, oneOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  type: String,
  property: String,
  value: String,
  user: oneOf('user'),
};
