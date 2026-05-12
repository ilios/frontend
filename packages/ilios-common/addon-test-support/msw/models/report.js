import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  subject: z.string().nullish(),
  prepositionalObject: z.string().nullish(),
  prepositionalObjectTableRowId: z.string().nullish(),
  createdAt: z.date(),
});

export const relationships = [
  {
    field: 'user',
    type: 'oneOf',
    target: 'user',
  },
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
