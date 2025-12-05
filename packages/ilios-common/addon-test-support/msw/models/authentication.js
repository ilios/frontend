import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
