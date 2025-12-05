import { primaryKey, oneOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  treeNumber: String,
  descriptor: oneOf('meshDescriptor'),
};
