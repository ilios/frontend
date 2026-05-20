import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  type: z.string().nullish(),
  property: z.string().nullish(),
  value: z.string().nullish(),
});

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
