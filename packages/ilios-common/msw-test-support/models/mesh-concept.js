import { primaryKey, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  preferred: Boolean,
  scopeNote: String,
  casn1Name: String,
  registryNumber: String,
  terms: manyOf('meshTerm'),
  descriptors: manyOf('meshDescriptor'),
};
