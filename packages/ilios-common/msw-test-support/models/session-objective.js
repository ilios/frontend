import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  position: Number,
  active: Boolean,
  session: oneOf('session'),
  terms: manyOf('term'),
  meshDescriptors: manyOf('meshDescriptor'),
  ancestor: oneOf('sessionObjective'),
  descendants: manyOf('sessionObjective'),
  courseObjectives: manyOf('courseObjective'),
};
