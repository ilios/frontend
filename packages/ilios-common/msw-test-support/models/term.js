import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  description: String,
  active: Boolean,
  vocabulary: oneOf('vocabulary'),
  parent: oneOf('term'),
  children: manyOf('term'),
  programYears: manyOf('programYear'),
  sessions: manyOf('session'),
  courses: manyOf('course'),
  aamcResourceTypes: manyOf('aamcResourceType'),
  courseObjectives: manyOf('courseObjective'),
  programYearObjectives: manyOf('programYearObjective'),
  sessionObjectives: manyOf('sessionObjective'),
};
