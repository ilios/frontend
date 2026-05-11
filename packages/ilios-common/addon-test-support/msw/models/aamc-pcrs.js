import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    description: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'competencies',
    type: 'manyOf',
    target: 'competency',
  },
];
