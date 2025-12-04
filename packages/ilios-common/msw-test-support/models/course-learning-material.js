import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  notes: String,
  required: Boolean,
  publicNotes: Boolean,
  position: Number,
  startDate: String,
  endDate: String,
  course: oneOf('course'),
  learningMaterial: oneOf('learningMaterial'),
  meshDescriptors: manyOf('meshDescriptor'),
};
