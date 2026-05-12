import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string().nullish(),
  value: z.string().nullish(),
});

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
