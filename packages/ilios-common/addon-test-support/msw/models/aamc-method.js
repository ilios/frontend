import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    description: z.string().nullish(),
    active: z.boolean().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'sessionTypes',
    type: 'manyOf',
    target: 'sessionType',
  },
];
