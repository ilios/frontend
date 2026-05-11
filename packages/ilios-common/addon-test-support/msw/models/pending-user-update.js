import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    type: z.string().nullish(),
    property: z.string().nullish(),
    value: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
