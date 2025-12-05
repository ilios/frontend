import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  level: Number,
  year: Number,
  startDate: String,
  endDate: String,
  externalId: String,
  locked: Boolean,
  archived: Boolean,
  publishedAsTbd: Boolean,
  published: Boolean,
  clerkshipType: oneOf('courseClerkshipType'),
  school: oneOf('school'),
  directors: manyOf('user'),
  administrators: manyOf('user'),
  studentAdvisors: manyOf('user'),
  cohorts: manyOf('cohort'),
  courseObjectives: manyOf('courseObjective'),
  meshDescriptors: manyOf('meshDescriptor'),
  learningMaterials: manyOf('courseLearningMaterial'),
  sessions: manyOf('session'),
  ancestor: oneOf('course'),
  descendants: manyOf('course'),
  terms: manyOf('term'),
};
