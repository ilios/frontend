import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'courses',
    type: 'manyOf',
    target: 'course',
  },
];
