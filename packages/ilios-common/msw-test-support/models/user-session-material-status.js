import { primaryKey, oneOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  status: Number,
  user: oneOf('user'),
  material: oneOf('sessionLearningMaterial'),
};
