import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().nullish(),
    location: z.string().nullish(),
    url: z.string().nullish(),
    needsAccommodation: z.boolean().nullish(),
  })
  .passthrough();

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
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'learnerGroup',
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
  },
  {
    field: 'instructors',
    type: 'manyOf',
    target: 'user',
  },
  {
    field: 'ancestor',
    type: 'oneOf',
    target: 'learnerGroup',
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'learnerGroup',
  },
];
