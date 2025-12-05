import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    room: z.string().optional(),
    site: z.string().optional(),
    url: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export const relations = [
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
    field: 'learners',
    type: 'manyOf',
    target: 'user',
  },
  {
    field: 'instructors',
    type: 'manyOf',
    target: 'user',
  },
];
