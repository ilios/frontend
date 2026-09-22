import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
});

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
