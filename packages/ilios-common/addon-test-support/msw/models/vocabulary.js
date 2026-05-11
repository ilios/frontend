import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().nullish(),
    active: z.boolean().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
];
