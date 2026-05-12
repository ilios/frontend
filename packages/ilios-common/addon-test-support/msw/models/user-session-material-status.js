import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  status: z.number().nullish(),
});

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
  {
    field: 'material',
    type: 'oneOf',
    target: 'sessionLearningMaterial',
  },
];
