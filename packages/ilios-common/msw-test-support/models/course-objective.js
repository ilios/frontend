import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  position: Number,
  active: Boolean,
  course: oneOf('course'),
  ancestor: oneOf('courseObjective'),
  descendants: manyOf('courseObjective'),
  meshDescriptors: manyOf('meshDescriptor'),
  terms: manyOf('term'),
  programYearObjectives: manyOf('programYearObjective'),
};
