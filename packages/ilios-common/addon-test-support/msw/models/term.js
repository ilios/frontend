import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  active: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'vocabulary',
    type: 'oneOf',
    target: 'vocabulary',
  },
  {
    field: 'parent',
    type: 'oneOf',
    target: 'term',
    role: 'children',
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'term',
    role: 'children',
  },
  {
    field: 'programYears',
    type: 'manyOf',
    target: 'programYear',
  },
  {
    field: 'sessions',
    type: 'manyOf',
    target: 'session',
  },
  {
    field: 'courses',
    type: 'manyOf',
    target: 'course',
  },
  {
    field: 'aamcResourceTypes',
    type: 'manyOf',
    target: 'aamcResourceType',
  },
  {
    field: 'courseObjectives',
    type: 'manyOf',
    target: 'courseObjective',
  },
  {
    field: 'programYearObjectives',
    type: 'manyOf',
    target: 'programYearObjective',
  },
  {
    field: 'sessionObjectives',
    type: 'manyOf',
    target: 'sessionObjective',
  },
];
