import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'learnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
  },
  {
    field: 'ilmSessions',
    type: 'manyOf',
    target: 'ilmSession',
  },
  {
    field: 'users',
    type: 'manyOf',
    target: 'user',
  },
  {
    field: 'offerings',
    type: 'manyOf',
    target: 'offering',
  },
];
