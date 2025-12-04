import { primaryKey, oneOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  document: String,
  createdAt: String,
  report: oneOf('curriculumInventoryReport'),
  createdBy: oneOf('user'),
};
