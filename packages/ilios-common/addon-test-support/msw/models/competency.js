import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'parent',
    type: 'oneOf',
    target: 'competency',
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'competency',
  },
  {
    field: 'aamcPcrses',
    type: 'manyOf',
    target: 'aamcPcrs',
  },
  {
    field: 'programYears',
    type: 'manyOf',
    target: 'programYear',
  },
  {
    field: 'programYearObjectives',
    type: 'manyOf',
    target: 'programYearObjective',
  },
];
