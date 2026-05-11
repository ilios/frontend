import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().nullish(),
    subject: z.string().nullish(),
    prepositionalObject: z.string().nullish(),
    prepositionalObjectTableRowId: z.string().nullish(),
  })
  .passthrough();

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
