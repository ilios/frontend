import { primaryKey, oneOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  description: String,
  report: oneOf('curriculumInventoryReport'),
};
