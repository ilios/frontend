import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
});

export const relationships = [
  {
    field: 'courses',
    type: 'manyOf',
    target: 'course',
  },
];
