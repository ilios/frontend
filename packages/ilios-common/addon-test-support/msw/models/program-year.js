import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    startYear: z.number().nullish(),
    locked: z.boolean().nullish(),
    archived: z.boolean().nullish(),
    publishedAsTbd: z.boolean().nullish(),
    published: z.boolean().nullish(),
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
