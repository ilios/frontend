import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  description: z.string().nullish(),
  active: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'sessionTypes',
    type: 'manyOf',
    target: 'sessionType',
  },
];
