import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  room: z.string().nullish(),
  site: z.string().nullish(),
  url: z.string().nullish(),
  startDate: z.date(),
  endDate: z.date(),
  updatedAt: z.date(),
});

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
