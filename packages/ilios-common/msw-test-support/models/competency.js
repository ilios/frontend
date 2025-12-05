import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  active: Boolean,
  school: oneOf('school'),
  parent: oneOf('competency'),
  children: manyOf('competency'),
  aamcPcrses: manyOf('aamcPcrs'),
  programYears: manyOf('programYear'),
  programYearObjectives: manyOf('programYearObjective'),
};
