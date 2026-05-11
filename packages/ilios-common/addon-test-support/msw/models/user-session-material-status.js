import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    status: z.number().optional(),
  })
  .passthrough();

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
