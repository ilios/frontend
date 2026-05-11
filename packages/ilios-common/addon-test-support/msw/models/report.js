import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    subject: z.string().optional(),
    prepositionalObject: z.string().optional(),
    prepositionalObjectTableRowId: z.string().optional(),
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
