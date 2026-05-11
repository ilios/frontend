import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    username: z.string().nullish(),
    password: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
