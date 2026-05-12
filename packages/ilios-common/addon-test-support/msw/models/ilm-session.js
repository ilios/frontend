import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  hours: z.number(),
  dueDate: z.date(),
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
