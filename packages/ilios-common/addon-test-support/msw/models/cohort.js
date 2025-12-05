import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'programYear',
    type: 'oneOf',
    target: 'programYear',
  },
  {
    field: 'courses',
    type: 'manyOf',
    target: 'course',
  },
  {
    field: 'learnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
  },
  {
    field: 'users',
    type: 'manyOf',
    target: 'user',
  },
];
