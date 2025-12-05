import { primaryKey } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
};
