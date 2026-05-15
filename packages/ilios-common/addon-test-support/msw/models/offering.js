import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  room: z.string().nullish(),
  site: z.string().nullish(),
  url: z.string().nullish(),
  startDate: z.iso.datetime({ offset: true, local: true }),
  endDate: z.iso.datetime({ offset: true, local: true }),
  updatedAt: z.iso.datetime({ offset: true, local: true }),
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
    role: 'offeringLearner',
  },
  {
    field: 'instructors',
    type: 'manyOf',
    target: 'user',
    role: 'offeringInstructor',
  },
];
