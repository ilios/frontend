import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    type: z.string().optional(),
    property: z.string().optional(),
    value: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
