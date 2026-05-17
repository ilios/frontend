import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  uid: z.string().nullish(),
});

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
];
