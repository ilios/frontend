import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  notes: String,
  required: Boolean,
  publicNotes: Boolean,
  position: Number,
  startDate: String,
  endDate: String,
  session: oneOf('session'),
  learningMaterial: oneOf('learningMaterial'),
  meshDescriptors: manyOf('meshDescriptor'),
};
