import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  annotation: String,
  deleted: Boolean,
  courses: manyOf('course'),
  sessions: manyOf('session'),
  concepts: manyOf('meshConcept'),
  qualifiers: manyOf('meshQualifier'),
  trees: manyOf('meshTree'),
  sessionLearningMaterials: manyOf('sessionLearningMaterial'),
  courseLearningMaterials: manyOf('courseLearningMaterial'),
  previousIndexing: oneOf('meshPreviousIndexing'),
  sessionObjectives: manyOf('sessionObjective'),
  courseObjectives: manyOf('courseObjective'),
  programYearObjectives: manyOf('programYearObjective'),
};
