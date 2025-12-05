import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  description: String,
  level: Number,
  report: oneOf('curriculumInventoryReport'),
  startingSequenceBlocks: manyOf('curriculumInventorySequenceBlock'),
  endingSequenceBlocks: manyOf('curriculumInventorySequenceBlock'),
};
