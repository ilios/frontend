import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string(),
  value: z.union([z.boolean(), z.string()]),
});

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
