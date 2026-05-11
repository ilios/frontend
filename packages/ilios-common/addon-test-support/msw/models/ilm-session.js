import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    hours: z.number().optional(),
    dueDate: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'session',
    type: 'oneOf',
    target: 'session',
  },
  {
    field: 'learnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
  },
  {
    field: 'instructorGroups',
    type: 'manyOf',
    target: 'instructorGroup',
  },
  {
    field: 'instructors',
    type: 'manyOf',
    target: 'user',
  },
  {
    field: 'learners',
    type: 'manyOf',
    target: 'user',
  },
];
