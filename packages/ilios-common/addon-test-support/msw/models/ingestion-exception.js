import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    uid: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
