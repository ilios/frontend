import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  description: z.string().nullish(),
});

export const relationships = [
  {
    field: 'competencies',
    type: 'manyOf',
    target: 'competency',
  },
];
