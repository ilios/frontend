import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
