import { primaryKey, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  name: String,
  lexicalTag: String,
  conceptPreferred: Boolean,
  recordPreferred: Boolean,
  permuted: Boolean,
  concepts: manyOf('meshConcept'),
};
