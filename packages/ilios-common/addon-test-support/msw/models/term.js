import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

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
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'term',
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
