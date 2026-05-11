import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    name: z.string().optional(),
    value: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
