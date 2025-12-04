import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  description: String,
  year: Number,
  startDate: String,
  endDate: String,
  export: oneOf('curriculumInventoryExport'),
  sequence: oneOf('curriculumInventorySequence'),
  sequenceBlocks: manyOf('curriculumInventorySequenceBlock'),
  program: oneOf('program'),
  academicLevels: manyOf('curriculumInventoryAcademicLevel'),
  administrators: manyOf('user'),
};
