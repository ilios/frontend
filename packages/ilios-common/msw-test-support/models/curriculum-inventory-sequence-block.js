import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  description: String,
  required: Number,
  childSequenceOrder: Number,
  orderInSequence: Number,
  minimum: Number,
  maximum: Number,
  track: Boolean,
  startDate: String,
  endDate: String,
  duration: Number,
  academicLevel: Number,
  startingAcademicLevel: oneOf('curriculumInventoryAcademicLevel'),
  endingAcademicLevel: oneOf('curriculumInventoryAcademicLevel'),
  parent: oneOf('curriculumInventorySequenceBlock'),
  children: manyOf('curriculumInventorySequenceBlock'),
  report: oneOf('curriculumInventoryReport'),
  sessions: manyOf('session'),
  excludedSessions: manyOf('session'),
  course: oneOf('course'),
};
