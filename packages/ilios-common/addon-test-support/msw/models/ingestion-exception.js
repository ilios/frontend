import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    uid: z.string().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
