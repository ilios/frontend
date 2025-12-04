import { primaryKey, oneOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  status: Number,
  user: oneOf('user'),
  material: oneOf('sessionLearningMaterial'),
};
