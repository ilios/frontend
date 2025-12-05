import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  attireRequired: Boolean,
  equipmentRequired: Boolean,
  supplemental: Boolean,
  attendanceRequired: Boolean,
  publishedAsTbd: Boolean,
  published: Boolean,
  instructionalNotes: String,
  updatedAt: String,
  sessionType: oneOf('sessionType'),
  course: oneOf('course'),
  ilmSession: oneOf('ilmSession'),
  sessionObjectives: manyOf('sessionObjective'),
  meshDescriptors: manyOf('meshDescriptor'),
  learningMaterials: manyOf('sessionLearningMaterial'),
  offerings: manyOf('offering'),
  administrators: manyOf('user'),
  studentAdvisors: manyOf('user'),
  postrequisite: oneOf('session'),
  prerequisites: manyOf('session'),
  terms: manyOf('term'),
};
