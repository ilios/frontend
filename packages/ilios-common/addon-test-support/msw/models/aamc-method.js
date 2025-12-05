import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    description: z.string().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'sessionTypes',
    type: 'manyOf',
    target: 'sessionType',
  },
];
