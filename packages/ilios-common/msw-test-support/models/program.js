import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  shortTitle: String,
  duration: Number,
  school: oneOf('school'),
  programYears: manyOf('programYear'),
  directors: manyOf('user'),
  curriculumInventoryReports: manyOf('curriculumInventoryReport'),
};
