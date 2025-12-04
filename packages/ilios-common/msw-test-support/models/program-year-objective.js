import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  position: Number,
  active: Boolean,
  competency: oneOf('competency'),
  programYear: oneOf('programYear'),
  terms: manyOf('term'),
  meshDescriptors: manyOf('meshDescriptor'),
  ancestor: oneOf('programYearObjective'),
  descendants: manyOf('programYearObjective'),
  courseObjectives: manyOf('courseObjective'),
};
