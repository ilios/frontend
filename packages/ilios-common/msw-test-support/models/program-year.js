import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  startYear: Number,
  locked: Boolean,
  archived: Boolean,
  publishedAsTbd: Boolean,
  published: Boolean,
  program: oneOf('program'),
  cohort: oneOf('cohort'),
  directors: manyOf('user'),
  competencies: manyOf('competency'),
  programYearObjectives: manyOf('programYearObjective'),
  terms: manyOf('term'),
};
