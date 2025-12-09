import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    active: z.boolean().optional(),
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
