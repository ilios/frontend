import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    status: z.number().optional(),
  })
  .passthrough();

export const relations = [
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
