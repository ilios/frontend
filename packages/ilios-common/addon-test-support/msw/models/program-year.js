import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    startYear: z.number().optional(),
    locked: z.boolean().optional(),
    archived: z.boolean().optional(),
    publishedAsTbd: z.boolean().optional(),
    published: z.boolean().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'program',
    type: 'oneOf',
    target: 'program',
  },
  {
    field: 'cohort',
    type: 'oneOf',
    target: 'cohort',
  },
  {
    field: 'directors',
    type: 'manyOf',
    target: 'user',
  },
  {
    field: 'competencies',
    type: 'manyOf',
    target: 'competency',
  },
  {
    field: 'programYearObjectives',
    type: 'manyOf',
    target: 'programYearObjective',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
];
