import { primaryKey, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  description: String,
  competencies: manyOf('competency'),
};
