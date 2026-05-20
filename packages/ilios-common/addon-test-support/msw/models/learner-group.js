import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  location: z.string().nullish(),
  url: z.string().nullish(),
  needsAccommodation: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'cohort',
    type: 'oneOf',
    target: 'cohort',
  },
  {
    field: 'parent',
    type: 'oneOf',
    target: 'learnerGroup',
    role: 'children',
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'learnerGroup',
    role: 'children',
  },
  {
    field: 'ilmSessions',
    type: 'manyOf',
    target: 'ilmSession',
  },
  {
    field: 'offerings',
    type: 'manyOf',
    target: 'offering',
  },
  {
    field: 'instructorGroups',
    type: 'manyOf',
    target: 'instructorGroup',
  },
  {
    field: 'users',
    type: 'manyOf',
    target: 'user',
    role: 'learnerGroupUsers',
  },
  {
    field: 'instructors',
    type: 'manyOf',
    target: 'user',
    role: 'learnerGroupInstructors',
  },
  {
    field: 'ancestor',
    type: 'oneOf',
    target: 'learnerGroup',
    role: 'descendants',
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'learnerGroup',
    role: 'descendants',
  },
];
