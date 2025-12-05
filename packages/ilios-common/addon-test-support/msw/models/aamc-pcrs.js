import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    description: z.string().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'competencies',
    type: 'manyOf',
    target: 'competency',
  },
];
