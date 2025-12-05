import { primaryKey, oneOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  previousIndexing: String,
  descriptor: oneOf('meshDescriptor'),
};
