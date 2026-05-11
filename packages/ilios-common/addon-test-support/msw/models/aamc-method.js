import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    description: z.string().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'sessionTypes',
    type: 'manyOf',
    target: 'sessionType',
  },
];
