import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    room: z.string().nullish(),
    site: z.string().nullish(),
    url: z.string().nullish(),
    startDate: z.string().nullish(),
    endDate: z.string().nullish(),
    updatedAt: z.string().nullish(),
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
